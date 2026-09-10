import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { createPortal } from 'react-dom'
import {
  Badge,
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  ListSubheader,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  Checkbox,
  SvgIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { PDFExportButton, exportRowsToPdf } from '../pdfExportButton'
import { CSVExportButton, exportRowsToCsv } from '../csvExportButton'
import { getCippTranslation } from '../../utils/get-cipp-translation'
import { useMediaQuery } from '@mui/material'
import { CippQueueTracker } from './CippQueueTracker'
import { usePopover } from '../../hooks/use-popover'
import { useDialog } from '../../hooks/use-dialog'
import { CippApiDialog } from '../CippComponents/CippApiDialog'
import { useSettings } from '../../hooks/use-settings'
import { attachParentRow } from '../../utils/resolve-row-templates'
import { fetchBrandingSettings } from '../CippPdf/useBrandingSettings'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { CippOffCanvas } from '../CippComponents/CippOffCanvas'
import { CippCodeBlock } from '../CippComponents/CippCodeBlock'
import { ApiGetCall } from '../../api/ApiCall'
import GraphExplorerPresets from '../../data/GraphExplorerPresets.json'
import CippGraphExplorerFilter from './CippGraphExplorerFilter'
import { Stack } from '@mui/system'
import { CippMobileTableControls } from './CippMobileTableControls'
import { CippTableFilterSheet } from './CippTableFilterSheet'
import { useSheetHandoff } from '../../hooks/use-sheet-handoff'
import {
  ModernSearchContainer,
  ModernSearchInput,
  ModernButton,
  RefreshButton,
} from './toolbar-primitives'

export const CIPPTableToptoolbar = React.memo(
  ({
    api,
    simpleColumns,
    queryKey,
    table,
    getRequestData,
    usedColumns,
    usedData,
    columnVisibility,
    setColumnVisibility,
    title,
    actions,
    filters = [],
    exportEnabled,
    refreshFunction,
    queryKeys,
    data,
    setGraphFilterData,
    setConfiguredSimpleColumns,
    queueMetadata,
    isInDialog = false,
    embedded = false,
    showBulkExportAction = true,
    // Mobile card mode: same state, same handlers, different presentation (sheets
    // instead of menus). Select-mode state lives in CippDataTable so the card list
    // and this toolbar stay in sync.
    viewMode = 'table',
    selectMode = false,
    onSelectModeChange,
    selectModeLocked = false,
    onViewToggle,
    tableViewActive = false,
    showReturnToCards = false,
    // when set, the selection count + Bulk Actions button portal into this node
    // (the Card header's slot) rather than rendering inline in the toolbar
    bulkActionsSlot = null,
    // Live/Cached data-source controls, rendered in the mobile Table options sheet
    dataSourceControls,
    // Owned by CippDataTable: this toolbar mounts as two alternating instances (the cards
    // branch and the renderTopToolbar branch), so state that must survive the cards<->table
    // flip is passed down as props rather than kept in local useState/useRef here.
    activeFilters = { graph: null, table: null },
    setActiveFilters,
    searchValue = '',
    setSearchValue,
    restoredFiltersRef,
    persistenceKey,
    parentRow,
  }) => {
    const popover = usePopover()
    const [filtersAnchor, setFiltersAnchor] = useState(null)
    const [columnsAnchor, setColumnsAnchor] = useState(null)
    const [exportAnchor, setExportAnchor] = useState(null)
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
    const [mobileFilterSheetOpen, setMobileFilterSheetOpen] = useState(false)
    // table branch's own handoff instance — the cards branch (CippMobileTableControls) owns a separate one
    const mobileFilterSheet = useSheetHandoff(() => setMobileFilterSheetOpen(false))

    const mdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))
    const settings = useSettings()
    const queryClient = useQueryClient()
    const router = useRouter()
    const createDialog = useDialog()
    const [actionData, setActionData] = useState({
      data: {},
      action: {},
      ready: false,
    })
    const [offcanvasVisible, setOffcanvasVisible] = useState(false)
    const [jsonDialogOpen, setJsonDialogOpen] = useState(false) // For dialog-based JSON view
    const [filterList, setFilterList] = useState(filters)
    const [currentEffectiveQueryKey, setCurrentEffectiveQueryKey] = useState(
      queryKey || title
    )
    const [originalSimpleColumns, setOriginalSimpleColumns] =
      useState(simpleColumns)
    const [filterCanvasVisible, setFilterCanvasVisible] = useState(false)
    const presetKey = (filter) => filter?.id ?? filter?.filterName
    const pageName = persistenceKey ?? (isInDialog ? '' : router.pathname.split('/').slice(1).join('/'))
    const [useCompactMode, setUseCompactMode] = useState(false)
    const toolbarRef = useRef(null)
    const leftContainerRef = useRef(null)
    const actionsContainerRef = useRef(null)

    const wrapActionRow = (original) => attachParentRow(original, parentRow)

    const getBulkActions = (actions, selectedRows) => {
      return (
        actions
          // customComponent actions are single-row dialogs; the bulk path renders CippApiDialog
          // unconditionally, so admitting one here produces an empty dialog with no API behind it.
          ?.filter((action) => !action.link && !action?.hideBulk && !action?.customComponent)
          ?.map((action) => ({
            ...action,
            // bulkFilterEligible actions run against the eligible subset of the selection:
            // available when ANY selected row qualifies, and dispatch filters the rest out.
            // The default stays all-or-nothing (every selected row must qualify).
            disabled: action.condition
              ? action.bulkFilterEligible
                ? !selectedRows.some((row) => action.condition(wrapActionRow(row.original)))
                : !selectedRows.every((row) => action.condition(wrapActionRow(row.original)))
              : false,
          })) || []
      )
    }

    const selectedRows = table.getSelectedRowModel().rows
    const hasSelection =
      table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()
    // Built-in export actions should only appear when the page opts in and rows are selected.
    const builtInBulkExportAvailable =
      showBulkExportAction && exportEnabled && selectedRows.length > 0
    const customBulkActions = getBulkActions(actions, selectedRows)
    const showBulkActionsButton = hasSelection && customBulkActions.length > 0

    const handleExportSelectedToCsv = () => {
      if (!selectedRows.length) {
        return
      }
      exportRowsToCsv({
        rows: selectedRows,
        columns: usedColumns,
        reportName: `${title}`,
        columnVisibility,
      })
    }

    const handleExportSelectedToPdf = async () => {
      if (!selectedRows.length) {
        return
      }
      exportRowsToPdf({
        rows: selectedRows,
        columns: usedColumns,
        reportName: `${title}`,
        columnVisibility,
        brandingSettings: await fetchBrandingSettings(queryClient),
      })
    }

    // Shared refresh dispatch — desktop refresh button and the mobile filter sheet.
    const handleRefresh = () => {
      if (typeof refreshFunction === 'object') {
        refreshFunction.refetch()
      } else if (typeof refreshFunction === 'function') {
        refreshFunction()
      } else if (data && !getRequestData.isFetched) {
        // do nothing because data was sent native.
      } else if (getRequestData) {
        getRequestData.refetch()
      }
    }

    // Shared bulk-action dispatch — desktop bulk menu and the mobile bulk sheet must not
    // drift, so both route through here.
    const handleBulkAction = (action, closeMenu = () => {}) => {
      if (action.disabled) {
        return
      }

      const allSelectedRows = table.getSelectedRowModel().rows
      const eligibleRows =
        action.bulkFilterEligible && action.condition
          ? allSelectedRows.filter((row) => action.condition(wrapActionRow(row.original)))
          : allSelectedRows
      const selectedData = eligibleRows.map((row) => wrapActionRow(row.original))

      if (typeof action.customBulkHandler === 'function') {
        action.customBulkHandler({
          rows: eligibleRows,
          data: selectedData,
          closeMenu,
          clearSelection: () => table.toggleAllRowsSelected(false),
        })
        closeMenu()
        return
      }

      // Runs before any state change: setting ready:true first mounts CippApiDialog with
      // api.noConfirm true, and its mount effect auto-submits into the same customFunction
      // being called here — every selected row's action fired twice.
      if (action?.noConfirm && action.customFunction) {
        // multiPost actions expect the full selection in one call (e.g. Edit Properties
        // stores users in sessionStorage then navigates). Per-row invocation would
        // overwrite that state with only the last selected row.
        if (action.multiPost) {
          action.customFunction(selectedData, action, {})
        } else {
          eligibleRows.forEach((row) =>
            action.customFunction(wrapActionRow(row.original.original ?? row.original), action, {})
          )
        }
        // Deliberately no closeMenu() here — that matches the behaviour this branch had
        // before; the only thing being fixed is the duplicate invocation.
        return
      }

      setActionData({
        data: selectedData,
        action: action,
        ready: true,
      })
      createDialog.handleOpen()
      closeMenu()
    }

    // Sync currentEffectiveQueryKey with queryKey prop changes (e.g., tenant changes) — a
    // plain re-derivation from the same props this instance was given, harmless on remount
    useEffect(() => {
      setCurrentEffectiveQueryKey(queryKey || title)
    }, [queryKey, title])

    useEffect(() => {
      setOriginalSimpleColumns(simpleColumns)
    }, [simpleColumns])

    // Early restoration of graph filters (before API call) - run only once per page
    useEffect(() => {
      const restorationKey = `${pageName}-graph`

      if (
        pageName &&
        settings.persistFilters &&
        settings.lastUsedFilters &&
        settings.lastUsedFilters[pageName] &&
        api?.url === '/api/ListGraphRequest' && // Only for graph requests
        !restoredFiltersRef.current.has(restorationKey) // Only if not already restored
      ) {
        const last = normalizePersistedFilters(
          settings.lastUsedFilters[pageName]
        ).graph
        if (last) {
          // Mark as restored to prevent infinite loops
          restoredFiltersRef.current.add(restorationKey)

          // Directly set the graph filter data without calling setTableFilter to avoid loops
          const filterProps = [
            '$filter',
            '$select',
            '$expand',
            '$orderby',
            '$count',
            '$search',
            'ReverseTenantLookup',
            'ReverseTenantLookupProperty',
            'AsApp',
          ]
          const graphFilter = filterProps.reduce((acc, prop) => {
            if (last.value[prop]) {
              acc[prop] = last.value[prop]
            }
            return acc
          }, {})
          const resolvedGraphFilter = resolveFilterVariables(graphFilter)

          const newQueryKey = `${queryKey ? queryKey : title}-${last.name}`
          setGraphFilterData({
            data: { ...mergeCaseInsensitive(api.data, resolvedGraphFilter) },
            queryKey: newQueryKey,
          })
          setCurrentEffectiveQueryKey(newQueryKey)
          setActiveFilters((prev) => ({
            ...prev,
            graph: { id: last.id, name: last.name },
          }))

          if (last.value?.$select) {
            let selectColumns = []
            if (Array.isArray(last.value.$select)) {
              selectColumns = last.value.$select
            } else if (typeof last.value.$select === 'string') {
              selectColumns = last.value.$select
                .split(',')
                .map((col) => col.trim())
                .filter((col) => usedColumns.includes(col))
            }
            if (selectColumns.length > 0) {
              setConfiguredSimpleColumns(selectColumns)
            }
          }
        }
      }
    }, [
      settings.persistFilters,
      settings.lastUsedFilters,
      pageName,
      api?.url,
      queryKey,
      title,
    ])

    // Detect overflow and switch to compact mode
    useEffect(() => {
      const checkOverflow = () => {
        if (!leftContainerRef.current || !actionsContainerRef.current) {
          return
        }

        const leftContainerWidth = leftContainerRef.current.offsetWidth
        const leftContainerScrollWidth = leftContainerRef.current.scrollWidth
        const actionsWidth = actionsContainerRef.current.scrollWidth
        const isOverflowing = leftContainerScrollWidth > leftContainerWidth
        const shouldBeCompact =
          isOverflowing || actionsWidth > leftContainerWidth * 0.6 // Actions taking > 60% of left container

        setUseCompactMode(shouldBeCompact)
      }

      // Check immediately on mount and when dependencies change
      checkOverflow()

      // Also check after a brief delay to ensure elements are fully rendered
      const timeoutId = setTimeout(checkOverflow, 100)

      const resizeObserver = new ResizeObserver(checkOverflow)
      if (leftContainerRef.current) {
        resizeObserver.observe(leftContainerRef.current)
      }

      return () => {
        clearTimeout(timeoutId)
        resizeObserver.disconnect()
      }
    }, [
      hasSelection,
      customBulkActions.length,
      exportEnabled,
      filters?.length,
      usedColumns?.length,
    ])

    // Restore last used filter on mount if persistFilters is enabled (non-graph filters).
    // Once-per-page like the graph slot above: keying this on isFetching used to re-arm the
    // 100ms timer on every fetch settle (once per page of an auto-paginated load), clobbering
    // whatever filter the user had just applied with the persisted one.
    useEffect(() => {
      const restorationKey = `${pageName}-table`
      // Wait for table to be initialized and columns to exist (column filters need them)
      if (
        pageName &&
        settings.persistFilters &&
        settings.lastUsedFilters &&
        settings.lastUsedFilters[pageName] &&
        table &&
        usedColumns.length > 0 &&
        !restoredFiltersRef.current.has(restorationKey)
      ) {
        // Use setTimeout to ensure the table is fully rendered
        const timeoutId = setTimeout(() => {
          const last = normalizePersistedFilters(
            settings.lastUsedFilters[pageName]
          ).table
          if (!last) {
            return
          }

          if (last.type === 'global') {
            restoredFiltersRef.current.add(restorationKey)
            table.setGlobalFilter(last.value)
            // Keep the visible search box in sync with the filter it now represents
            setSearchValue(typeof last.value === 'string' ? last.value : '')
            setActiveFilters((prev) => ({
              ...prev,
              table: { id: last.id, name: last.name, type: last.type },
            }))
          } else if (last.type === 'column') {
            // Only apply if all filter columns exist in the current table; if they don't
            // yet (columns still streaming in), leave unmarked so a later run retries.
            const allColumns = table.getAllColumns().map((col) => col.id)
            const filterColumns = Array.isArray(last.value)
              ? last.value.map((f) => f.id)
              : []
            const allExist = filterColumns.every((colId) =>
              allColumns.includes(colId)
            )
            if (allExist) {
              restoredFiltersRef.current.add(restorationKey)
              if (viewMode !== 'cards') {
                table.setShowColumnFilters(true)
              }
              table.setColumnFilters(last.value)
              setActiveFilters((prev) => ({
                ...prev,
                table: { id: last.id, name: last.name, type: last.type },
              }))
            }
          }
          // Note: graph filters are handled in the earlier useEffect
        }, 100)

        return () => clearTimeout(timeoutId)
      }
    }, [
      settings.persistFilters,
      settings.lastUsedFilters,
      pageName,
      table,
      usedColumns,
      viewMode,
    ])

    const presetList = ApiGetCall({
      url: '/api/ListGraphExplorerPresets',
      queryKey: `ListGraphExplorerPresets${api?.data?.Endpoint ?? ''}`,
      data: {
        Endpoint: api?.data?.Endpoint ?? '',
      },
      waiting: !!api?.data?.Endpoint,
    })

    // Debounced search: update local input instantly for responsiveness, but
    // defer the expensive global filter update so the browser doesn't hang.
    const searchDebounceRef = useRef(null)

    const handleSearchChange = useCallback(
      (event) => {
        const value = event.target.value
        setSearchValue(value)

        // Clear any pending debounce timer.
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current)
        }

        // Defer the heavy table.setGlobalFilter call.
        searchDebounceRef.current = setTimeout(() => {
          table.setGlobalFilter(value)
        }, 200)
      },
      [table]
    )

    // Clean up debounce timer on unmount.
    useEffect(() => {
      return () => {
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current)
        }
      }
    }, [])

    // Handle column filters toggle
    const handleColumnFiltersToggle = () => {
      const currentState = table.getState().showColumnFilters
      table.setShowColumnFilters(!currentState)
    }

    const resetToDefaultVisibility = () => {
      setColumnVisibility((prevVisibility) => {
        const updatedVisibility = {}
        for (const col in prevVisibility) {
          if (Array.isArray(originalSimpleColumns)) {
            updatedVisibility[col] = originalSimpleColumns.includes(col)
          }
        }
        return updatedVisibility
      })
      if (pageName) {
        settings.handleUpdate({
          columnDefaults: {
            ...settings?.columnDefaults,
            [pageName]: {},
          },
        })
      }
      setColumnsAnchor(null)
    }

    const resetToPreferedVisibility = () => {
      if (
        settings?.columnDefaults?.[pageName] &&
        Object.keys(settings?.columnDefaults?.[pageName]).length > 0
      ) {
        setColumnVisibility(settings?.columnDefaults?.[pageName])
      } else {
        setColumnVisibility((prevVisibility) => {
          const updatedVisibility = {}
          for (const col in prevVisibility) {
            if (Array.isArray(originalSimpleColumns)) {
              updatedVisibility[col] = originalSimpleColumns.includes(col)
            }
          }
          return updatedVisibility
        })
      }
      setColumnsAnchor(null)
    }

    const saveAsPreferedColumns = () => {
      if (pageName) {
        settings.handleUpdate({
          columnDefaults: {
            ...settings?.columnDefaults,
            [pageName]: columnVisibility,
          },
        })
      }
      setColumnsAnchor(null)
    }

    const mergeCaseInsensitive = (obj1, obj2) => {
      const merged = { ...obj1 }
      for (const key in obj2) {
        const lowerCaseKey = key.toLowerCase()
        const existingKey = Object.keys(merged).find(
          (k) => k.toLowerCase() === lowerCaseKey
        )
        if (existingKey) {
          merged[existingKey] = obj2[key]
        } else {
          merged[key] = obj2[key]
        }
      }
      return merged
    }

    // Resolve variable placeholders in filter objects.
    // Supported: {DaysAgo:N} → ISO date string N days in the past
    const resolveFilterVariables = (obj) => {
      if (!obj || typeof obj !== 'object') return obj
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => {
          if (typeof v === 'string') {
            const resolved = v.replace(/\{DaysAgo:(\d+)\}/g, (_, n) => {
              const d = new Date()
              d.setDate(d.getDate() - Number(n))
              return d.toISOString().split('T')[0]
            })
            return [k, resolved]
          }
          return [k, v]
        })
      );
    }

    // Show one column by name. The name comes from preset data, so it is added through
    // Object.fromEntries (which defines the property directly) rather than a computed key
    // in a spread literal, keeping a value such as '__proto__' away from the prototype chain.
    const showColumn = (name) => {
      const key = String(name).trim()
      if (!usedColumns.includes(key)) return false
      setColumnVisibility((prev) => Object.fromEntries([...Object.entries(prev), [key, true]]))
      return true
    }

    // Shared function for setting nested column visibility
    const setNestedVisibility = (col) => {
      if (typeof col === 'object' && col !== null) {
        Object.keys(col).forEach((key) => {
          if (showColumn(key)) {
            setNestedVisibility(col[key])
          }
        })
      } else {
        showColumn(col)
      }
    }

    const normalizePersistedFilters = (last) => {
      if (!last) {
        return { graph: null, table: null }
      }
      if ('graph' in last || 'table' in last) {
        const table = last.table ?? null
        // new shape can carry the same non-string global garbage the legacy branch discards
        if (table?.type === 'global' && typeof table.value !== 'string') {
          return { graph: last.graph ?? null, table: null }
        }
        return { graph: last.graph ?? null, table }
      }
      // legacy single-slot {type, value, name}
      if (last.type === 'graph') {
        return {
          graph: { id: last.name, name: last.name, value: last.value },
          table: null,
        }
      }
      if (
        last.type === 'column' ||
        (last.type === 'global' && typeof last.value === 'string')
      ) {
        return {
          graph: null,
          table: {
            id: last.name,
            name: last.name,
            type: last.type,
            value: last.value,
          },
        }
      }
      // reset marker or non-string global garbage
      return { graph: null, table: null }
    }

    const persistFilterSlots = (updater) => {
      if (!pageName || !settings.persistFilters || !settings.setLastUsedFilter) {
        return
      }
      const current = normalizePersistedFilters(
        settings.lastUsedFilters?.[pageName]
      )
      settings.setLastUsedFilter(pageName, updater(current))
    }

    // Columns any preset drives with a non-default `filterFn` (e.g. 'notEquals', 'notContains'),
    // mapped to a plain 'contains' baseline. material-react-table's per-column filter mode is a
    // sticky mutation on the column definition — switching it away from the default only takes
    // when the new state.columnFilterFns entry is itself explicit, so clearing to `{}` after a
    // preset like this leaves the override stuck. Passing this map on every column-preset click
    // (falling back to 'contains' for any id not driven by the current preset) forces that
    // mutation to reset every time, so manual searches on the column behave normally again once
    // a different preset — or Reset — is applied.
    const filterFnDefaults = useMemo(() => {
      const ids = new Set()
      filters.forEach((f) => {
        if (Array.isArray(f?.value)) {
          f.value.forEach((v) => {
            if (v?.id && v?.filterFn) ids.add(v.id)
          })
        }
      })
      return Object.fromEntries([...ids].map((id) => [id, 'contains']))
    }, [filters])

    const setTableFilter = (filter, filterType, filterName, presetId) => {
      if (filterType === 'global' || filterType === undefined) {
        if (activeFilters.table?.type === 'column') {
          table.resetColumnFilters()
        }
        // The search box IS the global filter's visible form — a pending debounced
        // keystroke or stale text would silently overwrite this preset otherwise.
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current)
        }
        setSearchValue(typeof filter === 'string' ? filter : '')
        table.setGlobalFilter(filter)
        setActiveFilters((prev) => ({
          ...prev,
          table: {
            id: presetId ?? filterName,
            name: filterName,
            type: 'global',
          },
        }))
        persistFilterSlots((cur) => ({
          ...cur,
          table: {
            id: presetId ?? filterName,
            name: filterName,
            type: 'global',
            value: filter,
          },
        }))
      }
      if (filterType === 'column') {
        if (activeFilters.table?.type === 'global') {
          table.resetGlobalFilter()
          if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current)
          }
          setSearchValue('')
        }
        if (viewMode !== 'cards') {
          // Card view renders no header row for the filter inputs to appear in
          table.setShowColumnFilters(true)
        }
        // A preset can request a non-default comparison (e.g. 'notEquals', 'notContains')
        // for a column via `filterFn` on its value entry. Start from filterFnDefaults so
        // every column any preset ever overrides gets an explicit entry here — falling
        // back to 'contains' — then layer this preset's own overrides on top.
        // Built via Map.set + Object.fromEntries rather than a bracket-assignment reduce:
        // a preset entry's id ends up as a computed object key, and `acc[f.id] = ...`
        // resolves to Object.prototype's __proto__ setter for that one key value — Map
        // keys never touch the prototype chain, and Object.fromEntries defines properties
        // directly rather than going through a property setter.
        const filterFnOverrides = Array.isArray(filter)
          ? Object.fromEntries(
              filter.reduce((acc, f) => {
                if (f?.id && f?.filterFn) acc.set(f.id, f.filterFn)
                return acc
              }, new Map())
            )
          : {}
        table.setColumnFilterFns({ ...filterFnDefaults, ...filterFnOverrides })
        table.setColumnFilters(filter)
        setActiveFilters((prev) => ({
          ...prev,
          table: {
            id: presetId ?? filterName,
            name: filterName,
            type: 'column',
          },
        }))
        persistFilterSlots((cur) => ({
          ...cur,
          table: {
            id: presetId ?? filterName,
            name: filterName,
            type: 'column',
            value: filter,
          },
        }))
      }
      if (filterType === 'reset') {
        table.resetGlobalFilter()
        table.resetColumnFilters()
        table.setColumnFilterFns(filterFnDefaults)
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current)
        }
        setSearchValue('')
        if (api?.data) {
          setGraphFilterData({})
          resetToDefaultVisibility()
        }
        setCurrentEffectiveQueryKey(queryKey || title) // Reset to original query key
        setActiveFilters({ graph: null, table: null }) // Clear active filters
        if (settings.persistFilters && settings.setLastUsedFilter) {
          settings.setLastUsedFilter(pageName, { graph: null, table: null })
        }
      }
      if (filterType === 'graph') {
        const resolvedFilter = resolveFilterVariables(filter)
        const filterProps = [
          '$filter',
          '$select',
          '$expand',
          '$orderby',
          '$count',
          '$search',
          'ReverseTenantLookup',
          'ReverseTenantLookupProperty',
          'AsApp',
        ]
        const graphFilter = filterProps.reduce((acc, prop) => {
          if (resolvedFilter[prop]) {
            acc[prop] = resolvedFilter[prop]
          }
          return acc
        }, {})
        //get api.data, merge with graphFilter, set api.data
        const newQueryKey = `${queryKey ? queryKey : title}-${filterName}`
        setGraphFilterData({
          data: { ...mergeCaseInsensitive(api.data, graphFilter) },
          queryKey: newQueryKey,
        })
        setCurrentEffectiveQueryKey(newQueryKey)
        setActiveFilters((prev) => ({
          ...prev,
          graph: { id: presetId ?? filterName, name: filterName },
        })) // Track active graph filter
        persistFilterSlots((cur) => ({
          ...cur,
          graph: {
            id: presetId ?? filterName,
            name: filterName,
            value: filter,
          },
        }))
        if (filter?.$select) {
          let selectedColumns = []
          if (Array.isArray(filter?.$select)) {
            selectedColumns = filter?.$select
          } else if (typeof filter?.$select === 'string') {
            selectedColumns = filter.$select.split(',')
          }
          if (selectedColumns.length > 0) {
            setConfiguredSimpleColumns(selectedColumns)
            selectedColumns.forEach((col) => {
              setNestedVisibility(col)
            })
          }
        }
      }
    }

    const clearFilterSlot = (layer) => {
      if (layer === 'graph') {
        if (api?.data) {
          setGraphFilterData({})
          resetToDefaultVisibility()
        }
        setCurrentEffectiveQueryKey(queryKey || title)
        setConfiguredSimpleColumns(originalSimpleColumns)
      }
      if (layer === 'table') {
        if (activeFilters.table?.type === 'global') {
          table.resetGlobalFilter()
          if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current)
          }
          setSearchValue('')
        } else {
          table.resetColumnFilters()
        }
      }
      persistFilterSlots((cur) => ({ ...cur, [layer]: null }))
      setActiveFilters((prev) => ({ ...prev, [layer]: null }))
    }

    const handlePresetClick = (filter) => {
      const layer = filter.type === 'graph' ? 'graph' : 'table'
      if (activeFilters[layer]?.id === presetKey(filter)) {
        clearFilterSlot(layer)
      } else {
        setTableFilter(filter.value, filter.type, filter.filterName, filter.id)
      }
    }

    // Pages that compute `filters` asynchronously (or swap them per tenant) need the preset
    // list to follow the prop — state-only init froze it at first render. Deep-equal via
    // JSON: the prop is usually a fresh array literal every render.
    const filtersJson = JSON.stringify(filters ?? [])
    useEffect(() => {
      const propFilters = JSON.parse(filtersJson)
      setFilterList((prev) => {
        const fetchedGraphPresets = (prev ?? []).filter(
          (f) =>
            f.type === 'graph' &&
            !propFilters.some((p) => presetKey(p) === presetKey(f))
        )
        return [...propFilters, ...fetchedGraphPresets]
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtersJson])

    useEffect(() => {
      if (api?.url === '/api/ListGraphRequest' && presetList.isSuccess) {
        var endpoint = api?.data?.Endpoint?.replace(/^\//, '')
        var graphPresetList = []
        GraphExplorerPresets.map((preset) => {
          var presetEndpoint = preset?.params?.endpoint?.replace(/^\//, '')
          if (presetEndpoint === endpoint) {
            graphPresetList.push({
              id: preset?.id,
              filterName: preset?.name,
              value: preset?.params,
              type: 'graph',
            })
          }
        })

        presetList?.data?.Results?.map((preset) => {
          var customPresetEndpoint = preset?.params?.endpoint?.replace(
            /^\//,
            ''
          )
          if (customPresetEndpoint === endpoint) {
            graphPresetList.push({
              id: preset?.id,
              filterName: preset?.name,
              value: preset?.params,
              type: 'graph',
            })
          }
        })

        // update filters to include graph explorer presets
        setFilterList([...filters, ...graphPresetList])
      }
    }, [presetList?.isSuccess, presetList?.data, simpleColumns])

    const graphPresetItems = filterList?.filter((f) => f.type === 'graph') ?? []
    const tablePresetItems = filterList?.filter((f) => f.type !== 'graph') ?? []
    const showFilterSections =
      graphPresetItems.length > 0 && tablePresetItems.length > 0
    const activeSlotCount =
      (activeFilters.graph ? 1 : 0) + (activeFilters.table ? 1 : 0)

    const renderPresetItem = (filter, layer) => (
      <MenuItem
        key={presetKey(filter)}
        onClick={() => {
          setFiltersAnchor(null)
          handlePresetClick(filter)
        }}
      >
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {activeFilters[layer]?.id === presetKey(filter) && (
                <CippIcons.Check sx={{ fontSize: 16, color: 'primary.main' }} />
              )}
              {filter.filterName}
            </Box>
          }
        />
      </MenuItem>
    )

    // count + button share this gate whether rendered inline or portaled into the header
    const bulkActionsContent = (
      <>
        {(table.getIsAllRowsSelected() || table.getIsSomeRowsSelected()) && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '12px', md: '14px' },
              whiteSpace: 'nowrap',
              mr: 1,
            }}
          >
            {table.getSelectedRowModel().rows.length} rows selected
          </Typography>
        )}

        {showBulkActionsButton && (
          <Button
            onClick={popover.handleOpen}
            ref={popover.anchorRef}
            startIcon={
              <SvgIcon fontSize="small">
                <CippIcons.ChevronDownIcon />
              </SvgIcon>
            }
            variant="outlined"
            size="small"
            sx={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
              minWidth: 'auto',
              height: '32px',
              fontSize: { xs: '12px', md: '14px' },
              mr: 1,
            }}
          >
            Bulk Actions
          </Button>
        )}
      </>
    )

    // feeds both CippMobileTableControls (cards) and CippTableFilterSheet (table branch)
    const mobileColumnItems = table
      .getAllColumns()
      .filter((column) => !column.id.startsWith('mrt-'))
      .map((column) => ({
        id: column.id,
        visible: Boolean(column.getIsVisible()),
      }))
    const handleToggleColumn = (columnId, visible) =>
      setColumnVisibility({ ...columnVisibility, [columnId]: !visible })
    const handleExportCsvClick = () =>
      document.querySelector(`[data-csv-export="${title}"]`)?.click()
    const handleExportPdfClick = () =>
      document.querySelector(`[data-pdf-export="${title}"]`)?.click()
    const handleViewApiResponse = () =>
      isInDialog ? setJsonDialogOpen(true) : setOffcanvasVisible(true)
    const handleEditGraphFilters =
      api?.url === '/api/ListGraphRequest' ? () => setFilterCanvasVisible(true) : undefined
    const handleResetFilters = () => setTableFilter('', 'reset', '')
    const mobileIsRefreshing = Boolean(
      getRequestData?.isFetching || refreshFunction?.isFetching
    )

    return (
      <>
        {viewMode === 'cards' ? (
          <CippMobileTableControls
            table={table}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onRefresh={handleRefresh}
            isRefreshing={mobileIsRefreshing}
            selectionEnabled={Boolean(table.options.enableRowSelection)}
            selectMode={selectMode}
            onSelectModeChange={onSelectModeChange}
            selectModeLocked={selectModeLocked}
            onViewToggle={onViewToggle}
            customBulkActions={customBulkActions}
            onBulkAction={handleBulkAction}
            graphPresetItems={graphPresetItems}
            tablePresetItems={tablePresetItems}
            activeFilters={activeFilters}
            activeSlotCount={activeSlotCount}
            presetKey={presetKey}
            onPresetClick={handlePresetClick}
            onResetFilters={handleResetFilters}
            onEditGraphFilters={handleEditGraphFilters}
            columnItems={mobileColumnItems}
            onToggleColumn={handleToggleColumn}
            exportEnabled={exportEnabled}
            onExportCsv={handleExportCsvClick}
            onExportPdf={handleExportPdfClick}
            onViewApiResponse={handleViewApiResponse}
            fixedChrome={!isInDialog}
            embedded={embedded}
            queueTracker={
              queueMetadata?.QueueId ? (
                <CippQueueTracker
                  queueId={queueMetadata?.QueueId}
                  queryKey={currentEffectiveQueryKey}
                  title={title}
                />
              ) : undefined
            }
            dataSourceControls={dataSourceControls}
          />
        ) : (
        <>
        <Box
          ref={toolbarRef}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 1, md: 2 },
            px: 0.5,
            pb: 2,
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            backgroundColor: 'background.paper',
          }}
        >
          {/* Left side - Main controls */}
          <Box
            ref={leftContainerRef}
            sx={{
              display: 'flex',
              gap: { xs: 1, md: 2 },
              alignItems: 'center',
              flex: 1,
              flexWrap: { xs: 'nowrap', md: 'nowrap' },
              minWidth: 0,
            }}
          >
            {/* phones refresh from the options sheet instead */}
            {!mdDown && (
              <Tooltip
                title={
                  getRequestData?.isFetchNextPageError
                    ? 'Could not retrieve all data. Click to try again.'
                    : getRequestData?.isFetching
                      ? 'Retrieving more data...'
                      : 'Refresh data'
                }
              >
                <span>
                  <RefreshButton
                    onClick={handleRefresh}
                    disabled={
                      getRequestData?.isLoading ||
                      getRequestData?.isFetching ||
                      refreshFunction?.isFetching
                    }
                  >
                    <SvgIcon
                      fontSize="small"
                      sx={{
                        animation:
                          getRequestData?.isFetching ||
                          refreshFunction?.isFetching
                            ? 'spin 1s linear infinite'
                            : 'none',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(-360deg)' },
                        },
                      }}
                    >
                      {getRequestData?.isFetchNextPageError ? (
                        <CippIcons.ExclamationCircleIcon color="red" />
                      ) : (
                        <CippIcons.Sync />
                      )}
                    </SvgIcon>
                  </RefreshButton>
                </span>
              </Tooltip>
            )}

            {/* Search Input */}
            <ModernSearchContainer elevation={0}>
              <CippIcons.Search sx={{ color: 'text.secondary', fontSize: 20 }} />
              <ModernSearchInput
                placeholder="Search..."
                value={searchValue}
                onChange={handleSearchChange}
              />
            </ModernSearchContainer>

            {/* Desktop Buttons - always render for measurement, hide when in compact mode */}
            {!mdDown && (
              <Box
                ref={actionsContainerRef}
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexShrink: 0,
                  mt: 0.5,
                  ...(useCompactMode && {
                    position: 'absolute',
                    visibility: 'hidden',
                    pointerEvents: 'none',
                  }),
                }}
              >
                {/* Filters Button */}
                <ModernButton
                  startIcon={<CippIcons.FilterList />}
                  endIcon={<CippIcons.KeyboardArrowDown />}
                  onClick={(event) => setFiltersAnchor(event.currentTarget)}
                  sx={{
                    color:
                      activeSlotCount > 0 ? 'primary.main' : 'text.primary',
                    borderColor:
                      activeSlotCount > 0 ? 'primary.main' : undefined,
                  }}
                >
                  {activeSlotCount > 0
                    ? `Filters (${activeSlotCount})`
                    : 'Filters'}
                </ModernButton>

                {/* Columns Button */}
                <ModernButton
                  startIcon={<CippIcons.ViewColumn />}
                  endIcon={<CippIcons.KeyboardArrowDown />}
                  onClick={(event) => setColumnsAnchor(event.currentTarget)}
                >
                  Columns
                </ModernButton>
                <Menu
                  anchorEl={columnsAnchor}
                  open={Boolean(columnsAnchor)}
                  onClose={() => setColumnsAnchor(null)}
                  slotProps={{
                    paper: { sx: {
                      mt: 1,
                      borderRadius: 2,
                      minWidth: 250,
                      maxHeight: 400,
                    } },
                  }}
                >
                  <MenuItem onClick={resetToPreferedVisibility}>
                    <ListItemText primary="Reset to preferred columns" />
                  </MenuItem>
                  <MenuItem onClick={saveAsPreferedColumns}>
                    <ListItemText primary="Save as preferred columns" />
                  </MenuItem>
                  <MenuItem onClick={resetToDefaultVisibility}>
                    <ListItemText primary="Delete preferred columns" />
                  </MenuItem>
                  <Divider />
                  {table
                    .getAllColumns()
                    .filter((column) => !column.id.startsWith('mrt-'))
                    .map((column) => (
                      <MenuItem
                        key={column.id}
                        onClick={() =>
                          setColumnVisibility({
                            ...columnVisibility,
                            [column.id]: !column.getIsVisible(),
                          })
                        }
                      >
                        <Checkbox
                          checked={Boolean(column.getIsVisible())}
                          size="small"
                        />
                        <ListItemText primary={getCippTranslation(column.id)} />
                      </MenuItem>
                    ))}
                </Menu>

                {/* Export Button */}
                {exportEnabled && (
                  <ModernButton
                    startIcon={<CippIcons.FileDownload />}
                    endIcon={<CippIcons.KeyboardArrowDown />}
                    onClick={(event) => setExportAnchor(event.currentTarget)}
                  >
                    Export
                  </ModernButton>
                )}
              </Box>
            )}

            {/* Compact Action Button — desktop compact mode only, the phone table uses the filter sheet */}
            {!mdDown && useCompactMode && !hasSelection && (
              <Tooltip title="Actions">
                <IconButton
                  aria-label="Actions"
                  onClick={(event) => setActionMenuAnchor(event.currentTarget)}
                  sx={{ flexShrink: 0 }}
                >
                  <CippIcons.MoreVert />
                </IconButton>
              </Tooltip>
            )}

            {/* phones keep the kebab open regardless of selection, the only route to the
                sheet (refresh, export, rows-per-page) down there, not just filters */}
            {(mdDown || (useCompactMode && !hasSelection)) && (
              <IconButton
                aria-label={mdDown ? 'Table options' : 'Filters'}
                onClick={(event) => {
                  if (mdDown) {
                    setMobileFilterSheetOpen(true)
                    return
                  }
                  setFiltersAnchor(event.currentTarget)
                }}
                sx={{
                  flexShrink: 0,
                  ...(mdDown && activeSlotCount > 0 && { color: 'primary.main' }),
                }}
              >
                {mdDown ? (
                  <Badge badgeContent={activeSlotCount} color="primary">
                    <CippIcons.MoreVert />
                  </Badge>
                ) : (
                  <CippIcons.FilterList />
                )}
              </IconButton>
            )}

            {/* way back to cards, far right to match the card bar's toggle position */}
            {tableViewActive && showReturnToCards && (
              <Tooltip title="Return to card view">
                <RefreshButton
                  onClick={onViewToggle}
                  aria-label="Toggle table view"
                  aria-pressed={true}
                >
                  <SvgIcon fontSize="small">
                    {/* destination icon: tapping here returns to cards */}
                    <CippIcons.ViewAgenda />
                  </SvgIcon>
                </RefreshButton>
              </Tooltip>
            )}

            {/* Compact Action Menu — desktop compact mode only */}
            <Menu
              anchorEl={actionMenuAnchor}
              open={Boolean(actionMenuAnchor)}
              onClose={() => setActionMenuAnchor(null)}
              slotProps={{
                paper: { sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 180,
                } },
              }}
            >
              {/* Anchor the nested menus to the stable overflow IconButton — anchoring to
                  event.currentTarget here targets a MenuItem inside a menu that closes in
                  the same tick, which positions the next popover unpredictably. */}
              <MenuItem
                onClick={() => {
                  setColumnsAnchor(actionMenuAnchor)
                  setActionMenuAnchor(null)
                }}
              >
                <ListItemIcon>
                  <CippIcons.ViewColumn />
                </ListItemIcon>
                <ListItemText>Columns</ListItemText>
              </MenuItem>
              {exportEnabled && (
                <MenuItem
                  onClick={() => {
                    setExportAnchor(actionMenuAnchor)
                    setActionMenuAnchor(null)
                  }}
                >
                  <ListItemIcon>
                    <CippIcons.FileDownload />
                  </ListItemIcon>
                  <ListItemText>Export</ListItemText>
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  table.setIsFullScreen(!table.getState().isFullScreen)
                  setActionMenuAnchor(null)
                }}
              >
                <ListItemIcon>
                  <CippIcons.Fullscreen />
                </ListItemIcon>
                <ListItemText>
                  {table.getState().isFullScreen
                    ? 'Exit Fullscreen'
                    : 'Fullscreen'}
                </ListItemText>
              </MenuItem>
            </Menu>

            {/* Filters Menu */}
            <Menu
              anchorEl={filtersAnchor}
              open={Boolean(filtersAnchor)}
              onClose={() => setFiltersAnchor(null)}
              slotProps={{
                paper: { sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 200,
                } },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleColumnFiltersToggle()
                  setFiltersAnchor(null)
                }}
              >
                <ListItemText>
                  {table.getState().showColumnFilters
                    ? 'Hide Column Filters'
                    : 'Show Column Filters'}
                </ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  setTableFilter('', 'reset', '')
                  setFiltersAnchor(null)
                }}
              >
                <ListItemText primary="Reset all filters" />
              </MenuItem>
              {api?.url === '/api/ListGraphRequest' && (
                <MenuItem
                  onClick={() => {
                    setFiltersAnchor(null)
                    setFilterCanvasVisible(true)
                  }}
                >
                  <ListItemText primary="Edit filters" />
                </MenuItem>
              )}
              {showFilterSections && (
                <ListSubheader disableSticky>Graph filters</ListSubheader>
              )}
              {!showFilterSections && graphPresetItems.length > 0 && (
                <Divider />
              )}
              {graphPresetItems.map((filter) =>
                renderPresetItem(filter, 'graph')
              )}
              {showFilterSections && (
                <ListSubheader disableSticky>Table filters</ListSubheader>
              )}
              {!showFilterSections && tablePresetItems.length > 0 && (
                <Divider />
              )}
              {tablePresetItems.map((filter) =>
                renderPresetItem(filter, 'table')
              )}
            </Menu>

            {/* Columns Menu */}
            <Menu
              anchorEl={columnsAnchor}
              open={Boolean(columnsAnchor)}
              onClose={() => setColumnsAnchor(null)}
              slotProps={{
                paper: { sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 250,
                  maxHeight: 400,
                } },
              }}
            >
              <MenuItem onClick={resetToPreferedVisibility}>
                <ListItemText primary="Reset to preferred columns" />
              </MenuItem>
              <MenuItem onClick={saveAsPreferedColumns}>
                <ListItemText primary="Save as preferred columns" />
              </MenuItem>
              <MenuItem onClick={resetToDefaultVisibility}>
                <ListItemText primary="Delete preferred columns" />
              </MenuItem>
              <Divider />
              {table
                .getAllColumns()
                .filter((column) => !column.id.startsWith('mrt-'))
                .map((column) => (
                  <MenuItem
                    key={column.id}
                    onClick={() =>
                      setColumnVisibility({
                        ...columnVisibility,
                        [column.id]: !column.getIsVisible(),
                      })
                    }
                  >
                    <Checkbox
                      checked={Boolean(column.getIsVisible())}
                      size="small"
                    />
                    <ListItemText primary={getCippTranslation(column.id)} />
                  </MenuItem>
                ))}
            </Menu>

            {/* Export Menu */}
            {exportEnabled && (
              <Menu
                anchorEl={exportAnchor}
                open={Boolean(exportAnchor)}
                onClose={() => setExportAnchor(null)}
                slotProps={{
                  paper: { sx: {
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 180,
                  } },
                }}
              >
                <MenuItem
                  onClick={() => {
                    // Trigger CSV export
                    const csvButton = document.querySelector(
                      `[data-csv-export="${title}"]`
                    )
                    if (csvButton) csvButton.click()
                    setExportAnchor(null)
                  }}
                >
                  <ListItemIcon>
                    <CippIcons.TableChart />
                  </ListItemIcon>
                  <ListItemText primary="Export to CSV" />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    // Trigger PDF export
                    const pdfButton = document.querySelector(
                      `[data-pdf-export="${title}"]`
                    )
                    if (pdfButton) pdfButton.click()
                    setExportAnchor(null)
                  }}
                >
                  <ListItemIcon>
                    <CippIcons.PictureAsPdf />
                  </ListItemIcon>
                  <ListItemText primary="Export to PDF" />
                </MenuItem>
                {builtInBulkExportAvailable && (
                  <>
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem
                      onClick={() => {
                        handleExportSelectedToCsv()
                        setExportAnchor(null)
                      }}
                    >
                      <ListItemIcon>
                        <CippIcons.TableChart />
                      </ListItemIcon>
                      <ListItemText primary="Export Selected to CSV" />
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleExportSelectedToPdf()
                        setExportAnchor(null)
                      }}
                    >
                      <ListItemIcon>
                        <CippIcons.PictureAsPdf />
                      </ListItemIcon>
                      <ListItemText primary="Export Selected to PDF" />
                    </MenuItem>
                  </>
                )}
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  onClick={() => {
                    if (isInDialog) {
                      setJsonDialogOpen(true)
                    } else {
                      setOffcanvasVisible(true)
                    }
                    setExportAnchor(null)
                  }}
                >
                  <ListItemIcon>
                    <CippIcons.Code />
                  </ListItemIcon>
                  <ListItemText primary="View API Response" />
                </MenuItem>
              </Menu>
            )}
          </Box>

          {/* Right side - Additional controls */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              flexShrink: 0,
              flexWrap: 'nowrap',
              justifyContent: { xs: 'space-between', md: 'flex-end' },
              width: { xs: '100%', md: 'auto' },
              mt: { xs: 1, md: 0 },
            }}
          >
            {/* Selected rows indicator + Bulk Actions - inline, unless portaled into the header */}
            {!bulkActionsSlot && bulkActionsContent}

            {/* Queue tracker */}
            <CippQueueTracker
              queueId={queueMetadata?.QueueId}
              queryKey={currentEffectiveQueryKey}
              title={title}
            />
          </Box>

        </Box>
        <CippTableFilterSheet
          open={mobileFilterSheetOpen}
          onClose={mobileFilterSheet.cancel}
          onExited={mobileFilterSheet.handleExited}
          run={mobileFilterSheet.run}
          tablePresetItems={tablePresetItems}
          graphPresetItems={graphPresetItems}
          activeFilters={activeFilters}
          presetKey={presetKey}
          onPresetClick={handlePresetClick}
          columnItems={mobileColumnItems}
          onToggleColumn={handleToggleColumn}
          onResetFilters={handleResetFilters}
          onEditGraphFilters={handleEditGraphFilters}
          exportEnabled={exportEnabled}
          onExportCsv={handleExportCsvClick}
          onExportPdf={handleExportPdfClick}
          onViewApiResponse={handleViewApiResponse}
          onRefresh={handleRefresh}
          isRefreshing={mobileIsRefreshing}
          pageSize={table.getState().pagination.pageSize}
          onPageSizeChange={(size) => table.setPageSize(size)}
          pageSizeOptions={[25, 50, 100, 250, 500]}
          dataSourceControls={dataSourceControls}
        />
        </>
        )}

        {bulkActionsSlot && createPortal(bulkActionsContent, bulkActionsSlot)}

        {/* Hidden export buttons for triggering — outside the mode branch so the
            mobile filter sheet's export items can click them too */}
        <Box sx={{ display: 'none' }}>
          <PDFExportButton
            rows={table.getFilteredRowModel().rows}
            columns={usedColumns}
            reportName={title}
            columnVisibility={columnVisibility}
            data-pdf-export={title}
          />
          <CSVExportButton
            reportName={title}
            columnVisibility={columnVisibility}
            rows={table.getFilteredRowModel().rows}
            columns={usedColumns}
            data-csv-export={title}
          />
        </Box>

        {/* Bulk Actions Menu - now inline with toolbar */}
        <Menu
          anchorEl={popover.anchorRef.current}
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          onClose={popover.handleClose}
          open={popover.open}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}
          slotProps={{
            list: {
              dense: true,
              sx: { p: 1 },
            }
          }}
        >
          {actions &&
            customBulkActions.map((action, index) => (
              <MenuItem
                key={index}
                disabled={action.disabled}
                onClick={() => handleBulkAction(action, popover.handleClose)}
              >
                <SvgIcon fontSize="small" sx={{ minWidth: '30px' }}>
                  {action.icon}
                </SvgIcon>
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            ))}
        </Menu>

        {/* API Response Off-Canvas - only show when not in dialog mode */}
        {!isInDialog && (
          <CippOffCanvas
            size="xl"
            title="API Response"
            visible={offcanvasVisible}
            onClose={() => {
              setOffcanvasVisible(false)
            }}
          >
            <Stack spacing={2}>
              <CippCodeBlock
                type="editor"
                code={JSON.stringify(usedData, null, 2)}
                editorHeight="1000px"
                showLineNumbers={!mdDown}
                readOnly={true}
              />
            </Stack>
          </CippOffCanvas>
        )}

        {/* Action Dialog */}
        {actionData.ready && (
          <CippApiDialog
            createDialog={createDialog}
            title="Confirmation"
            fields={actionData.action?.fields}
            api={actionData.action}
            row={actionData.data}
            {...actionData.action}
            relatedQueryKeys={[
              ...(queryKeys
                ? Array.isArray(queryKeys)
                  ? queryKeys
                  : [queryKeys]
                : []),
              ...(Array.isArray(actionData.action?.relatedQueryKeys)
                ? actionData.action.relatedQueryKeys
                : actionData.action?.relatedQueryKeys
                  ? [actionData.action.relatedQueryKeys]
                  : []),
            ].filter(Boolean)}
          />
        )}

        {/* Graph Filter Off-Canvas */}
        <CippOffCanvas
          size="md"
          title="Edit Filters"
          visible={filterCanvasVisible}
          onClose={() => setFilterCanvasVisible(!filterCanvasVisible)}
          contentPadding={1}
          keepMounted={true}
          aboveModal={isInDialog}
        >
          <CippGraphExplorerFilter
            endpointFilter={api?.data?.Endpoint}
            relatedQueryKeys={[queryKey, currentEffectiveQueryKey].filter(
              Boolean
            )}
            selectedPreset={
              activeFilters.graph
                ? (filterList.find(
                    (f) => presetKey(f) === activeFilters.graph.id
                  ) ?? null)
                : null
            }
            onPresetSelect={(preset) => {
              if (preset?.value && preset?.type === 'graph') {
                setTableFilter(
                  preset.value,
                  preset.type,
                  preset.filterName,
                  preset.id
                )
              }
            }}
            onSubmitFilter={(filter) => {
              setTableFilter(filter, 'graph', 'Custom Filter')
              setFilterCanvasVisible(false)
              if (filter?.$select) {
                let selectedColumns = []
                if (Array.isArray(filter?.$select)) {
                  selectedColumns = filter?.$select
                } else if (typeof filter?.$select === 'string') {
                  selectedColumns = filter.$select.split(',')
                }
                if (selectedColumns.length > 0) {
                  setConfiguredSimpleColumns(selectedColumns)
                  selectedColumns.forEach((col) => {
                    setNestedVisibility(col)
                  })
                }
              } else {
                setConfiguredSimpleColumns(originalSimpleColumns)
              }
            }}
            component="card"
          />
        </CippOffCanvas>

        {/* JSON Dialog for when in dialog mode */}
        {isInDialog && (
          <Dialog
            fullWidth
            maxWidth="xl"
            open={jsonDialogOpen}
            onClose={() => setJsonDialogOpen(false)}
            sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
          >
            <DialogTitle>API Response</DialogTitle>
            <DialogContent>
              <CippCodeBlock
                type="editor"
                code={JSON.stringify(usedData, null, 2)}
                editorHeight="600px"
                showLineNumbers={!mdDown}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setJsonDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    );
  }
)

CIPPTableToptoolbar.displayName = 'CIPPTableToptoolbar'
