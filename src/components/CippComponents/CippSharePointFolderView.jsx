import { useEffect, useMemo, useState } from 'react'
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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
import {
  ArrowUpward,
  Clear,
  FilterList,
  Folder,
  FolderOpen,
  FolderShared,
  MoreVert,
  OpenInNew,
  Search as SearchIcon,
} from '@mui/icons-material'

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

const RowActionsMenu = ({ item, actions = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const available = actions.filter((action) => {
    if (typeof action.condition === 'function') return action.condition(item)
    return true
  })

  if (!available.length) return null

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Actions for ${item.displayName ?? item.name ?? 'item'}`}
        onClick={(event) => {
          event.stopPropagation()
          setAnchorEl(event.currentTarget)
        }}
      >
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {available.map((action) => (
          <MenuItem
            key={action.label}
            onClick={() => {
              setAnchorEl(null)
              action.onClick?.(item)
            }}
            component={action.href ? 'a' : 'li'}
            href={action.href?.(item)}
            target={action.href ? '_blank' : undefined}
            rel={action.href ? 'noopener noreferrer' : undefined}
          >
            {action.icon ? <ListItemIcon>{action.icon}</ListItemIcon> : null}
            <ListItemText>{action.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

RowActionsMenu.propTypes = {
  item: PropTypes.object.isRequired,
  actions: PropTypes.array,
}

const formatFileCount = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString()
}

const COLUMNS = [
  { id: 'name', label: 'Name', align: 'left', width: undefined, defaultDir: 'asc' },
  { id: 'webUrl', label: 'URL', align: 'center', width: 72, defaultDir: 'asc' },
  { id: 'siteType', label: 'Type', align: 'left', width: '14%', defaultDir: 'asc' },
  { id: 'fileCount', label: 'Files', align: 'right', width: '10%', defaultDir: 'desc' },
  { id: 'size', label: 'Size (GB)', align: 'right', width: '10%', defaultDir: 'desc' },
  { id: 'created', label: 'Created', align: 'left', width: '16%', defaultDir: 'desc' },
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
  [item?.displayName, item?.name, item?.webUrl, item?.siteType, item?.type]
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
 * Columns: Name, URL, Type, Files, Size (GB), Created.
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
}) => {
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTypes, setFilterTypes] = useState([])
  const [minSizeBytes, setMinSizeBytes] = useState(0)
  const [filterAnchor, setFilterAnchor] = useState(null)

  const pathKey = path.map((crumb) => crumb?.id ?? crumb?.webUrl ?? '').join('/')
  useEffect(() => {
    setSearchQuery('')
    setFilterTypes([])
    setMinSizeBytes(0)
    setFilterAnchor(null)
  }, [pathKey])

  const handleCrumbClick = (index) => {
    if (!onNavigate) return
    if (index < 0) {
      onNavigate([])
    } else {
      onNavigate(path.slice(0, index + 1))
    }
  }

  const canGoUp = path.length > 0
  const handleGoUp = () => {
    if (!canGoUp || !onNavigate) return
    onNavigate(path.slice(0, -1))
  }

  const handleSort = (columnId) => {
    const column = COLUMNS.find((col) => col.id === columnId)
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

  const filtersActive = filterTypes.length > 0 || minSizeBytes > 0
  const activeFilterCount = filterTypes.length + (minSizeBytes > 0 ? 1 : 0)

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
  const searchPlaceholder = canGoUp ? 'Search libraries…' : 'Search sites…'

  const clearFilters = () => {
    setFilterTypes([])
    setMinSizeBytes(0)
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

  const showTable = !isFetching && (canGoUp || items.length > 0)

  return (
    <Card sx={{ p: 2, minHeight: 360, height: '100%' }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Breadcrumbs aria-label="SharePoint browser path" sx={{ flex: 1, minWidth: 0 }}>
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
                  <Typography key={crumb.id ?? index} color="text.primary">
                    {crumb.displayName ?? crumb.name}
                  </Typography>
                )
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
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
          >
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 0.25, mr: 0 }}>
                    <SearchIcon sx={{ fontSize: 18, color: 'action.active' }} />
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
                      <Clear sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
            <Badge color="primary" badgeContent={activeFilterCount || null} overlap="circular">
              <Button
                size="small"
                variant={filtersActive ? 'contained' : 'outlined'}
                startIcon={<FilterList />}
                onClick={(event) => setFilterAnchor(event.currentTarget)}
                disabled={isFetching || items.length === 0}
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
                <Stack direction="row" alignItems="center" justifyContent="space-between">
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
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Type
                  </Typography>
                  {availableTypes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
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
                              <Typography component="span" variant="caption" color="text.secondary">
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

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
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
              </Stack>
            </Popover>
          </Stack>
        </Stack>

        {filtersActive ? (
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
            {filterTypes.map((label) => (
              <Chip
                key={label}
                size="small"
                label={label}
                onDelete={() => toggleType(label)}
              />
            ))}
            {minSizeBytes > 0 ? (
              <Chip
                size="small"
                label={sizeFilterLabel(minSizeBytes)}
                onDelete={() => setMinSizeBytes(0)}
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
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
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
                      inputProps={{ 'aria-label': 'Select all' }}
                    />
                  </TableCell>
                  {COLUMNS.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sortDirection={sortBy === column.id ? sortDir : false}
                      sx={{
                        fontWeight: 600,
                        width: column.width,
                        ...(column.id === 'created'
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
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <ArrowUpward
                          fontSize="small"
                          sx={{ color: 'text.secondary', flexShrink: 0 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ..
                        </Typography>
                        <Typography variant="body2" color="text.disabled" noWrap>
                          Go up
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    </TableCell>
                    <TableCell padding="checkbox" />
                  </TableRow>
                ) : null}
                {noMatches ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
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
                    <TableCell colSpan={8}>
                      <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        {emptyMessage}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
                {sortedItems.map((item) => {
                  const checked = checkedIdSet.has(item.id)
                  const isSite =
                    item.type === 'site' || item.canOpen
                  const Icon = isSite ? (checked ? FolderOpen : Folder) : FolderShared

                  return (
                    <TableRow
                      key={item.id}
                      hover
                      selected={checked}
                      tabIndex={0}
                      aria-selected={checked}
                      onClick={(event) => handleRowActivate(event, item)}
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
                          inputProps={{
                            'aria-label': `Select ${item.displayName ?? item.name ?? 'item'}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
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
                              <OpenInNew fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
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
                        <Typography variant="body2" noWrap color="text.secondary">
                          {formatFileCount(item.fileCount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatSizeMbTooltip(item.storageUsedInBytes) ? (
                          <Tooltip title={formatSizeMbTooltip(item.storageUsedInBytes)}>
                            <Typography
                              variant="body2"
                              noWrap
                              color="text.secondary"
                              component="span"
                            >
                              {formatSizeGbLabel(item.storageUsedInBytes)}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" noWrap color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap color="text.secondary">
                          {formatDate(item.createdDateTime)}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align="right"
                        padding="checkbox"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <RowActionsMenu item={item} actions={rowActions} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Card>
  )
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
}
