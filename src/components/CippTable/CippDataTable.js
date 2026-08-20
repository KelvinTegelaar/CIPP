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
  Typography,
} from '@mui/material'
import { ResourceUnavailable } from '../resource-unavailable'
import { ResourceError } from '../resource-error'
import { Scrollbar } from '../scrollbar'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { ApiGetCallWithPagination } from '../../api/ApiCall'
import { utilTableMode } from './util-tablemode'
import {
  utilColumnsFromAPI,
  resolveSimpleColumnVariables,
} from './util-columnsFromAPI'
import { CIPPTableToptoolbar } from './CIPPTableToptoolbar'
import { Info, More, MoreHoriz } from '@mui/icons-material'
import { CippOffCanvas } from '../CippComponents/CippOffCanvas'
import { useDialog } from '../../hooks/use-dialog'
import { CippApiDialog } from '../CippComponents/CippApiDialog'
import { getCippError } from '../../utils/get-cipp-error'
import { Box, Stack } from '@mui/system'
import { useSettings } from '../../hooks/use-settings'
import { parseCippDate } from '../../utils/parse-cipp-date'
import { isEqual } from 'lodash' // Import lodash for deep comparison
import { useLicenseBackfill } from '../../hooks/use-license-backfill'
import { useTableViewMode, useIsNarrowForTables } from '../../hooks/use-breakpoint'
import { CippMobileCardList } from './CippMobileCardList'
import { CippPageActionsFab } from '../CippComponents/CippPageActionsFab'
import CippDataTableButton from './CippDataTableButton'
import { CippTableCardButton } from './CippTableCardButton'
import {
  subTableIsSelected,
  subTableShowsCachedColumn,
  resolveSubTableSimpleColumns,
  getSubTableDisplayColumnIds,
  columnOrderHasStaleIds,
} from './util-subTables'
import { attachParentRow, getRowTenant } from '../../utils/resolve-row-templates'

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

// walk up from the card surface to the page's scrolling ancestor (LayoutContainer,
// overflowY auto) and align the surface with its top. the table flips in at the same
// page slot, so the height measurement taken right after reads a deterministic top
// and pages with content above the table keep the table in view
const scrollNodeToScrollableAncestorTop = (node) => {
  if (!node) {
    return
  }
  let ancestor = node.parentElement
  while (ancestor && ancestor !== document.body) {
    const overflowY = window.getComputedStyle(ancestor).overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') {
      ancestor.scrollTop += node.getBoundingClientRect().top - ancestor.getBoundingClientRect().top
      return
    }
    ancestor = ancestor.parentElement
  }
  window.scrollTo(0, window.scrollY + node.getBoundingClientRect().top)
}

/**
 * Column order for a user-curated selection: the selected ids first, in selection order,
 * then everything else in its existing order. Exported for tests.
 *
 * MRT only reads initialState.columnOrder once, so when the graph filter swaps in a new
 * \$select list after mount, the new columns (dot-delimited nested fields included) were
 * appended last — and the card view's three detail slots are filled in column order, so a
 * field the user explicitly selected was exactly the one that overflowed into "+N more".
 */
export const orderColumnsBySelection = (allIds, selectedIds) => {
  const selected = selectedIds.filter((id) => allIds.includes(id))
  const rest = allIds.filter((id) => !selected.includes(id))
  return [...selected, ...rest]
}

// ── Module-level constants ──────────────────────────────────────────────────
// These never change between renders, so extracting them avoids creating new
// object references on every render cycle.

// Stable ref so an undefined `data` prop doesn't create a fresh [] each render
// and loop the static-data sync effect.
const EMPTY_ARRAY = []

const buildSubTableColumn = (sub) => ({
  id: sub.id,
  header: sub.header ?? sub.id,
  size: sub.size ?? 120,
  minSize: sub.minSize ?? 100,
  enableSorting: false,
  enableColumnFilter: false,
  enableGlobalFilter: false,
  accessorFn: (row) => {
    if (typeof sub.label === 'function') {
      return sub.label(row)
    }
    return sub.label ?? 'View'
  },
  Cell: ({ row }) => (
    <CippDataTableButton
      row={row.original}
      label={sub.label}
      condition={sub.condition}
      tableTitle={sub.header}
      {...(sub.table ?? {})}
    />
  ),
})

