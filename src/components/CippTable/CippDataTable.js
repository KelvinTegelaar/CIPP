import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  SvgIcon,
} from '@mui/material'
import { ResourceUnavailable } from '../resource-unavailable'
import { ResourceError } from '../resource-error'
import { Scrollbar } from '../scrollbar'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { ApiGetCallWithPagination } from '../../api/ApiCall'
import { utilTableMode } from './util-tablemode'
import { utilColumnsFromAPI, resolveSimpleColumnVariables } from './util-columnsFromAPI'
import { CIPPTableToptoolbar } from './CIPPTableToptoolbar'
import { Info, More, MoreHoriz } from '@mui/icons-material'
import { CippOffCanvas } from '../CippComponents/CippOffCanvas'
import { useDialog } from '../../hooks/use-dialog'
import { CippApiDialog } from '../CippComponents/CippApiDialog'
import { getCippError } from '../../utils/get-cipp-error'
import { Box } from '@mui/system'
import { useSettings } from '../../hooks/use-settings'
import { isEqual } from 'lodash' // Import lodash for deep comparison
import { useLicenseBackfill } from '../../hooks/use-license-backfill'

// Resolve dot-delimited property paths against arbitrary data objects.
const getNestedValue = (source, path) => {
  if (!source) {
    return undefined
  }
  if (!path) {
    return source
  }

  return path.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) {
      return undefined
    }
    if (typeof acc !== 'object') {
      return undefined
    }
    return acc[key]
  }, source)
}

// Resolve dot-delimited column ids against the original row data so nested fields can sort/filter properly.
const getRowValueByColumnId = (row, columnId) => {
  if (!row?.original || !columnId) {
    return undefined
  }

  if (columnId.includes('@odata')) {
    return row.original[columnId]
  }

  return getNestedValue(row.original, columnId)
}

const compareNullable = (aVal, bVal) => {
  if (aVal === null && bVal === null) {
    return 0
  }
  if (aVal === null) {
    return 1
  }
  if (bVal === null) {
    return -1
  }
  if (aVal === bVal) {
    return 0
  }
  return aVal > bVal ? 1 : -1
}

// ── Module-level constants ──────────────────────────────────────────────────
// These never change between renders, so extracting them avoids creating new
// object references on every render cycle.

const SORTING_FNS = {
  dateTimeNullsLast: (a, b, id) => {
    const aRaw = getRowValueByColumnId(a, id)
    const bRaw = getRowValueByColumnId(b, id)
    const aDate = aRaw ? new Date(aRaw) : null
    const bDate = bRaw ? new Date(bRaw) : null
    const aTime = aDate && !Number.isNaN(aDate.getTime()) ? aDate.getTime() : null
    const bTime = bDate && !Number.isNaN(bDate.getTime()) ? bDate.getTime() : null

    return compareNullable(aTime, bTime)
  },
  number: (a, b, id) => {
    const aRaw = getRowValueByColumnId(a, id)
    const bRaw = getRowValueByColumnId(b, id)
    const aNum = typeof aRaw === 'number' ? aRaw : Number(aRaw)
    const bNum = typeof bRaw === 'number' ? bRaw : Number(bRaw)
    const aVal = Number.isNaN(aNum) ? null : aNum
    const bVal = Number.isNaN(bNum) ? null : bNum

    return compareNullable(aVal, bVal)
  },
  boolean: (a, b, id) => {
    const aRaw = getRowValueByColumnId(a, id)
    const bRaw = getRowValueByColumnId(b, id)
    const toBool = (value) => {
      if (value === null || value === undefined) {
        return null
      }
      if (typeof value === 'boolean') {
        return value
      }
      if (typeof value === 'string') {
        const lower = value.toLowerCase()
        if (lower === 'true' || lower === 'yes') {
          return true
        }
        if (lower === 'false' || lower === 'no') {
          return false
        }
      }
      if (typeof value === 'number') {
        return value !== 0
      }
      return null
    }

    const aBool = toBool(aRaw)
    const bBool = toBool(bRaw)
    const aNumeric = aBool === null ? null : aBool ? 1 : 0
    const bNumeric = bBool === null ? null : bBool ? 1 : 0

    return compareNullable(aNumeric, bNumeric)
  },
}

