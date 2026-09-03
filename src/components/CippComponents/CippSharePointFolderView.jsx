import { useEffect, useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import PropTypes from 'prop-types'
import {
  Alert,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Popover,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { hasTextSelection } from '../CippTable/util-row-text-interaction'
import {
  CippSharePointBrowserContextMenu,
  CippSharePointBrowserRowActions,
  filterSharePointBrowserRowActions,
} from './CippSharePointBrowserRowActions'

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() <= 1) return '—'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatSizeGb = (bytes) => {
  if (bytes === null || bytes === undefined || bytes === '') return null
  const num = Number(bytes)
  if (Number.isNaN(num)) return null
  return num / (1024 * 1024 * 1024)
}

const formatSizeMb = (bytes) => {
  if (bytes === null || bytes === undefined || bytes === '') return null
  const num = Number(bytes)
  if (Number.isNaN(num)) return null
  return num / (1024 * 1024)
}

const formatSizeGbLabel = (bytes) => {
  const gb = formatSizeGb(bytes)
  if (gb === null) return '—'
  return gb.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

const formatSizeMbTooltip = (bytes) => {
  const mb = formatSizeMb(bytes)
  if (mb === null) return null
  return `${mb.toLocaleString(undefined, { maximumFractionDigits: 2 })} MB`
}

const isRowClickTarget = (event) =>
  event.target?.closest?.(
    'button, a, input, textarea, select, [role="button"], [role="menuitem"], [data-no-row-click="true"]'
  )

const formatFileCount = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString()
}

const BROWSE_COLUMNS = [
  { id: 'name', label: 'Name', align: 'left', width: undefined, defaultDir: 'asc' },
  { id: 'webUrl', label: 'URL', align: 'center', width: 72, defaultDir: 'asc' },
  { id: 'siteType', label: 'Type', align: 'left', width: '14%', defaultDir: 'asc' },
  { id: 'fileCount', label: 'Files', align: 'right', width: '10%', defaultDir: 'desc' },
  { id: 'size', label: 'Size (GB)', align: 'right', width: '10%', defaultDir: 'desc' },
  { id: 'created', label: 'Created', align: 'left', width: '16%', defaultDir: 'desc' },
]

const RECYCLE_COLUMNS = [
  { id: 'name', label: 'Name', align: 'left', width: undefined, defaultDir: 'asc' },
  { id: 'siteType', label: 'Type', align: 'left', width: '12%', defaultDir: 'asc' },
  { id: 'size', label: 'Size', align: 'right', width: '10%', defaultDir: 'desc' },
  { id: 'deletedBy', label: 'Deleted by', align: 'left', width: '14%', defaultDir: 'asc' },
  { id: 'created', label: 'Deleted', align: 'left', width: '16%', defaultDir: 'desc' },
  { id: 'itemState', label: 'State', align: 'left', width: '12%', defaultDir: 'asc' },
]

const RECYCLE_LIST_COLUMNS = [
  { id: 'name', label: 'Name', align: 'left', width: undefined, defaultDir: 'asc' },
  { id: 'relativePath', label: 'Path', align: 'left', width: '22%', defaultDir: 'asc' },
  { id: 'siteType', label: 'Type', align: 'left', width: '10%', defaultDir: 'asc' },
  { id: 'size', label: 'Size', align: 'right', width: '8%', defaultDir: 'desc' },
  { id: 'deletedBy', label: 'Deleted by', align: 'left', width: '12%', defaultDir: 'asc' },
  { id: 'created', label: 'Deleted', align: 'left', width: '14%', defaultDir: 'desc' },
  { id: 'itemState', label: 'State', align: 'left', width: '10%', defaultDir: 'asc' },
]

const getSortValue = (item, columnId) => {
  switch (columnId) {
    case 'name':
      return (item.displayName ?? item.name ?? '').toString().toLocaleLowerCase()
    case 'webUrl':
      return (item.webUrl ?? '').toString().toLocaleLowerCase()
    case 'siteType':
      return (item.siteType ?? '').toString().toLocaleLowerCase()
    case 'fileCount': {
      const num = Number(item.fileCount)
      return Number.isFinite(num) ? num : null
    }
    case 'size': {
      const num = Number(item.storageUsedInBytes)
      return Number.isFinite(num) ? num : null
    }
    case 'created': {
      const time = item.createdDateTime ? Date.parse(item.createdDateTime) : NaN
      return Number.isFinite(time) ? time : null
    }
    case 'deletedBy':
      return (item.deletedByName ?? '').toString().toLocaleLowerCase()
    case 'itemState':
      return (item.itemState ?? '').toString().toLocaleLowerCase()
    case 'relativePath':
      return (item.relativePath ?? '').toString().toLocaleLowerCase()
    default:
      return null
  }
}

const compareItems = (a, b, columnId, direction) => {
  const aVal = getSortValue(a, columnId)
  const bVal = getSortValue(b, columnId)
  const aEmpty = aVal === null || aVal === undefined || aVal === ''
  const bEmpty = bVal === null || bVal === undefined || bVal === ''

  if (aEmpty && bEmpty) return 0
  if (aEmpty) return 1
  if (bEmpty) return -1

  let result
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    result = aVal - bVal
  } else {
    result = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' })
  }

  return direction === 'asc' ? result : -result
}