const SORTING_FNS = {
  dateTimeNullsLast: (a, b, id) => {
    const aRaw = getRowValueByColumnId(a, id)
    const bRaw = getRowValueByColumnId(b, id)
    const aDate = aRaw ? parseCippDate(aRaw) : null
    const bDate = bRaw ? parseCippDate(bRaw) : null
    const aTime =
      aDate && !Number.isNaN(aDate.getTime()) ? aDate.getTime() : null
    const bTime =
      bDate && !Number.isNaN(bDate.getTime()) ? bDate.getTime() : null

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
      if (
        typeof rowValue === 'string' &&
        !rowValue.includes('[object Object]')
      ) {
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
function renderGlobalFilterModeMenuItemsFn({
  internalFilterOptions,
  onSelectFilterMode,
}) {
  const customFilterOptions = [
    {
      option: 'regex',
      label: 'Regex',
      symbol: '(.*)',
    },
  ]

  customFilterOptions.forEach((filterOption) => {
    if (
      !internalFilterOptions.some(
        (option) => option.option === filterOption.option
      )
    ) {
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
      <span style={{ width: '20px', textAlign: 'center' }}>
        {filterOption.symbol}
      </span>
      <ListItemText>{filterOption.label}</ListItemText>
    </MenuItem>
  ))
}

function renderColumnFilterModeMenuItemsFn({
  internalFilterOptions,
  onSelectFilterMode,
}) {
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

  const combinedFilterOptions = [
    ...internalFilterOptions,
    ...customFilterOptions,
  ]

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
      <span style={{ width: '20px', textAlign: 'center' }}>
        {filterOption.symbol}
      </span>
      <ListItemText>{filterOption.label}</ListItemText>
    </MenuItem>
  ))
}

export const CippDataTable = (props) => {
  const {
    queryKey,
    data = EMPTY_ARRAY,
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
    dataFilter,
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
    viewMode: viewModeProp,
    mobileCard,
    dataSourceControls,
    subTables = EMPTY_ARRAY,
    persistenceKey,
    parentRow,
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

  const [columnVisibility, setColumnVisibility] = useState(
    initialColumnVisibility
  )
  const [configuredSimpleColumns, setConfiguredSimpleColumns] =
    useState(simpleColumns)
  const [usedData, setUsedData] = useState(data)
  const [usedColumns, setUsedColumns] = useState([])
  const lastOrderedSelectionRef = useRef(null)
  const [offcanvasVisible, setOffcanvasVisible] = useState(false)
  const [offCanvasData, setOffCanvasData] = useState({})
  const [offCanvasRowIndex, setOffCanvasRowIndex] = useState(0)
  const [customComponentData, setCustomComponentData] = useState({})
  const [customComponentVisible, setCustomComponentVisible] = useState(false)
  const [actionData, setActionData] = useState({
    data: {},
    action: {},
    ready: false,
  })
  const [graphFilterData, setGraphFilterData] = useState({})
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const waitingBool = api?.url ? true : false

  // The cards branch and the renderTopToolbar branch are two alternating CIPPTableToptoolbar
  // instances (only one is ever mounted), so state that must survive the cards<->table flip
  // lives here and is passed down as props to both.
  const [activeFilters, setActiveFilters] = useState({ graph: null, table: null })
  const [searchValue, setSearchValue] = useState('')
  const restoredFiltersRef = useRef(new Set())

  const settings = useSettings()
  const router = useRouter()
  const routerPageName = router.pathname.split('/').slice(1).join('/')
  const pageName = persistenceKey ?? (isInDialog ? '' : routerPageName)

  // 'cards' below the md breakpoint (or when forced via settings/prop), 'table' otherwise.
  // simple tables always resolve to 'table'.
  const resolvedViewMode = useTableViewMode({ viewMode: viewModeProp, simple })
  // same pivot as the cards/table auto mode, so the FAB and the card list agree on width
  const isNarrowViewport = useIsNarrowForTables()
  // viewMode prop or simple is a hard force, the toggle never overrides it
  const toggleAllowed = !viewModeProp && !simple
  // Mobile select mode: checkboxes on cards + the bottom bulk bar. Lives here so the
  // toolbar (which renders the Select toggle) and the card list stay in sync. Picker
  // tables (onChange) force it on — selection is their entire purpose.
  const [mobileSelectMode, setMobileSelectMode] = useState(false)
  // portal target for the header's bulk-actions slot, set by the CardHeader's ref callback
  const [headerBulkSlot, setHeaderBulkSlot] = useState(null)

  // transient cards<->table override, session-only, never persisted
  const [viewOverride, setViewOverride] = useState(null)
  const effectiveViewMode = toggleAllowed ? (viewOverride ?? resolvedViewMode) : resolvedViewMode
  const isCardView = effectiveViewMode === 'cards'
  const tableViewActive = effectiveViewMode === 'table'
  const CardViewSurface = noCard ? Box : Card
  const [narrowTableMaxHeight, setNarrowTableMaxHeight] = useState(null)
  // way back button: table is only up because of the override, phone default is still cards
  const showReturnToCards = toggleAllowed && tableViewActive && resolvedViewMode === 'cards'

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
              value: Array.isArray(filter.value)
                ? filter.value
                : [filter.value],
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
      const lastPage =
        getRequestData.data?.pages[getRequestData.data.pages.length - 1]
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
      setUsedData(
        dataFilter ? combinedResults.filter(dataFilter) : combinedResults
      )
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
      const resolvedSimpleColumns = resolveSubTableSimpleColumns(
        resolveSimpleColumnVariables(
          configuredSimpleColumns,
          usedData
        ),
        subTables,
        usedData
      )

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
      // Selection order wins over data-key order — but only when the resolved selection
      // changed (including subTable cachedColumn swaps), so a data refetch doesn't
      // stomp a manual column reorder.
      const resolvedOrderKey = finalResolvedColumns.join('|')
      if (lastOrderedSelectionRef.current !== resolvedOrderKey) {
        lastOrderedSelectionRef.current = resolvedOrderKey
        const subTableIds = getSubTableDisplayColumnIds(
          subTables,
          configuredSimpleColumns,
          usedData
        )
        const allIds = [
          ...new Set([
            ...finalColumns.map((col) => col.id).filter(Boolean),
            ...subTableIds,
          ]),
        ]
        table.setColumnOrder(orderColumnsBySelection(allIds, finalResolvedColumns))
      }
    } else {
      const providedColumnKeys = new Set(
        columns.map((col) => col.id || col.header)
      )
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
  }, [
    columns.length,
    usedData,
    queryKey,
    settings?.currentTenant,
    filterTypeMap,
    subTables,
  ])

  // Previous-value refs for the guards below: CippDataTable is the single owner of this
  // state across both toolbar instances, so an effect can compare against the last value
  // it actually saw rather than firing unconditionally on every render.
  const prevTenantRef = useRef(settings?.currentTenant)
  const prevQueryKeyRef = useRef(queryKey || title)
  const prevPageNameRef = useRef(pageName)
  const appliedColumnDefaultsRef = useRef({})

  // if the currentTenant switches, remove graph filters and the active-filter highlight
  useEffect(() => {
    const currentTenant = settings?.currentTenant
    if (prevTenantRef.current === currentTenant) {
      return
    }
    prevTenantRef.current = currentTenant
    if (currentTenant) {
      setGraphFilterData({})
      setActiveFilters({ graph: null, table: null })
      restoredFiltersRef.current.delete(`${pageName}-graph`)
    }
  }, [settings?.currentTenant, pageName])

  // clear the active-filter highlight when the effective query key changes (tenant swap,
  // different queryKey/title)
  useEffect(() => {
    const effectiveKey = queryKey || title
    if (prevQueryKeyRef.current === effectiveKey) {
      return
    }
    prevQueryKeyRef.current = effectiveKey
    setActiveFilters({ graph: null, table: null })
  }, [queryKey, title])

  // clear persisted-filter restoration tracking only when the page actually changes
  useEffect(() => {
    if (prevPageNameRef.current === pageName) {
      return
    }
    prevPageNameRef.current = pageName
    restoredFiltersRef.current.clear()
  }, [pageName])

  // apply preferred columns once per page, and again whenever the saved preference's
  // identity changes. Nested dialog tables must not read or write the parent page key.
  useEffect(() => {
    if (!pageName) {
      return
    }
    const preferred = settings?.columnDefaults?.[pageName]
    if (
      preferred &&
      Object.keys(preferred).length > 0 &&
      appliedColumnDefaultsRef.current[pageName] !== preferred
    ) {
      appliedColumnDefaultsRef.current[pageName] = preferred
      setColumnVisibility(preferred)
    }
  }, [settings?.columnDefaults?.[pageName], pageName])

  const createDialog = useDialog()
  const hasActions = !!actions
  const hasOffCanvas = !!offCanvas
  const hasOnChange = !!onChange

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
        settings,
        effectiveViewMode,
        isNarrowViewport
      ),
    [
      simple,
      hasActions,
      hasOffCanvas,
      hasOnChange,
      maxHeightOffset,
      settings?.tablePageSize?.value,
      effectiveViewMode,
      isNarrowViewport,
    ]
  )

  // Include updateTrigger in data memo to force re-render when license backfill completes.
  // Also refresh data identity when derived columns change so TanStack re-runs filtering
  // for searches entered before columns are available.
  const memoizedData = useMemo(
    () => (Array.isArray(usedData) ? usedData.slice() : usedData),
    [usedData, updateTrigger, usedColumns]
  )

  // Sanitize columnVisibility to remove any undefined/invalid keys before passing to MRT
  const sanitizedColumnVisibility = useMemo(() => {
    const result = {}
    for (const key of Object.keys(columnVisibility)) {
      if (key !== 'undefined' && key !== undefined)
        result[key] = columnVisibility[key]
    }
    return result
  }, [columnVisibility])

  const displayColumns = useMemo(() => {
    if (!Array.isArray(subTables) || subTables.length === 0) {
      return usedColumns
    }
    const cachedHeaders = new Map()
    const injected = []
    for (const sub of subTables) {
      if (!subTableIsSelected(sub, configuredSimpleColumns)) {
        continue
      }
      if (subTableShowsCachedColumn(sub, usedData)) {
        cachedHeaders.set(sub.cachedColumn, sub.header ?? sub.id)
        continue
      }
      injected.push(buildSubTableColumn(sub))
    }
    const columns = cachedHeaders.size
      ? usedColumns.map((col) =>
          cachedHeaders.has(col.id)
            ? { ...col, header: cachedHeaders.get(col.id) }
            : col
        )
      : usedColumns
    const injectedById = new Map(injected.map((col) => [col.id, col]))
    const replaced = columns.map((col) => injectedById.get(col.id) ?? col)
    const existing = new Set(columns.map((col) => col.id))
    return [...replaced, ...injected.filter((col) => !existing.has(col.id))]
  }, [usedColumns, usedData, subTables, configuredSimpleColumns])

  useEffect(() => {
    if (!Array.isArray(subTables) || subTables.length === 0) {
      return
    }
    setColumnVisibility((prev) => {
      const next = { ...prev }
      let changed = false
      for (const sub of subTables) {
        if (!subTableIsSelected(sub, configuredSimpleColumns)) {
          continue
        }
        const columnId = subTableShowsCachedColumn(sub, usedData)
          ? sub.cachedColumn
          : sub.id
        if (next[columnId] === undefined) {
          next[columnId] = true
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [subTables, configuredSimpleColumns, usedData])

  const handleActionDisabled = useCallback((row, action) => {
    const actionRow = attachParentRow(row, parentRow)
    if (action?.condition) {
      return !action.condition(actionRow)
    }
    return false
  }, [parentRow])

  const getActionRow = useCallback(
    (rowOriginal) => attachParentRow(rowOriginal, parentRow),
    [parentRow]
  )

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
            lg: settings?.sidebarCollapse
              ? '73px !important'
              : '270px !important',
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
        onClick: (event) => {
          if (
            event.target?.closest?.(
              'button, a, input, textarea, select, [role="button"], [role="menuitem"], [data-no-row-click="true"]'
            )
          ) {
            return
          }

          setOffCanvasData(row.original)
          const navigable = table?.getSortedRowModel?.()?.rows
          if (navigable) {
            const indexInList = navigable.findIndex(
              (r) => r.original === row.original
            )
            setOffCanvasRowIndex(indexInList >= 0 ? indexInList : 0)
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
        <Box sx={{ py: { xs: 2, md: 4 } }}>
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

  // Single row-action dispatch used by BOTH the desktop row menu and the mobile action
  // sheet — the two presentations must not drift.
  // `table` is referenced via closure: it is declared below but initialized before any
  // handler can run (the same pattern the row menu has always relied on).
  const dispatchRowAction = useCallback(
    (action, rowOriginal, closeMenu = () => {}) => {
      const scopeToRowTenant = () => {
        const tenant = getRowTenant(getActionRow(rowOriginal), settings.currentTenant)
        if (settings.currentTenant === 'AllTenants' && tenant && tenant !== 'AllTenants') {
          settings.handleUpdate({
            currentTenant: tenant,
          })
        }
      }

      if (action.noConfirm && action.customFunction) {
        scopeToRowTenant()
        action.customFunction(getActionRow(rowOriginal), action, {})
        closeMenu()
        return
      }

      // Handle custom component differently
      if (typeof action.customComponent === 'function') {
        scopeToRowTenant()
        setCustomComponentData({ data: getActionRow(rowOriginal), action: action })
        setCustomComponentVisible(true)
        closeMenu()
        return
      }

      // Standard dialog flow
      setActionData({
        data: getActionRow(rowOriginal),
        action: action,
        ready: true,
      })
      createDialog.handleOpen()
      closeMenu()
    },
    [settings, createDialog, getActionRow]
  )

  // Open the extended-info offcanvas for a row, recording its position in the row model so
  // prev/next navigation works. Shared by the row menu, the mobile action sheet, and card
  // taps. The SORTED model is the one on screen — the filtered model is pre-sort, so a
  // position taken from it stops matching the list the moment a column is sorted.
  const openRowOffCanvas = useCallback((rowOriginal) => {
    setOffCanvasData(rowOriginal)
    const navigable = table.getSortedRowModel().rows
    const indexInList = navigable.findIndex((r) => r.original === rowOriginal)
    setOffCanvasRowIndex(indexInList >= 0 ? indexInList : 0)
    setOffcanvasVisible(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the flipped table shows whatever columns are visible; horizontal scroll covers the width
  const cardViewSurfaceRef = useRef(null)
  const handleViewToggle = useCallback(() => {
    const nextView = effectiveViewMode === 'table' ? 'cards' : 'table'
    setViewOverride(nextView)
    if (nextView === 'table' && isNarrowViewport) {
      scrollNodeToScrollableAncestorTop(cardViewSurfaceRef.current)
    }
  }, [effectiveViewMode, isNarrowViewport])

  // Memoize renderRowActionMenuItems to avoid re-creating on each render.
  const renderRowActionMenuItems = useMemo(() => {
    if (actions) {
      return ({ closeMenu, row }) => [
        actions
          .filter(
            // hideCondition removes an action from this row's menu entirely (vs.
            // condition, which renders it disabled).
            (action) =>
              typeof action.hideCondition !== 'function' ||
              !action.hideCondition(getActionRow(row.original))
          )
          .map((action, index) => (
            <MenuItem
              sx={{ color: action.color }}
              key={`actions-list-row-${index}`}
              onClick={() => dispatchRowAction(action, row.original, closeMenu)}
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
              openRowOffCanvas(row.original)
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
            openRowOffCanvas(row.original)
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
  }, [
    actions,
    offCanvas,
    dispatchRowAction,
    openRowOffCanvas,
    handleActionDisabled,
    getActionRow,
  ])

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
              usedColumns={displayColumns}
              usedData={memoizedData ?? EMPTY_ARRAY}
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
              persistenceKey={persistenceKey}
              parentRow={parentRow}
              isInDialog={isInDialog}
              showBulkExportAction={showBulkExportAction}
              onViewToggle={toggleAllowed ? handleViewToggle : undefined}
              tableViewActive={toggleAllowed ? tableViewActive : undefined}
              showReturnToCards={showReturnToCards}
              bulkActionsSlot={isNarrowViewport && !isInDialog ? headerBulkSlot : null}
              dataSourceControls={dataSourceControls}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              restoredFiltersRef={restoredFiltersRef}
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
      displayColumns,
      memoizedData,
      title,
      actions,
      exportEnabled,
      refreshFunction,
      filters,
      graphFilterData,
      isInDialog,
      showBulkExportAction,
      toggleAllowed,
      handleViewToggle,
      tableViewActive,
      showReturnToCards,
      isNarrowViewport,
      headerBulkSlot,
      dataSourceControls,
      activeFilters,
      searchValue,
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
    columns: displayColumns,
    data: memoizedData ?? EMPTY_ARRAY,
    state: tableState,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    renderEmptyRowsFallback,
    onColumnVisibilityChange: setColumnVisibility,
    ...modeInfo,
    // narrow table views size their scroll viewport from measurement (see the effect below),
    // the modeInfo calc budget only holds for desktop chrome
    ...(isNarrowViewport &&
      effectiveViewMode === 'table' && {
        muiTableContainerProps: {
          ...modeInfo.muiTableContainerProps,
          sx: {
            ...modeInfo.muiTableContainerProps?.sx,
            maxHeight: narrowTableMaxHeight ? `${narrowTableMaxHeight}px` : 'none',
          },
        },
      }),
    renderRowActionMenuItems,
    renderTopToolbar,
    sortingFns: SORTING_FNS,
    filterFns: FILTER_FNS,
    globalFilterFn: 'contains',
    enableGlobalFilterModes: true,
    renderGlobalFilterModeMenuItems: renderGlobalFilterModeMenuItemsFn,
    renderColumnFilterModeMenuItems: renderColumnFilterModeMenuItemsFn,
  })

  // deselect all rows when the underlying data set actually changes, guarded so a toolbar
  // remount (cards<->table flip) does not wipe an in-progress selection
  const prevUsedDataRef = useRef(memoizedData)
  useEffect(() => {
    if (prevUsedDataRef.current === memoizedData) {
      return
    }
    prevUsedDataRef.current = memoizedData
    table.toggleAllRowsSelected(false)
  }, [memoizedData])

  // utilTableMode seeds columnOrder from simpleColumns (e.g. "members"), but cached report
  // data shows membersCsv instead — MRT crashes if order references ids that are not in
  // displayColumns.
  useEffect(() => {
    if (!Array.isArray(subTables) || subTables.length === 0) {
      return
    }
    const displayIds = displayColumns.map((col) => col.id).filter(Boolean)
    if (displayIds.length === 0) {
      return
    }
    const currentOrder = table.getState().columnOrder ?? []
    if (!columnOrderHasStaleIds(currentOrder, displayIds)) {
      return
    }
    const selectedForOrder = resolveSubTableSimpleColumns(
      configuredSimpleColumns,
      subTables,
      usedData
    ).filter((id) => displayIds.includes(id))
    table.setColumnOrder(orderColumnsBySelection(displayIds, selectedForOrder))
  }, [configuredSimpleColumns, displayColumns, subTables, usedData, table])

  // size the narrow table's scroll viewport from where it actually sits: viewport height
  // minus the container's measured top, the real footer height and the chrome below the
  // paper. the desktop calc assumes chrome heights that phone layouts do not have.
  // deps include getRequestData.isSuccess so a cold load (table not yet mounted when the
  // toggle flips tableViewActive true) re-arms the measurement once MRT actually renders
  useEffect(() => {
    if (!(isNarrowViewport && tableViewActive)) {
      setNarrowTableMaxHeight(null)
      return undefined
    }
    const measure = () => {
      const container = table.refs.tableContainerRef?.current
      if (!container) {
        return
      }
      const footer = table.refs.bottomToolbarRef?.current?.offsetHeight ?? 0
      // chrome between the paper's bottom edge and the page bottom (CardContent padding + page gap)
      const BELOW_PAPER_PX = 40
      // viewport-relative, the toggle handler aligns the card surface with the scroll
      // viewport top first so this reads a deterministic position
      const top = container.getBoundingClientRect().top
      let next = Math.max(240, Math.floor(window.innerHeight - top - footer - BELOW_PAPER_PX))
      // 120 = minimal chrome allowance, keeps the table from claiming the full viewport
      next = Math.min(next, window.innerHeight - 120)
      setNarrowTableMaxHeight((prev) => {
        if (prev !== null && Math.abs(prev - next) <= 1) {
          return prev
        }
        return next
      })
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure))
    window.addEventListener('resize', measure)
    let observer
    // the paper mounts in the same commit as the container and the footer, so it is a
    // reliable observation target even on the pass where the footer ref is still null
    const paper = table.refs.tablePaperRef?.current
    if (typeof ResizeObserver !== 'undefined' && paper) {
      observer = new ResizeObserver(measure)
      observer.observe(paper)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      observer?.disconnect()
    }
  }, [isNarrowViewport, tableViewActive, table, getRequestData.isSuccess])

  // A card shows at most a title, subtitle, three chips and three detail rows, so the rest
  // of the row has to live in the drawer. On a page with no offCanvas that means every
  // column the user has chosen to show; on a page that configured one, its curated fields
  // come first and the remaining visible columns are appended rather than dropped — on
  // desktop those columns are still on screen in the table, on mobile they are not.
  const cardInfoFields = useMemo(() => {
    if (!isCardView) return undefined
    // A page that renders its own drawer body (offCanvas.children — the test-detail pages)
    // is the authority on what the drawer shows; prepending the generic property list on
    // top of it repeated Risk/Status above a body that already presents them.
    if (offCanvas?.children) return undefined
    const visible = table
      .getVisibleLeafColumns()
      .map((column) => column.id)
      .filter((id) => !id.startsWith('mrt-'))
    const curated = offCanvas?.extendedInfoFields
    if (!curated?.length) return visible
    // Curated order wins; dedupe case-insensitively across both lists, and within the
    // curated list itself, so a field can't be shown twice.
    const seen = new Set()
    return [...curated, ...visible].filter((id) => {
      if (typeof id !== 'string') return false
      const key = id.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offCanvas, isCardView, table, columnVisibility, usedColumns])

  // Applied after the {...offCanvas} spread below, which carries the page's own
  // extendedInfoFields and would otherwise overwrite the merged list. Card view renders
  // them the way the table cells do, since the appended entries are columns.
  const cardInfoOverride =
    isCardView && cardInfoFields?.length
      ? { extendedInfoFields: cardInfoFields, richFormatting: true }
      : {}

  // The rows the drawer's Prev/Next walks, in the order they are on screen. Read live from
  // the table on every render: this used to be mirrored into state by an effect keyed on
  // filters and sorting, so the copy was taken once at mount — before the rows had arrived
  // — and every table that loads its data asynchronously reported nothing to navigate.
  const navigationRows = table.getSortedRowModel().rows
  // Prefer the position of the row actually on show, so sorting or filtering while the
  // drawer is open carries the counter with it. The stored index covers the case where the
  // row has left the list entirely — a background refetch replaces every object, so
  // identity alone would strand the position — and is clamped so a list that shrank under
  // it can't report "6 of 2".
  const derivedRowIndex = offcanvasVisible
    ? navigationRows.findIndex((row) => row.original === offCanvasData)
    : -1
  const currentRowIndex =
    derivedRowIndex >= 0
      ? derivedRowIndex
      : Math.min(offCanvasRowIndex, Math.max(navigationRows.length - 1, 0))

  // Remove the useEffect that was resetting filters on table changes
  // The initial filter application is now handled by the columnFilters state
  // and the useEffect above that only triggers on actual filter prop changes

  // Exiting mobile select mode clears the selection — "Done" means done.
  const handleMobileSelectModeChange = useCallback(
    (on) => {
      setMobileSelectMode(on)
      if (!on) {
        table.toggleAllRowsSelected(false)
      }
    },
    [table]
  )

  // Empty-state "Clear filters" in the card list. The full reset (graph filters,
  // persisted slots) lives in the toolbar's filter sheet; this only clears what makes
  // the current list empty.
  const handleClearAllFilters = useCallback(() => {
    table.resetGlobalFilter()
    table.resetColumnFilters()
  }, [table])

  useEffect(() => {
    if (onChange && table.getSelectedRowModel().rows) {
      onChange(table.getSelectedRowModel().rows.map((row) => row.original))
    }
  }, [table.getSelectedRowModel().rows])

  useEffect(() => {
    //check if the simplecolumns are an array,
    if (Array.isArray(simpleColumns) && simpleColumns.length > 0) {
      setConfiguredSimpleColumns(simpleColumns)
    }
  }, [simpleColumns])

  const selectModeActive = hasOnChange ? true : mobileSelectMode

  const resolvedCardButton = cardButton ? (
    <CippTableCardButton cardButton={cardButton} row={parentRow} />
  ) : undefined

  // below md, table-in-Card branch: the actions FAB carries cardButton
  const headerAction = isNarrowViewport && !isInDialog ? undefined : resolvedCardButton

  return (
    <>
      {isCardView ? (
        // same paper surface as the table path; overflow visible keeps the controls bar sticky
        <CardViewSurface
          ref={cardViewSurfaceRef}
          data-testid="cipp-card-view"
          {...(noCard
            ? {}
            : { sx: { width: '100%', overflow: 'visible' }, ...props.cardProps })}
        >
          {!hideTitle && (
            <Box
              sx={{
                // Embedded in another card (noCard) or a dialog, the host already pays a
                // 16px gutter — the list's own 8px would double it, so the whole card
                // presentation (title, controls, cards) drops to the host's edge together.
                px: isInDialog || noCard ? 0 : 1,
                pt: 1,
                pb: 0.5,
                display: 'flex',
                alignItems: 'baseline',
                gap: 1,
                minWidth: 0,
              }}
            >
              <Typography variant="h6" noWrap sx={{ minWidth: 0 }}>
                {title}
              </Typography>
              {Array.isArray(usedData) && !showSkeletons && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexShrink: 0 }}
                >
                  {table.getFilteredRowModel().rows.length} results
                </Typography>
              )}
            </Box>
          )}
          {!Array.isArray(usedData) && usedData ? (
            <ResourceUnavailable message={incorrectDataMessage} />
          ) : (
            <>
              <CIPPTableToptoolbar
                table={table}
                api={api}
                queryKey={queryKey}
                simpleColumns={simpleColumns}
                data={data}
                columnVisibility={columnVisibility}
                getRequestData={getRequestData}
                usedColumns={displayColumns}
                usedData={memoizedData ?? EMPTY_ARRAY}
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
                persistenceKey={persistenceKey}
                parentRow={parentRow}
                isInDialog={isInDialog}
                embedded={isInDialog || noCard}
                showBulkExportAction={showBulkExportAction}
                viewMode="cards"
                selectMode={selectModeActive}
                onSelectModeChange={
                  hasOnChange ? undefined : handleMobileSelectModeChange
                }
                selectModeLocked={hasOnChange}
                onViewToggle={toggleAllowed ? handleViewToggle : undefined}
                tableViewActive={toggleAllowed ? tableViewActive : undefined}
                dataSourceControls={dataSourceControls}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                restoredFiltersRef={restoredFiltersRef}
              />
              <CippMobileCardList
                table={table}
                actions={actions}
                hasOffCanvas={!!offCanvas || Boolean(cardInfoFields?.length)}
                onRowAction={dispatchRowAction}
                onMoreInfo={openRowOffCanvas}
                isActionDisabled={handleActionDisabled}
                getActionRow={getActionRow}
                selectMode={selectModeActive}
                cardButton={resolvedCardButton}
                mobileCard={mobileCard}
                fixedChrome={!isInDialog && !noCard}
                onClearFilters={handleClearAllFilters}
                isStreaming={getRequestData.isFetching && !showSkeletons}
                queueMessage={queueMessage}
              />
            </>
          )}
          {getRequestData.isError && !getRequestData.isFetchNextPageError && (
            <ResourceError
              onReload={() => getRequestData.refetch()}
              message={`Error Loading data:  ${getCippError(getRequestData.error)}`}
            />
          )}
        </CardViewSurface>
      ) : noCard ? (
        <Scrollbar>
          {!Array.isArray(usedData) && usedData ? (
            <ResourceUnavailable message={incorrectDataMessage} />
          ) : (
            <>
              {(getRequestData.isSuccess ||
                getRequestData.data?.pages.length >= 0 ||
                data) && <MaterialReactTable table={table} />}
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
        <>
          <Card style={{ width: '100%' }} {...props.cardProps}>
            {cardButton || !hideTitle ? (
              <>
                <CardHeader
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        ref={setHeaderBulkSlot}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      />
                      {/* narrow viewports carry these in the Table options sheet */}
                      {dataSourceControls && !isNarrowViewport ? (
                        <Stack direction='row' spacing={1} alignItems='center'>
                          {dataSourceControls}
                          {headerAction}
                        </Stack>
                      ) : (
                        headerAction
                      )}
                    </Box>
                  }
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
                      (data && !getRequestData.isError)) && (
                      <MaterialReactTable table={table} />
                    )}
                  </>
                )}
                {getRequestData.isError &&
                  !getRequestData.isFetchNextPageError && (
                    <ResourceError
                      onReload={() => getRequestData.refetch()}
                      message={`Error Loading data:  ${getCippError(getRequestData.error)}`}
                    />
                  )}
              </Scrollbar>
            </CardContent>
          </Card>
          {isNarrowViewport && !isInDialog && resolvedCardButton && (
            <CippPageActionsFab title="Actions">{resolvedCardButton}</CippPageActionsFab>
          )}
        </>
      )}
      <CippOffCanvas
        isFetching={getRequestData.isFetching}
        visible={offcanvasVisible}
        onClose={() => setOffcanvasVisible(false)}
        extendedData={offCanvasData}
        extendedInfoFields={offCanvas?.extendedInfoFields}
        title={offCanvasData?.Name || offCanvas?.title || 'Extended Info'}
        aboveModal={isInDialog}
        children={
          offCanvas?.children
            ? (row) => offCanvas.children(row, currentRowIndex)
            : undefined
        }
        customComponent={offCanvas?.customComponent}
        onNavigateUp={() => {
          const newIndex = currentRowIndex - 1
          if (newIndex >= 0 && navigationRows[newIndex]) {
            setOffCanvasRowIndex(newIndex)
            setOffCanvasData(navigationRows[newIndex].original)
          }
        }}
        onNavigateDown={() => {
          const newIndex = currentRowIndex + 1
          if (navigationRows[newIndex]) {
            setOffCanvasRowIndex(newIndex)
            setOffCanvasData(navigationRows[newIndex].original)
          }
        }}
        canNavigateUp={currentRowIndex > 0}
        canNavigateDown={currentRowIndex < navigationRows.length - 1}
        navigationPosition={{
          index: currentRowIndex + 1,
          total: navigationRows.length,
        }}
        {...offCanvas}
        {...cardInfoOverride}
        // Retired: the drawer's action buttons never dispatched reliably, and the row menu
        // is the actions surface. Last so it beats page configs carrying offCanvas.actions.
        actions={undefined}
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
          (actionData.action &&
            typeof actionData.action.customComponent === 'function')
        )
          return null
        return (
          <CippApiDialog
            createDialog={createDialog}
            title="Confirmation"
            fields={actionData.action?.fields}
            api={actionData.action}
            row={actionData.data}
            {...actionData.action}
            relatedQueryKeys={[
              ...(queryKey ? [queryKey] : title ? [title] : []),
              ...(Array.isArray(actionData.action?.relatedQueryKeys)
                ? actionData.action.relatedQueryKeys
                : actionData.action?.relatedQueryKeys
                  ? [actionData.action.relatedQueryKeys]
                  : []),
            ].filter(Boolean)}
          />
        )
      }, [
        actionData.ready,
        createDialog,
        actionData.action,
        actionData.data,
        queryKey,
        title,
      ])}
    </>
  )
}