const FILTER_FNS = {
  notContains: (row, columnId, value) => {
    const rowValue = row.getValue(columnId)
    if (rowValue === null || rowValue === undefined) {
      return false
    }

    const stringValue = String(rowValue)
    if (
      stringValue.includes('[object Object]') ||
      !stringValue.toLowerCase().includes(value.toLowerCase())
    ) {
      return true
    } else {
      return false
    }
  },
  regex: (row, columnId, value) => {
    try {
      const regex = new RegExp(value, 'i')
      const rowValue = row.getValue(columnId)
      if (typeof rowValue === 'string' && !rowValue.includes('[object Object]')) {
        return regex.test(rowValue)
      }
      return false
    } catch (error) {
      // If regex is invalid, don't filter
      return true
    }
  },
}

const MUI_TABLE_HEAD_CELL_PROPS = {
  sx: {
    '& .MuiTableCell-root': {
      padding: '8px 16px',
    },
    '& .MuiAutocomplete-root': {
      width: '100%',
    },
    '& .MuiAutocomplete-root .MuiInputBase-root': {
      height: '40px !important',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'flex',
      flexWrap: 'nowrap',
    },
    '& .MuiAutocomplete-root .MuiInputBase-root .MuiInputBase-input': {
      height: '24px',
      minHeight: '24px',
      maxHeight: '24px',
    },
    '& .MuiInputBase-root': {
      height: '40px !important',
    },
    '& .MuiInputBase-input': {
      height: '24px',
      minHeight: '24px',
      maxHeight: '24px',
    },
    '& .MuiChip-label.MuiChip-labelMedium': {
      maxWidth: '80px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      padding: '0 4px',
    },
    '& .MuiChip-root': {
      height: '24px',
      maxHeight: '24px',
      '&::before': {
        content: 'attr(data-label)',
        display: 'none',
      },
      '&:hover::before': {
        display: 'block',
        position: 'absolute',
        top: '-25px',
        left: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        zIndex: 9999,
      },
    },
  },
}

const MUI_TABLE_BODY_CELL_ON_COPY = (e) => {
  const sel = window.getSelection()?.toString() ?? ''
  if (sel) {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent?.stopImmediatePropagation?.()
    e.clipboardData.setData('text/plain', sel)
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(sel).catch(() => {})
    }
  }
}

const MUI_TABLE_BODY_CELL_PROPS = { onCopy: MUI_TABLE_BODY_CELL_ON_COPY }

const MRT_THEME = (theme) => ({
  baseBackgroundColor: theme.palette.background.paper,
})

// Compute a lightweight "schema key" from data to decide whether columns need recomputing.
// Only looks at the keys of the first few rows rather than deep-comparing the full dataset.
const computeSchemaKey = (data) => {
  if (!Array.isArray(data) || data.length === 0) return ''
  const sample = data.slice(0, 3)
  const keys = new Set()
  for (const row of sample) {
    if (row && typeof row === 'object') {
      for (const k of Object.keys(row)) keys.add(k)
    }
  }
  return [...keys].sort().join(',') + '|' + data.length
}