const itemSearchText = (item) =>
  [
    item?.displayName,
    item?.name,
    item?.webUrl,
    item?.siteType,
    item?.type,
    item?.deletedByName,
    item?.itemState,
    item?.dirName,
    item?.leafName,
    item?.relativePath,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const matchesSearch = (item, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return itemSearchText(item).includes(q)
}

const GB = 1024 * 1024 * 1024
const SIZE_FILTERS = [
  { label: 'Any size', value: 0 },
  { label: 'Over 1 GB', value: 1 * GB },
  { label: 'Over 10 GB', value: 10 * GB },
  { label: 'Over 50 GB', value: 50 * GB },
  { label: 'Over 100 GB', value: 100 * GB },
]

const RECYCLE_STAGE_FILTERS = [
  { label: 'All stages', value: 'all', chipLabel: null },
  { label: 'First stage', value: 'first', chipLabel: '1st stage' },
  { label: 'Second stage', value: 'second', chipLabel: '2nd stage' },
]

const recycleStageChipLabel = (stage) =>
  RECYCLE_STAGE_FILTERS.find((option) => option.value === stage)?.chipLabel ?? null

const typeLabel = (item) => {
  const label = (item?.siteType ?? '').toString().trim()
  return label || 'Unknown'
}

const matchesFilters = (item, { types, minSizeBytes }) => {
  if (types.length > 0 && !types.includes(typeLabel(item))) return false
  if (minSizeBytes > 0) {
    const bytes = Number(item?.storageUsedInBytes)
    if (!Number.isFinite(bytes) || bytes < minSizeBytes) return false
  }
  return true
}

const sizeFilterLabel = (minSizeBytes) =>
  SIZE_FILTERS.find((option) => option.value === minSizeBytes)?.label ?? 'Any size'

/**
 * Explorer-style details list for the SharePoint site browser.
 * Browse columns: Name, URL, Type, Files, Size (GB), Created.
 * Recycle columns: Name, Type, Size, Deleted by, Deleted, State.
 * Click selects; double-click / Enter opens when canOpen is true.
 */
export const CippSharePointFolderView = ({
  items = [],
  isFetching = false,
  error,
  path = [],
  onNavigate,
  onSelect,
  checkedIds = [],
  onCheckedChange,
  onOpen,
  rowActions = [],
  emptyMessage = 'No items found.',
  mode = 'browse',
  modeSwitch = null,
  infoMessage = null,
  recycleView = 'folders',
  recycleStage = 'all',
  onRecycleStageChange,
  showBreadcrumbs = true,
}) => {
  const isRecycle = mode === 'recycle'
  const isRecycleList = isRecycle && recycleView === 'list'
  const columns = isRecycle
    ? isRecycleList
      ? RECYCLE_LIST_COLUMNS
      : RECYCLE_COLUMNS
    : BROWSE_COLUMNS
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTypes, setFilterTypes] = useState([])
  const [minSizeBytes, setMinSizeBytes] = useState(0)
  const [filterAnchor, setFilterAnchor] = useState(null)
  const [rowContextMenu, setRowContextMenu] = useState(null)

  const pathKey = path.map((crumb) => crumb?.id ?? crumb?.webUrl ?? '').join('/')
  useEffect(() => {
    setSearchQuery('')
    setFilterTypes([])
    setMinSizeBytes(0)
    setFilterAnchor(null)
    setSortBy('name')
    setSortDir('asc')
    setRowContextMenu(null)
  }, [pathKey, mode, recycleView])

  const handleCrumbClick = (index) => {
    if (!onNavigate) return
    if (index < 0) {
      onNavigate([])
    } else {
      onNavigate(path.slice(0, index + 1))
    }
  }

  const canGoUp = path.length > 0 && typeof onNavigate === 'function'
  const handleGoUp = () => {
    if (!canGoUp || !onNavigate) return
    onNavigate(path.slice(0, -1))
  }

  const handleSort = (columnId) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column) return
    if (sortBy === columnId) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortBy(columnId)
    setSortDir(column.defaultDir)
  }

  const availableTypes = useMemo(() => {
    const counts = new Map()
    for (const item of items) {
      const label = typeLabel(item)
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
  }, [items])

  const stageFilterActive = isRecycle && recycleStage !== 'all'
  const filtersActive =
    filterTypes.length > 0 || (!isRecycle && minSizeBytes > 0) || stageFilterActive
  const activeFilterCount =
    filterTypes.length +
    (!isRecycle && minSizeBytes > 0 ? 1 : 0) +
    (stageFilterActive ? 1 : 0)

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          matchesSearch(item, searchQuery) &&
          matchesFilters(item, { types: filterTypes, minSizeBytes })
      ),
    [items, searchQuery, filterTypes, minSizeBytes]
  )

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => compareItems(a, b, sortBy, sortDir))
  }, [filteredItems, sortBy, sortDir])

  const checkedIdSet = useMemo(() => new Set(checkedIds), [checkedIds])
  const allChecked =
    sortedItems.length > 0 && sortedItems.every((item) => checkedIdSet.has(item.id))
  const someChecked = sortedItems.some((item) => checkedIdSet.has(item.id))
  const searchActive = searchQuery.trim().length > 0
  const noMatches =
    (searchActive || filtersActive) && items.length > 0 && sortedItems.length === 0
  const searchPlaceholder = isRecycle
    ? 'Search deleted items…'
    : canGoUp
      ? 'Search libraries…'
      : 'Search sites…'
  const columnCount = columns.length + 2 // checkbox + actions

  const clearFilters = () => {
    setFilterTypes([])
    setMinSizeBytes(0)
    if (isRecycle && recycleStage !== 'all') {
      onRecycleStageChange?.('all')
    }
  }

  const handleRecycleStageChange = (next) => {
    if (!next || next === recycleStage) return
    onRecycleStageChange?.(next)
  }

  const toggleType = (label) => {
    setFilterTypes((prev) =>
      prev.includes(label) ? prev.filter((value) => value !== label) : [...prev, label]
    )
  }

  const handleToggleAll = (event) => {
    event.stopPropagation()
    if (!onCheckedChange) return
    if (allChecked) {
      onCheckedChange([])
    } else {
      onCheckedChange(sortedItems.map((item) => item.id))
    }
  }

  const handleToggleOne = (itemId) => {
    if (!onCheckedChange) return
    if (checkedIdSet.has(itemId)) {
      onCheckedChange(checkedIds.filter((id) => id !== itemId))
    } else {
      onCheckedChange([...checkedIds, itemId])
    }
  }

  // Row click selects that row only; click again clears; Ctrl/Cmd+click toggles multi-select.
  const handleRowActivate = (event, item) => {
    if (!onCheckedChange) {
      onSelect?.(item)
      return
    }
    if (event.ctrlKey || event.metaKey) {
      handleToggleOne(item.id)
    } else if (checkedIds.length === 1 && checkedIds[0] === item.id) {
      onCheckedChange([])
    } else {
      onCheckedChange([item.id])
    }
    onSelect?.(item)
  }

  const handleRowContextMenu = (event, item) => {
    if (!rowActions?.length) return
    if (isRowClickTarget(event) || hasTextSelection()) return
    const available = filterSharePointBrowserRowActions(rowActions, item)
    if (!available.length) return
    event.preventDefault()
    event.stopPropagation()
    // Focus the row for properties / bulk context (explorer-style).
    onCheckedChange?.([item.id])
    onSelect?.(item)
    setRowContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      item,
    })
  }

  const showTable = !isFetching && (canGoUp || items.length > 0)

  return (
    <>
      <Card sx={{ p: 2, minHeight: 360, height: '100%' }}>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            sx={{
              alignItems: { md: 'center' },
              justifyContent: "space-between"
            }}>
            <Stack
              direction="row"
              spacing={1.5}
              useFlexGap
              sx={{
                alignItems: "center",
                flexWrap: "wrap",
                flex: 1,
                minWidth: 0
              }}>
              {modeSwitch}
              {showBreadcrumbs ? (
                <Breadcrumbs
                  aria-label="SharePoint browser path"
                  sx={{ flex: '1 1 160px', minWidth: 0 }}
                >
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    color="inherit"
                    onClick={() => handleCrumbClick(-1)}
                    sx={{ cursor: 'pointer' }}
                  >
                    Sites
                  </Link>
                  {path.map((crumb, index) => {
                    const isLast = index === path.length - 1
                    if (isLast) {
                      return (
                        <Typography key={crumb.id ?? index} sx={{
                          color: "text.primary"
                        }}>
                          {crumb.displayName ?? crumb.name}
                        </Typography>
                      );
                    }
                    return (
                      <Link
                        key={crumb.id ?? index}
                        component="button"
                        type="button"
                        underline="hover"
                        color="inherit"
                        onClick={() => handleCrumbClick(index)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {crumb.displayName ?? crumb.name}
                      </Link>
                    )
                  })}
                </Breadcrumbs>
              ) : null}
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                flexShrink: 0,
                width: { xs: '100%', sm: 'auto' }
              }}>
              <TextField
                size="small"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                disabled={isFetching}
                sx={{
                  width: { xs: '100%', sm: 240 },
                  flex: { xs: 1, sm: 'none' },
                  '& .MuiOutlinedInput-root': {
                    height: 40,
                    boxSizing: 'border-box',
                  },
                  '& .MuiInputAdornment-root': {
                    height: 'auto',
                    maxHeight: 'none',
                    marginTop: '0 !important',
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ ml: 0.25, mr: 0 }}>
                        <CippIcons.Search sx={{ fontSize: 18, color: 'action.active' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery ? (
                      <InputAdornment position="end" sx={{ mr: -0.5 }}>
                        <IconButton
                          size="small"
                          aria-label="Clear search"
                          onClick={() => setSearchQuery('')}
                          edge="end"
                          sx={{ p: 0.5 }}
                        >
                          <CippIcons.Clear sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }
                }}
              />
              <Badge color="primary" badgeContent={activeFilterCount || null} overlap="circular">
                <Button
                  size="small"
                  variant={filtersActive ? 'contained' : 'outlined'}
                  startIcon={<CippIcons.FilterList />}
                  onClick={(event) => setFilterAnchor(event.currentTarget)}
                  disabled={isFetching || (items.length === 0 && !filtersActive)}
                  sx={{
                    height: 40,
                    minHeight: 40,
                    boxSizing: 'border-box',
                    px: 1.5,
                    py: 0,
                  }}
                >
                  Filters
                </Button>
              </Badge>
              <Popover
                open={Boolean(filterAnchor)}
                anchorEl={filterAnchor}
                onClose={() => setFilterAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { width: 300, p: 2 } } }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}>
                    <Typography variant="subtitle2">Filters</Typography>
                    <Button
                      size="small"
                      onClick={clearFilters}
                      disabled={!filtersActive}
                    >
                      Clear
                    </Button>
                  </Stack>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: 'block',
                        mb: 0.5
                      }}>
                      Type
                    </Typography>
                    {availableTypes.length === 0 ? (
                      <Typography variant="body2" sx={{
                        color: "text.secondary"
                      }}>
                        No types in this list.
                      </Typography>
                    ) : (
                      <Stack spacing={0}>
                        {availableTypes.map(({ label, count }) => (
                          <FormControlLabel
                            key={label}
                            control={
                              <Checkbox
                                size="small"
                                checked={filterTypes.includes(label)}
                                onChange={() => toggleType(label)}
                              />
                            }
                            label={
                              <Typography variant="body2">
                                {label}{' '}
                                <Typography component="span" variant="caption" sx={{
                                  color: "text.secondary"
                                }}>
                                  ({count})
                                </Typography>
                              </Typography>
                            }
                            sx={{ mr: 0, ml: 0 }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>

                  <Divider />

                  {isRecycle ? (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: 'block',
                          mb: 0.5
                        }}>
                        Recycle stage
                      </Typography>
                      <RadioGroup
                        value={recycleStage}
                        onChange={(event) => handleRecycleStageChange(event.target.value)}
                      >
                        {RECYCLE_STAGE_FILTERS.map((option) => (
                          <FormControlLabel
                            key={option.value}
                            value={option.value}
                            control={<Radio size="small" />}
                            label={<Typography variant="body2">{option.label}</Typography>}
                            sx={{ mr: 0, ml: 0 }}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                  ) : (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: 'block',
                          mb: 0.5
                        }}>
                        Minimum size
                      </Typography>
                      <RadioGroup
                        value={String(minSizeBytes)}
                        onChange={(event) => setMinSizeBytes(Number(event.target.value))}
                      >
                        {SIZE_FILTERS.map((option) => (
                          <FormControlLabel
                            key={option.value}
                            value={String(option.value)}
                            control={<Radio size="small" />}
                            label={<Typography variant="body2">{option.label}</Typography>}
                            sx={{ mr: 0, ml: 0 }}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                  )}
                </Stack>
              </Popover>
            </Stack>
          </Stack>

          {infoMessage ? (
            <Alert severity="info" sx={{ py: 0.5 }}>
              {infoMessage}
            </Alert>
          ) : null}

          {filtersActive ? (
            <Stack
              direction="row"
              spacing={0.75}
              useFlexGap
              sx={{
                flexWrap: "wrap",
                alignItems: "center"
              }}>
              {filterTypes.map((label) => (
                <Chip
                  key={label}
                  size="small"
                  label={label}
                  onDelete={() => toggleType(label)}
                />
              ))}
              {minSizeBytes > 0 && !isRecycle ? (
                <Chip
                  size="small"
                  label={sizeFilterLabel(minSizeBytes)}
                  onDelete={() => setMinSizeBytes(0)}
                />
              ) : null}
              {stageFilterActive ? (
                <Chip
                  size="small"
                  label={recycleStageChipLabel(recycleStage)}
                  onDelete={() => handleRecycleStageChange('all')}
                />
              ) : null}
              <Button size="small" onClick={clearFilters} sx={{ minWidth: 0, px: 1 }}>
                Clear filters
              </Button>
            </Stack>
          ) : null}

          {error ? (
            <Alert severity="error">{typeof error === 'string' ? error : 'Failed to load items.'}</Alert>
          ) : null}

          {isFetching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : !showTable ? (
            <Typography
              sx={{
                color: "text.secondary",
                py: 4,
                textAlign: 'center'
              }}>
              {emptyMessage}
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 'calc(100vh - 320px)' }}>
              <Table
                size="small"
                stickyHeader
                aria-label="SharePoint browser items"
                sx={{
                  borderCollapse: 'separate',
                  '& .MuiTableCell-stickyHeader': {
                    // Darker than the card paper in both modes (neutral[900] ≈ paper in dark).
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? theme.palette.background.default
                        : alpha(theme.palette.neutral[200], 0.4),
                    backgroundImage: 'none',
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: 48 }}>
                      <Checkbox
                        size="small"
                        indeterminate={someChecked && !allChecked}
                        checked={allChecked}
                        disabled={sortedItems.length === 0}
                        onChange={handleToggleAll}
                        slotProps={{
                          input: { 'aria-label': 'Select all' }
                        }}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        sortDirection={sortBy === column.id ? sortDir : false}
                        sx={{
                          fontWeight: 600,
                          width: column.width,
                          ...(column.id === columns[columns.length - 1]?.id
                            ? { borderRight: 0, pr: 0 }
                            : undefined),
                        }}
                      >
                        <TableSortLabel
                          active={sortBy === column.id}
                          direction={sortBy === column.id ? sortDir : column.defaultDir}
                          onClick={() => handleSort(column.id)}
                          sx={
                            column.align === 'right'
                              ? { flexDirection: 'row-reverse', ml: 'auto' }
                              : column.align === 'center'
                                ? { mx: 'auto' }
                                : undefined
                          }
                        >
                          {column.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                    <TableCell
                      padding="checkbox"
                      sx={{ width: 48, borderLeft: 0, pl: 0 }}
                    />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {canGoUp ? (
                    <TableRow
                      hover
                      tabIndex={0}
                      onClick={handleGoUp}
                      onDoubleClick={handleGoUp}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') handleGoUp()
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox" />
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: "center",
                            minWidth: 0
                          }}>
                          <CippIcons.ArrowUpward
                            fontSize="small"
                            sx={{ color: 'text.secondary', flexShrink: 0 }}
                          />
                          <Typography variant="body2" sx={{
                            color: "text.secondary"
                          }}>
                            ..
                          </Typography>
                          <Typography variant="body2" noWrap sx={{
                            color: "text.disabled"
                          }}>
                            Go up
                          </Typography>
                        </Stack>
                      </TableCell>
                      {columns.slice(1).map((column) => (
                        <TableCell key={column.id} align={column.align}>
                          <Typography variant="body2" sx={{
                            color: "text.secondary"
                          }}>
                            —
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell padding="checkbox" />
                    </TableRow>
                  ) : null}
                  {noMatches ? (
                    <TableRow>
                      <TableCell colSpan={columnCount}>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            py: 2,
                            textAlign: 'center'
                          }}>
                          {searchActive && filtersActive
                            ? `No matches for “${searchQuery.trim()}” with the current filters.`
                            : searchActive
                              ? `No matches for “${searchQuery.trim()}”.`
                              : 'No items match the current filters.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {sortedItems.length === 0 && canGoUp && !searchActive && !filtersActive ? (
                    <TableRow>
                      <TableCell colSpan={columnCount}>
                        <Typography
                          sx={{
                            color: "text.secondary",
                            py: 2,
                            textAlign: 'center'
                          }}>
                          {emptyMessage}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {sortedItems.map((item) => {
                    const checked = checkedIdSet.has(item.id)
                    const isFolderish =
                      item.type === 'site' ||
                      item.type === 'recycleFolder' ||
                      (item.canOpen && item.type !== 'recycleItem')
                    const Icon = isFolderish
                      ? checked
                        ? CippIcons.FolderOpen
                        : CippIcons.Folder
                      : isRecycle
                        ? item.siteType === 'Folder'
                          ? CippIcons.FolderShared
                          : item.siteType === 'List' || item.siteType === 'List Item'
                            ? CippIcons.Description
                            : CippIcons.InsertDriveFile
                        : CippIcons.FolderShared

                    return (
                      <TableRow
                        key={item.id}
                        hover
                        selected={checked}
                        tabIndex={0}
                        aria-selected={checked}
                        onClick={(event) => handleRowActivate(event, item)}
                        onContextMenu={(event) => handleRowContextMenu(event, item)}
                        onDoubleClick={() => {
                          if (item.canOpen) onOpen?.(item)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            if (item.canOpen) onOpen?.(item)
                            else handleRowActivate(event, item)
                          }
                        }}
                        sx={{
                          cursor: 'pointer',
                          borderLeft: (theme) =>
                            checked
                              ? `3px solid ${theme.palette.warning.main}`
                              : '3px solid transparent',
                          '&.Mui-selected': {
                            bgcolor: (theme) =>
                              alpha(
                                theme.palette.warning.main,
                                theme.palette.mode === 'dark' ? 0.22 : 0.14
                              ),
                          },
                          '&.Mui-selected:hover': {
                            bgcolor: (theme) =>
                              alpha(
                                theme.palette.warning.main,
                                theme.palette.mode === 'dark' ? 0.3 : 0.2
                              ),
                          },
                        }}
                      >
                        <TableCell
                          padding="checkbox"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleToggleOne(item.id)
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={checked}
                            onChange={() => handleToggleOne(item.id)}
                            onClick={(event) => event.stopPropagation()}
                            color="warning"
                            slotProps={{
                              input: {
                                'aria-label': `Select ${item.displayName ?? item.name ?? 'item'}`,
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              alignItems: "center",
                              minWidth: 0
                            }}>
                            <Icon
                              fontSize="small"
                              sx={{
                                color: 'warning.main',
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" noWrap title={item.displayName ?? item.name}>
                              {item.displayName ?? item.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        {isRecycle ? (
                          <>
                            {isRecycleList ? (
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  noWrap
                                  title={item.relativePath}
                                  sx={{
                                    color: "text.secondary"
                                  }}
                                >
                                  {item.relativePath || '—'}
                                </Typography>
                              </TableCell>
                            ) : null}
                            <TableCell>
                              <Typography variant="body2" noWrap title={item.siteType}>
                                {item.siteType || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {item.type === 'recycleFolder' && !item.canRestore ? (
                                <Typography variant="body2" noWrap sx={{
                                  color: "text.secondary"
                                }}>
                                  —
                                </Typography>
                              ) : formatSizeMbTooltip(item.storageUsedInBytes) ? (
                                <Tooltip title={formatSizeMbTooltip(item.storageUsedInBytes)}>
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    component="span"
                                    sx={{
                                      color: "text.secondary"
                                    }}
                                  >
                                    {formatSizeGbLabel(item.storageUsedInBytes)}
                                  </Typography>
                                </Tooltip>
                              ) : (
                                <Typography variant="body2" noWrap sx={{
                                  color: "text.secondary"
                                }}>
                                  —
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap title={item.deletedByName}>
                                {item.type === 'recycleFolder' && !item.canRestore
                                  ? '—'
                                  : item.deletedByName || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{
                                color: "text.secondary"
                              }}>
                                {item.type === 'recycleFolder' && !item.canRestore
                                  ? '—'
                                  : formatDate(item.createdDateTime)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap title={item.itemState}>
                                {item.type === 'recycleFolder' && !item.canRestore
                                  ? '—'
                                  : item.itemState || '—'}
                              </Typography>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                              {item.webUrl ? (
                                <Tooltip title="Open in SharePoint">
                                  <IconButton
                                    size="small"
                                    component="a"
                                    href={item.webUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Open ${item.displayName ?? item.name} in SharePoint`}
                                  >
                                    <CippIcons.OpenInNew fontSize="inherit" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Typography variant="body2" sx={{
                                  color: "text.secondary"
                                }}>
                                  —
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap title={item.siteType}>
                                {item.siteType || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" noWrap sx={{
                                color: "text.secondary"
                              }}>
                                {formatFileCount(item.fileCount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {formatSizeMbTooltip(item.storageUsedInBytes) ? (
                                <Tooltip title={formatSizeMbTooltip(item.storageUsedInBytes)}>
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    component="span"
                                    sx={{
                                      color: "text.secondary"
                                    }}
                                  >
                                    {formatSizeGbLabel(item.storageUsedInBytes)}
                                  </Typography>
                                </Tooltip>
                              ) : (
                                <Typography variant="body2" noWrap sx={{
                                  color: "text.secondary"
                                }}>
                                  —
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{
                                color: "text.secondary"
                              }}>
                                {formatDate(item.createdDateTime)}
                              </Typography>
                            </TableCell>
                          </>
                        )}
                        <TableCell
                          align="right"
                          padding="checkbox"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <CippSharePointBrowserRowActions item={item} actions={rowActions} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Stack>
      </Card>
      <CippSharePointBrowserContextMenu
        open={Boolean(rowContextMenu)}
        position={rowContextMenu}
        item={rowContextMenu?.item}
        actions={rowActions}
        onClose={() => setRowContextMenu(null)}
      />
    </>
  );
}

CippSharePointFolderView.propTypes = {
  items: PropTypes.array,
  isFetching: PropTypes.bool,
  error: PropTypes.any,
  path: PropTypes.array,
  onNavigate: PropTypes.func,
  /** @deprecated Selection is driven by checkedIds; kept for optional side-effects. */
  selectedId: PropTypes.string,
  onSelect: PropTypes.func,
  checkedIds: PropTypes.arrayOf(PropTypes.string),
  onCheckedChange: PropTypes.func,
  onOpen: PropTypes.func,
  rowActions: PropTypes.array,
  emptyMessage: PropTypes.string,
  mode: PropTypes.oneOf(['browse', 'recycle']),
  modeSwitch: PropTypes.node,
  infoMessage: PropTypes.node,
  recycleView: PropTypes.oneOf(['folders', 'list']),
  recycleStage: PropTypes.oneOf(['all', 'first', 'second']),
  onRecycleStageChange: PropTypes.func,
  showBreadcrumbs: PropTypes.bool,
}