// ── Module-level render helpers for filter mode menus ──────────────────────
function renderGlobalFilterModeMenuItemsFn({ internalFilterOptions, onSelectFilterMode }) {
  const customFilterOptions = [
    {
      option: 'regex',
      label: 'Regex',
      symbol: '(.*)',
    },
  ]

  customFilterOptions.forEach((filterOption) => {
    if (!internalFilterOptions.some((option) => option.option === filterOption.option)) {
      internalFilterOptions.push(filterOption)
    }
  })

  return internalFilterOptions.map((filterOption) => (
    <MenuItem
      key={filterOption.option}
      onClick={() => onSelectFilterMode(filterOption.option)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span style={{ width: '20px', textAlign: 'center' }}>{filterOption.symbol}</span>
      <ListItemText>{filterOption.label}</ListItemText>
    </MenuItem>
  ))
}

function renderColumnFilterModeMenuItemsFn({ internalFilterOptions, onSelectFilterMode }) {
  const customFilterOptions = [
    {
      option: 'notContains',
      label: 'Not Contains',
      symbol: '!*',
    },
    {
      option: 'regex',
      label: 'Regex',
      symbol: '(.*)',
    },
  ]

  const combinedFilterOptions = [...internalFilterOptions, ...customFilterOptions]

  return combinedFilterOptions.map((filterOption) => (
    <MenuItem
      key={filterOption.option}
      onClick={() => onSelectFilterMode(filterOption.option)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <span style={{ width: '20px', textAlign: 'center' }}>{filterOption.symbol}</span>
      <ListItemText>{filterOption.label}</ListItemText>
    </MenuItem>
  ))
}

export const CippDataTable = (props) => {
  const {
    queryKey,
    data = [],
    columns = [],
    api = {},
    isFetching = false,
    columnVisibility: initialColumnVisibility = {
      id: false,
      RowKey: false,
      ETag: false,
      PartitionKey: false,
      Timestamp: false,
      TableTimestamp: false,
    },
    exportEnabled = true,
    simpleColumns = [],
    actions,
    title = 'Report',
    simple = false,
    cardButton,
    offCanvas = false,
    offCanvasOnRowClick = false,
    noCard = false,
    hideTitle = false,
    refreshFunction,
    incorrectDataMessage = 'Data not in correct format',
    onChange,
    filters,
    maxHeightOffset = '380px',
    defaultSorting = [],
    isInDialog = false,
    showBulkExportAction = true,
  } = props

  // Create a map of column IDs to their filterType for quick lookup
  const filterTypeMap = useMemo(() => {
    if (!filters || !Array.isArray(filters)) return {}
    return filters.reduce((acc, filter) => {
      if (filter.value && Array.isArray(filter.value)) {
        filter.value.forEach((v) => {
          if (v.id && filter.filterType) {
            acc[v.id] = filter.filterType
          }
        })
      }
      return acc
    }, {})
  }, [filters])

  // Track if initial filters have been applied
  const filtersInitializedRef = useRef(false)
  const previousFiltersRef = useRef(null)

  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility)
  const [configuredSimpleColumns, setConfiguredSimpleColumns] = useState(simpleColumns)
  const [usedData, setUsedData] = useState(data)
  const [usedColumns, setUsedColumns] = useState([])
  const [offcanvasVisible, setOffcanvasVisible] = useState(false)
  const [offCanvasData, setOffCanvasData] = useState({})
  const [offCanvasRowIndex, setOffCanvasRowIndex] = useState(0)
  const [filteredRows, setFilteredRows] = useState([])
  const [customComponentData, setCustomComponentData] = useState({})
  const [customComponentVisible, setCustomComponentVisible] = useState(false)
  const [actionData, setActionData] = useState({ data: {}, action: {}, ready: false })
  const [graphFilterData, setGraphFilterData] = useState({})
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const waitingBool = api?.url ? true : false

  const settings = useSettings()

  // Hook to trigger re-render when license backfill completes
  const { updateTrigger } = useLicenseBackfill()

  // Ref to track previous schema key so we only recompute columns when the data shape changes.
  const prevSchemaKeyRef = useRef('')
  // Ref to track previous data reference for the static-data sync effect.
  const prevDataRef = useRef(data)

  const getRequestData = ApiGetCallWithPagination({
    url: api.url,
    data: { ...api.data },
    queryKey: queryKey ? queryKey : title,
    waiting: waitingBool,
    ...graphFilterData,
  })

  useEffect(() => {
    // Only set initial filters if they haven't been set yet OR if the filters prop has actually changed
    const filtersChanged = !isEqual(filters, previousFiltersRef.current)

    if (
      filters &&
      Array.isArray(filters) &&
      filters.length > 0 &&
      (!filtersInitializedRef.current || filtersChanged)
    ) {
      // Only auto-apply filters that are in MRT column-filter format ({ id, value }).
      // Preset objects ({ filterName, value, type }) are toolbar buttons only — applying them
      // directly sets id=undefined which causes MRT to throw.
      const columnFormatFilters = filters.filter((f) => f.id !== undefined)

      if (columnFormatFilters.length > 0) {
        const processedFilters = columnFormatFilters.map((filter) => {
          if (filter.filterType === 'equal') {
            return {
              ...filter,
              value: Array.isArray(filter.value) ? filter.value : [filter.value],
            }
          }
          return filter
        })
        setColumnFilters(processedFilters)
      }

      filtersInitializedRef.current = true
      previousFiltersRef.current = filters
    }
  }, [filters])

  // Sync static data prop into usedData (only when not using API).
  // We avoid including usedData in the dependency array to prevent the expensive
  // isEqual check from running on every API-driven data change.
  useEffect(() => {
    if (Array.isArray(data) && !api?.url) {
      // Only update if the data prop reference actually changed.
      if (data !== prevDataRef.current) {
        prevDataRef.current = data
        setUsedData(data)
      }
    }
  }, [data, api?.url])

  useEffect(() => {
    if (getRequestData.isSuccess && !getRequestData.isFetching) {
      const lastPage = getRequestData.data?.pages[getRequestData.data.pages.length - 1]
      const nextLinkExists = lastPage?.Metadata?.nextLink
      if (nextLinkExists) {
        getRequestData.fetchNextPage()
      }
    }
  }, [getRequestData.data?.pages?.length, getRequestData.isFetching, queryKey])

  useEffect(() => {
    if (getRequestData.isSuccess) {
      const allPages = getRequestData.data.pages

      const combinedResults = allPages.flatMap((page) => {
        const nestedData = getNestedValue(page, api.dataKey)
        return nestedData !== undefined ? nestedData : []
      })
      setUsedData(combinedResults)
    }
  }, [
    getRequestData.isSuccess,
    getRequestData.data,
    api.dataKey,
    getRequestData.isFetching,
    queryKey,
  ])

  // Derive columns from data — only when the data schema actually changes.
  useEffect(() => {
    if (
      !Array.isArray(usedData) ||
      usedData.length === 0 ||
      typeof usedData[0] !== 'object' ||
      usedData === null ||
      usedData === undefined
    ) {
      return
    }

    const schemaKey = computeSchemaKey(usedData)
    // Skip expensive column generation if the schema hasn't changed.
    if (schemaKey === prevSchemaKeyRef.current && usedColumns.length > 0) {
      return
    }
    prevSchemaKeyRef.current = schemaKey

    const apiColumns = utilColumnsFromAPI(usedData)

    // Apply custom filterFn to columns that have filterType === 'equal'
    const enhancedApiColumns = apiColumns.map((col) => {
      if (filterTypeMap[col.id] === 'equal') {
        return {
          ...col,
          filterFn: 'equals',
        }
      }
      return col
    })

    let finalColumns = []
    let newVisibility = { ...columnVisibility }

    // Check if we're in AllTenants mode and data has Tenant property
    const isAllTenants = settings?.currentTenant === 'AllTenants'
    const hasTenantProperty = usedData.some(
      (row) => row && typeof row === 'object' && 'Tenant' in row
    )
    const shouldShowTenant = isAllTenants && hasTenantProperty

    if (columns.length === 0 && configuredSimpleColumns.length === 0) {
      finalColumns = enhancedApiColumns
      enhancedApiColumns.forEach((col) => {
        newVisibility[col.id] = true
      })
    } else if (configuredSimpleColumns.length > 0) {
      // Resolve any variables in the simple columns before checking visibility
      const resolvedSimpleColumns = resolveSimpleColumnVariables(configuredSimpleColumns, usedData)

      // Add Tenant to resolved columns if in AllTenants mode and not already included
      let finalResolvedColumns = [...resolvedSimpleColumns]
      if (shouldShowTenant && !resolvedSimpleColumns.includes('Tenant')) {
        finalResolvedColumns = [...resolvedSimpleColumns, 'Tenant']
      }

      finalColumns = enhancedApiColumns
      finalColumns.forEach((col) => {
        if (col.id !== undefined) {
          newVisibility[col.id] = finalResolvedColumns.includes(col.id)
        }
      })
    } else {
      const providedColumnKeys = new Set(columns.map((col) => col.id || col.header))
      finalColumns = [
        ...columns,
        ...enhancedApiColumns.filter((col) => !providedColumnKeys.has(col.id)),
      ]
      finalColumns.forEach((col) => {
        const key = col.id ?? col.accessorKey
        if (key !== undefined) {
          newVisibility[key] = providedColumnKeys.has(col.id)
        }
      })

      // Handle Tenant column for custom columns case
      if (shouldShowTenant) {
        const tenantColumn = finalColumns.find((col) => col.id === 'Tenant')
        if (tenantColumn) {
          // Make tenant visible
          newVisibility['Tenant'] = true
        }
      }
    }
    if (defaultSorting?.length > 0) {
      setSorting(defaultSorting)
    }
    setUsedColumns(finalColumns)
    setColumnVisibility(newVisibility)
  }, [columns.length, usedData, queryKey, settings?.currentTenant, filterTypeMap])

  const createDialog = useDialog()

  // Compute modeInfo via useMemo so it stays stable but updates when relevant inputs change.
  const modeInfo = useMemo(
    () =>
      utilTableMode(
        columnVisibility,
        simple,
        actions,
        configuredSimpleColumns,
        offCanvas,
        onChange,
        maxHeightOffset,
        settings
      ),
    [simple, !!actions, !!offCanvas, !!onChange, maxHeightOffset, settings?.tablePageSize?.value]
  )

  // Include updateTrigger in data memo to force re-render when license backfill completes
  const memoizedData = useMemo(() => usedData, [usedData, updateTrigger])

  // Sanitize columnVisibility to remove any undefined/invalid keys before passing to MRT
  const sanitizedColumnVisibility = useMemo(() => {
    const result = {}
    for (const key of Object.keys(columnVisibility)) {
      if (key !== 'undefined' && key !== undefined) result[key] = columnVisibility[key]
    }
    return result
  }, [columnVisibility])

  const handleActionDisabled = useCallback((row, action) => {
    if (action?.condition) {
      return !action.condition(row)
    }
    return false
  }, [])

  // Stable callback for sorting changes.
  const handleSortingChange = useCallback((newSorting) => {
    setSorting(newSorting ?? [])
  }, [])

  // Stable callback for muiTablePaperProps.
  const muiTablePaperProps = useCallback(
    ({ table }) => ({
      sx: {
        ...(table.getState().isFullScreen && {
          position: 'fixed !important',
          top: '64px !important',
          bottom: '0 !important',
          left: {
            xs: '0 !important',
            lg: settings?.sidebarCollapse ? '73px !important' : '270px !important',
          },
          right: '0 !important',
          zIndex: '1300 !important',
          m: '0 !important',
          p: '16px !important',
          overflow: 'auto',
          bgcolor: 'background.paper',
          maxWidth: 'none !important',
          width: 'auto !important',
          height: 'auto !important',
        }),
      },
    }),
    [settings?.sidebarCollapse]
  )

  // Memoize row click props for offCanvas navigation.
  const muiTableBodyRowProps = useMemo(() => {
    if (offCanvasOnRowClick && offCanvas) {
      return ({ row }) => ({
        onClick: () => {
          setOffCanvasData(row.original)
          const filteredRowsArray = table?.getFilteredRowModel?.()?.rows
          if (filteredRowsArray) {
            const indexInFiltered = filteredRowsArray.findIndex((r) => r.original === row.original)
            setOffCanvasRowIndex(indexInFiltered >= 0 ? indexInFiltered : 0)
          }
          setOffcanvasVisible(true)
        },
        sx: {
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        },
      })
    }
    return undefined
  }, [offCanvasOnRowClick, offCanvas])

  // Memoize the empty-rows fallback renderer.
  const queueMessage = getRequestData.data?.pages?.[0]?.Metadata?.QueueMessage
  const renderEmptyRowsFallback = useCallback(
    ({ table }) =>
      queueMessage ? (
        <Box sx={{ py: 4 }}>
          <center>
            <Info /> {queueMessage}
          </center>
        </Box>
      ) : undefined,
    [queueMessage]
  )

  // Compute the skeletons state value.
  const showSkeletons = getRequestData.isFetchingNextPage
    ? false
    : getRequestData.isFetching
      ? getRequestData.isFetching
      : isFetching

  // Memoize state object to avoid creating a new reference every render when values haven't changed.
  const tableState = useMemo(
    () => ({
      columnVisibility: sanitizedColumnVisibility,
      sorting,
      columnFilters,
      showSkeletons,
    }),
    [sanitizedColumnVisibility, sorting, columnFilters, showSkeletons]
  )

  // Memoize renderRowActionMenuItems to avoid re-creating on each render.
  const renderRowActionMenuItems = useMemo(() => {
    if (actions) {
      return ({ closeMenu, row }) => [
        actions.map((action, index) => (
          <MenuItem
            sx={{ color: action.color }}
            key={`actions-list-row-${index}`}
            onClick={() => {
              if (settings.currentTenant === 'AllTenants' && row.original?.Tenant) {
                settings.handleUpdate({
                  currentTenant: row.original.Tenant,
                })
              }

              if (action.noConfirm && action.customFunction) {
                action.customFunction(row.original, action, {})
                closeMenu()
                return
              }

              // Handle custom component differently
              if (typeof action.customComponent === 'function') {
                setCustomComponentData({ data: row.original, action: action })
                setCustomComponentVisible(true)
                closeMenu()
                return
              }

              // Standard dialog flow
              setActionData({
                data: row.original,
                action: action,
                ready: true,
              })
              createDialog.handleOpen()
              closeMenu()
            }}
            disabled={handleActionDisabled(row.original, action)}
          >
            <SvgIcon fontSize="small" sx={{ minWidth: '30px' }}>
              {action.icon}
            </SvgIcon>
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        )),
        offCanvas && (
          <MenuItem
            key={`actions-list-row-more`}
            onClick={() => {
              closeMenu()
              setOffCanvasData(row.original)
              // Find the index of this row in the filtered rows
              const filteredRowsArray = table.getFilteredRowModel().rows
              const indexInFiltered = filteredRowsArray.findIndex(
                (r) => r.original === row.original
              )
              setOffCanvasRowIndex(indexInFiltered >= 0 ? indexInFiltered : 0)
              setOffcanvasVisible(true)
            }}
          >
            <SvgIcon fontSize="small" sx={{ minWidth: '30px' }}>
              <MoreHoriz />
            </SvgIcon>
            More Info
          </MenuItem>
        ),
      ]
    }

    if (offCanvas) {
      return ({ closeMenu, row }) => (
        <MenuItem
          onClick={() => {
            closeMenu()
            setOffCanvasData(row.original)
            const filteredRowsArray = table.getFilteredRowModel().rows
            const indexInFiltered = filteredRowsArray.findIndex((r) => r.original === row.original)
            setOffCanvasRowIndex(indexInFiltered >= 0 ? indexInFiltered : 0)
            setOffcanvasVisible(true)
          }}
        >
          <ListItemIcon>
            <More fontSize="small" />
          </ListItemIcon>
          More Info
        </MenuItem>
      )
    }

    return undefined
  }, [actions, offCanvas, settings.currentTenant, handleActionDisabled, createDialog])

  // Stable renderTopToolbar — memoized so MaterialReactTable doesn't re-create the toolbar
  // component on every parent render.
  const renderTopToolbar = useCallback(
    ({ table }) => {
      return (
        <>
          {!simple && (
            <CIPPTableToptoolbar
              table={table}
              api={api}
              queryKey={queryKey}
              simpleColumns={simpleColumns}
              data={data}
              columnVisibility={columnVisibility}
              getRequestData={getRequestData}
              usedColumns={usedColumns}
              usedData={memoizedData ?? []}
              title={title}
              actions={actions}
              exportEnabled={exportEnabled}
              refreshFunction={refreshFunction}
              setColumnVisibility={setColumnVisibility}
              filters={filters}
              queryKeys={queryKey ? queryKey : title}
              graphFilterData={graphFilterData}
              setGraphFilterData={setGraphFilterData}
              setConfiguredSimpleColumns={setConfiguredSimpleColumns}
              queueMetadata={getRequestData.data?.pages?.[0]?.Metadata}
              isInDialog={isInDialog}
              showBulkExportAction={showBulkExportAction}
            />
          )}
        </>
      )
    },
    [
      simple,
      api,
      queryKey,
      simpleColumns,
      data,
      columnVisibility,
      getRequestData,
      usedColumns,
      memoizedData,
      title,
      actions,
      exportEnabled,
      refreshFunction,
      filters,
      graphFilterData,
      isInDialog,
      showBulkExportAction,
    ]
  )

  const table = useMaterialReactTable({
    layoutMode: 'grid-no-grow',
    enableRowVirtualization: true,
    enableColumnVirtualization: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    rowVirtualizerOptions: {
      overscan: 5,
    },
    muiTableBodyCellProps: MUI_TABLE_BODY_CELL_PROPS,
    mrtTheme: MRT_THEME,
    muiTablePaperProps,
    muiTableBodyRowProps,
    enableColumnFilterModes: true,
    muiTableHeadCellProps: MUI_TABLE_HEAD_CELL_PROPS,
    initialState: {
      columnFilters: columnFilters,
      columnVisibility: sanitizedColumnVisibility,
    },
    columns: usedColumns,
    data: memoizedData ?? [],
    state: tableState,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    renderEmptyRowsFallback,
    onColumnVisibilityChange: setColumnVisibility,
    ...modeInfo,
    renderRowActionMenuItems,
    renderTopToolbar,
    sortingFns: SORTING_FNS,
    filterFns: FILTER_FNS,
    globalFilterFn: 'contains',
    enableGlobalFilterModes: true,
    renderGlobalFilterModeMenuItems: renderGlobalFilterModeMenuItemsFn,
    renderColumnFilterModeMenuItems: renderColumnFilterModeMenuItemsFn,
  })

  // Remove the useEffect that was resetting filters on table changes
  // The initial filter application is now handled by the columnFilters state
  // and the useEffect above that only triggers on actual filter prop changes

  useEffect(() => {
    if (onChange && table.getSelectedRowModel().rows) {
      onChange(table.getSelectedRowModel().rows.map((row) => row.original))
    }
  }, [table.getSelectedRowModel().rows])

  useEffect(() => {
    // Update filtered rows whenever table filtering/sorting changes
    if (table && table.getFilteredRowModel) {
      const rows = table.getFilteredRowModel().rows
      setFilteredRows(rows.map((row) => row.original))
    }
  }, [
    table,
    table.getState().columnFilters,
    table.getState().globalFilter,
    table.getState().sorting,
  ])

  useEffect(() => {
    //check if the simplecolumns are an array,
    if (Array.isArray(simpleColumns) && simpleColumns.length > 0) {
      setConfiguredSimpleColumns(simpleColumns)
    }
  }, [simpleColumns])

  return (
    <>
      {noCard ? (
        <Scrollbar>
          {!Array.isArray(usedData) && usedData ? (
            <ResourceUnavailable message={incorrectDataMessage} />
          ) : (
            <>
              {(getRequestData.isSuccess || getRequestData.data?.pages.length >= 0 || data) && (
                <MaterialReactTable table={table} />
              )}
            </>
          )}
          {getRequestData.isError && !getRequestData.isFetchNextPageError && (
            <ResourceError
              onReload={() => getRequestData.refetch()}
              message={`Error Loading data:  ${getCippError(getRequestData.error)}`}
            />
          )}
        </Scrollbar>
      ) : (
        // Render the table inside a Card
        <Card style={{ width: '100%' }} {...props.cardProps}>
          {cardButton || !hideTitle ? (
            <>
              <CardHeader
                action={cardButton}
                title={hideTitle ? '' : title}
                {...props.cardHeaderProps}
              />
              <Divider />
            </>
          ) : null}
          <CardContent sx={{ padding: '1rem' }}>
            <Scrollbar>
              {!Array.isArray(usedData) && usedData ? (
                <ResourceUnavailable message={incorrectDataMessage} />
              ) : (
                <>
                  {(getRequestData.isSuccess ||
                    getRequestData.data?.pages.length >= 0 ||
                    (data && !getRequestData.isError)) && <MaterialReactTable table={table} />}
                </>
              )}
              {getRequestData.isError && !getRequestData.isFetchNextPageError && (
                <ResourceError
                  onReload={() => getRequestData.refetch()}
                  message={`Error Loading data:  ${getCippError(getRequestData.error)}`}
                />
              )}
            </Scrollbar>
          </CardContent>
        </Card>
      )}
      <CippOffCanvas
        isFetching={getRequestData.isFetching}
        visible={offcanvasVisible}
        onClose={() => setOffcanvasVisible(false)}
        extendedData={offCanvasData}
        extendedInfoFields={offCanvas?.extendedInfoFields}
        actions={actions}
        title={offCanvasData?.Name || offCanvas?.title || 'Extended Info'}
        children={
          offCanvas?.children ? (row) => offCanvas.children(row, offCanvasRowIndex) : undefined
        }
        customComponent={offCanvas?.customComponent}
        onNavigateUp={() => {
          const newIndex = offCanvasRowIndex - 1
          if (newIndex >= 0 && filteredRows && filteredRows[newIndex]) {
            setOffCanvasRowIndex(newIndex)
            setOffCanvasData(filteredRows[newIndex])
          }
        }}
        onNavigateDown={() => {
          const newIndex = offCanvasRowIndex + 1
          if (filteredRows && newIndex < filteredRows.length) {
            setOffCanvasRowIndex(newIndex)
            setOffCanvasData(filteredRows[newIndex])
          }
        }}
        canNavigateUp={offCanvasRowIndex > 0}
        canNavigateDown={filteredRows && offCanvasRowIndex < filteredRows.length - 1}
        {...offCanvas}
      />
      {/* Render custom component */}
      {customComponentVisible &&
        customComponentData?.action &&
        typeof customComponentData.action.customComponent === 'function' &&
        customComponentData.action.customComponent(customComponentData.data, {
          drawerVisible: customComponentVisible,
          setDrawerVisible: setCustomComponentVisible,
          fromRowAction: true,
        })}

      {/* Render standard dialog */}
      {useMemo(() => {
        if (
          !actionData.ready ||
          (actionData.action && typeof actionData.action.customComponent === 'function')
        )
          return null
        return (
          <CippApiDialog
            createDialog={createDialog}
            title="Confirmation"
            fields={actionData.action?.fields}
            api={actionData.action}
            row={actionData.data}
            relatedQueryKeys={queryKey ? queryKey : title}
            {...actionData.action}
          />
        )
      }, [actionData.ready, createDialog, actionData.action, actionData.data, queryKey, title])}
    </>
  )
}
