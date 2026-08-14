import { useState, useMemo, useCallback, useEffect, memo } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Skeleton,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import {
  CloudDownload,
  Search,
  ViewList,
  ViewModule,
  Visibility,
} from '@mui/icons-material'
import { Virtuoso } from 'react-virtuoso'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from './CippApiResults'
import { CippAutoComplete } from './CippAutocomplete'
import { CippCopyToClipBoard } from './CippCopyToClipboard'
import CippJsonView from '../CippFormPages/CippJSONView'

export const templateTypeLabels = {
  BaselineTemplate: 'Baseline',
  IntuneTemplate: 'Intune Policy',
  CATemplate: 'Conditional Access',
  StandardsTemplate: 'Standards',
  StandardsTemplateV2: 'Standards',
  ReportBuilderTemplate: 'Report Builder',
  GroupTemplate: 'Group',
  AppApprovalTemplate: 'App Approval',
  BPATemplate: 'Best Practices Report',
  TransportTemplate: 'Transport Rule',
  ExConnectorTemplate: 'Exchange Connector',
  AppTemplate: 'Application',
  ContactTemplate: 'Contact',
  JITAdminTemplate: 'JIT Admin',
  UserDefaultTemplate: 'User Defaults',
  AssignmentFilterTemplate: 'Assignment Filter',
  IntuneReusableSettingTemplate: 'Intune Reusable Setting',
  SharePointTemplate: 'SharePoint',
  DlpCompliancePolicyTemplate: 'DLP Policy',
  RetentionCompliancePolicyTemplate: 'Retention Policy',
  SensitivityLabelTemplate: 'Sensitivity Label',
  SensitiveInfoTypeTemplate: 'Sensitive Info Type',
  CustomTest: 'Custom Test',
  Other: 'Other',
}

export const getTemplateTypeLabel = (type) => {
  if (!type) return 'Other'
  return (
    templateTypeLabels[type] ??
    type.replace(/Template$/, '').replace(/([a-z])([A-Z])/g, '$1 $2')
  )
}

const jsonViewTypeForTemplate = (type) => {
  if (type === 'CATemplate') return 'conditionalaccess'
  if (type === 'StandardsTemplate' || type === 'StandardsTemplateV2')
    return 'standards'
  if (type === 'IntuneTemplate') return 'intune'
  return undefined
}

const itemKey = (item) => `${item.Repository}|${item.Path}`

// Memoized template card, modeled on the StandardCard pattern in CippStandardDialog
const TemplateCard = memo(
  ({
    item,
    gridSize,
    isSelected,
    onToggleSelect,
    onPreview,
    onImport,
    isImporting,
  }) => {
    return (
      <Grid size={gridSize}>
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {item.UpdateAvailable ? (
            <Chip
              label="Update Available"
              size="small"
              color="warning"
              sx={{
                position: 'absolute',
                top: -10,
                left: 12,
                zIndex: 1,
                fontSize: '0.7rem',
                height: 20,
                fontWeight: 'bold',
              }}
            />
          ) : item.Imported ? (
            <Chip
              label="Imported"
              size="small"
              color="success"
              sx={{
                position: 'absolute',
                top: -10,
                left: 12,
                zIndex: 1,
                fontSize: '0.7rem',
                height: 20,
                fontWeight: 'bold',
              }}
            />
          ) : null}
          <Card
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              flex: 1,
              position: 'relative',
              ...(item.Imported &&
                !item.UpdateAvailable && {
                  borderColor: 'success.main',
                }),
              ...(item.UpdateAvailable && {
                borderColor: 'warning.main',
              }),
            }}
          >
            <CardContent sx={{ flexGrow: 1, pt: 2.5, pb: 1 }}>
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'medium',
                    wordBreak: 'break-word',
                    flexGrow: 1,
                  }}
                >
                  {item.DisplayName}
                </Typography>
                <Checkbox
                  checked={isSelected}
                  onChange={() => onToggleSelect(item)}
                  size="small"
                  sx={{ mt: -0.75, mr: -1 }}
                />
              </Stack>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={getTemplateTypeLabel(item.Type)}
                  size="small"
                  color="primary"
                />
              </Box>
              {item.Category && item.Category !== 'General' && (
                <Box sx={{ mt: 1 }}>
                  <CippCopyToClipBoard
                    type="chip"
                    text={item.Category}
                    sx={{ maxWidth: '100%' }}
                  />
                </Box>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5 }}
                noWrap
              >
                Repository:{' '}
                <Link
                  href={`https://github.com/${item.Repository}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.Repository}
                </Link>
              </Typography>
            </CardContent>
            <Divider />
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1 }}>
              <Button
                size="small"
                startIcon={<Visibility />}
                onClick={() => onPreview(item)}
              >
                Preview
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<CloudDownload />}
                onClick={() => onImport(item)}
                disabled={isImporting}
              >
                Import
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Grid>
    )
  },
  (prev, next) =>
    prev.item === next.item &&
    prev.gridSize === next.gridSize &&
    prev.isSelected === next.isSelected &&
    prev.isImporting === next.isImporting
)

TemplateCard.displayName = 'TemplateCard'

// Row-virtualized grid, modeled on VirtualizedStandardGrid in CippStandardDialog
const VirtualizedTemplateGrid = memo(
  ({ items, renderItem, itemsPerRowOverride }) => {
    const computeItemsPerRow = useCallback(() => {
      if (itemsPerRowOverride) return itemsPerRowOverride
      return window.innerWidth > 1200 ? 3 : window.innerWidth > 600 ? 2 : 1
    }, [itemsPerRowOverride])

    const [itemsPerRow, setItemsPerRow] = useState(computeItemsPerRow)

    useEffect(() => {
      const handleResize = () => setItemsPerRow(computeItemsPerRow())
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [computeItemsPerRow])

    const rows = useMemo(() => {
      const rowCount = Math.ceil(items.length / itemsPerRow)
      const rowsData = []
      for (let i = 0; i < rowCount; i++) {
        rowsData.push(items.slice(i * itemsPerRow, (i + 1) * itemsPerRow))
      }
      return rowsData
    }, [items, itemsPerRow])

    const gridSize = 12 / itemsPerRow

    return (
      <Virtuoso
        style={{ height: '100%', width: '100%' }}
        totalCount={rows.length}
        overscan={5}
        defaultItemHeight={200}
        itemContent={(index) => (
          <Box
            sx={{
              pt: index === 0 ? 1.2 : 2,
              pb: index === rows.length - 1 ? 3 : 0,
            }}
          >
            <Grid
              container
              spacing={2}
              sx={{
                width: '100%',
                m: 0,
                display: 'flex',
                alignItems: 'stretch',
              }}
            >
              {rows[index].map((item) => renderItem(item, gridSize))}
            </Grid>
          </Box>
        )}
      />
    )
  }
)

VirtualizedTemplateGrid.displayName = 'VirtualizedTemplateGrid'

// Compact list view, modeled on CompactStandardList in CippStandardDialog
const CompactTemplateList = memo(
  ({ items, selected, onToggleSelect, onPreview, onImport, isImporting }) => {
    return (
      <List sx={{ width: '98%', bgcolor: 'background.paper', pb: 3 }}>
        {items.map((item) => {
          const key = itemKey(item)
          const isSelected = !!selected[key]
          return (
            <ListItem
              key={key}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' },
                pr: 20,
              }}
            >
              <Checkbox
                checked={isSelected}
                onChange={() => onToggleSelect(item)}
                size="small"
                sx={{ mr: 1 }}
              />
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 'medium' }}
                    >
                      {item.DisplayName}
                    </Typography>
                    <Chip
                      label={getTemplateTypeLabel(item.Type)}
                      size="small"
                      color="primary"
                    />
                    {item.Category && item.Category !== 'General' && (
                      <CippCopyToClipBoard type="chip" text={item.Category} />
                    )}
                    {item.UpdateAvailable ? (
                      <Chip
                        label="Update Available"
                        size="small"
                        color="warning"
                      />
                    ) : item.Imported ? (
                      <Chip label="Imported" size="small" color="success" />
                    ) : null}
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    Repository:{' '}
                    <Link
                      href={`https://github.com/${item.Repository}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.Repository}
                    </Link>
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onPreview(item)}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onImport(item)}
                    disabled={isImporting}
                  >
                    Import
                  </Button>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          )
        })}
      </List>
    )
  }
)

CompactTemplateList.displayName = 'CompactTemplateList'

export const CippTemplateCatalog = ({
  typeFilter = null,
  variant = 'page',
  relatedQueryKeys = [],
  selectedSources,
  onSelectedSourcesChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('card')
  const [selected, setSelected] = useState({})
  const [forceImport, setForceImport] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [internalSources, setInternalSources] = useState([])

  const sources = selectedSources ?? internalSources
  const setSources = onSelectedSourcesChange ?? setInternalSources

  const catalog = ApiGetCall({
    url: '/api/ListCommunityRepoTemplates',
    queryKey: 'CommunityRepoTemplates',
    waiting: true,
  })

  const importMutation = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [...relatedQueryKeys, 'CommunityRepoTemplates'],
  })

  const previewQuery = ApiGetCall({
    url: '/api/ListCommunityRepoTemplates',
    data: {
      FullName: previewItem?.Repository || '',
      Path: previewItem?.Path || '',
      Branch: previewItem?.Branch || 'main',
    },
    queryKey: `CommunityRepoTemplate-Preview-${previewItem?.Repository}-${previewItem?.Path}`,
    waiting: !!previewItem,
  })

  const previewObject = useMemo(() => {
    let content = previewQuery.data?.Results?.content?.trim() || '{}'
    content = content.replace(
      /^[\u0000-\u001F\u007F-\u009F]+|[\u0000-\u001F\u007F-\u009F]+$/g,
      ''
    )
    try {
      let parsed = JSON.parse(content)
      // CIPP-native repo files are table entities whose JSON property holds the template
      if (parsed?.JSON && typeof parsed.JSON === 'string') {
        try {
          parsed = JSON.parse(parsed.JSON)
        } catch {
          // keep outer object
        }
      }
      return parsed
    } catch {
      return {}
    }
  }, [previewQuery.data])

  // Base item set: everything the endpoint returned, restricted to the caller's types
  const allItems = useMemo(() => {
    const data = catalog.data?.Results
    const arr = Array.isArray(data) ? data : []
    if (Array.isArray(typeFilter) && typeFilter.length > 0) {
      // PossibleTypes covers multi-type repos whose files can't be typed per-file
      return arr.filter(
        (item) =>
          typeFilter.includes(item.Type) ||
          (Array.isArray(item.PossibleTypes) &&
            item.PossibleTypes.some((type) => typeFilter.includes(type)))
      )
    }
    return arr
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog.data, JSON.stringify(typeFilter)])

  const { allSources, allTypes, allCategories } = useMemo(() => {
    const sourceSet = new Set()
    const typeSet = new Set()
    const categorySet = new Set()
    allItems.forEach((item) => {
      if (item.Repository) sourceSet.add(item.Repository)
      if (item.Type) typeSet.add(item.Type)
      if (item.Category) categorySet.add(item.Category)
    })
    return {
      allSources: Array.from(sourceSet).sort(),
      allTypes: Array.from(typeSet).sort(),
      allCategories: Array.from(categorySet).sort(),
    }
  }, [allItems])

  const filteredItems = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase()
    return allItems
      .filter((item) => {
        if (sources.length > 0 && !sources.includes(item.Repository))
          return false
        if (selectedTypes.length > 0 && !selectedTypes.includes(item.Type))
          return false
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes(item.Category)
        )
          return false
        if (statusFilter === 'notimported' && item.Imported) return false
        if (statusFilter === 'imported' && !item.Imported) return false
        if (statusFilter === 'updates' && !item.UpdateAvailable) return false
        if (searchLower) {
          return (
            item.DisplayName?.toLowerCase().includes(searchLower) ||
            item.Category?.toLowerCase().includes(searchLower) ||
            item.Path?.toLowerCase().includes(searchLower) ||
            item.Repository?.toLowerCase().includes(searchLower)
          )
        }
        return true
      })
      .sort((a, b) => (a.DisplayName || '').localeCompare(b.DisplayName || ''))
  }, [
    allItems,
    sources,
    selectedTypes,
    selectedCategories,
    statusFilter,
    searchQuery,
  ])

  const selectedItems = useMemo(() => {
    const byKey = new Map(allItems.map((item) => [itemKey(item), item]))
    return Object.keys(selected)
      .filter((key) => selected[key] && byKey.has(key))
      .map((key) => byKey.get(key))
  }, [selected, allItems])

  const handleToggleSelect = useCallback((item) => {
    setSelected((prev) => ({ ...prev, [itemKey(item)]: !prev[itemKey(item)] }))
  }, [])

  const importItems = useCallback(
    (items) => {
      if (!items.length) return
      importMutation.mutate({
        url: '/api/ExecCommunityRepo',
        bulkRequest: true,
        data: items.map((item) =>
          item.Type === 'CustomTest'
            ? {
                Action: 'ImportScript',
                FullName: item.Repository,
                Path: item.Path,
                Branch: item.Branch,
              }
            : {
                Action: 'ImportTemplate',
                FullName: item.Repository,
                Path: item.Path,
                Branch: item.Branch,
                Force: forceImport,
              }
        ),
      })
    },
    [importMutation, forceImport]
  )

  const handleImportSingle = useCallback(
    (item) => importItems([item]),
    [importItems]
  )
  const handleImportSelected = useCallback(
    () => importItems(selectedItems),
    [importItems, selectedItems]
  )

  const handlePreview = useCallback((item) => setPreviewItem(item), [])

  const allFilteredSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selected[itemKey(item)])

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected({})
    } else {
      const next = {}
      filteredItems.forEach((item) => {
        next[itemKey(item)] = true
      })
      setSelected(next)
    }
  }

  const renderCard = useCallback(
    (item, gridSize) => (
      <TemplateCard
        key={itemKey(item)}
        item={item}
        gridSize={gridSize}
        isSelected={!!selected[itemKey(item)]}
        onToggleSelect={handleToggleSelect}
        onPreview={handlePreview}
        onImport={handleImportSingle}
        isImporting={importMutation.isPending}
      />
    ),
    [
      selected,
      handleToggleSelect,
      handlePreview,
      handleImportSingle,
      importMutation.isPending,
    ]
  )

  const warnings = Array.isArray(catalog.data?.Metadata?.Warnings)
    ? catalog.data.Metadata.Warnings
    : []

  const toOptions = (values, labelFn) =>
    values.map((value) => ({ label: labelFn ? labelFn(value) : value, value }))

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Search + filter controls */}
      <Box sx={{ flexShrink: 0 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: variant === 'drawer' ? 12 : 4 }}>
            <TextField
              fullWidth
              label="Search Templates"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              placeholder="Search by name, category, or repository..."
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: 'text.secondary' }} />
                ),
              }}
            />
          </Grid>
          {allSources.length > 1 && (
            <Grid size={{ xs: 12, sm: 6, md: variant === 'drawer' ? 4 : 2.5 }}>
              <CippAutoComplete
                fullWidth
                multiple={true}
                creatable={false}
                label="Repository"
                placeholder="All repositories"
                options={toOptions(allSources)}
                value={toOptions(sources)}
                onChange={(newValue) =>
                  setSources(
                    Array.isArray(newValue)
                      ? newValue.map((option) => option.value)
                      : []
                  )
                }
              />
            </Grid>
          )}
          {allTypes.length > 1 && (
            <Grid size={{ xs: 12, sm: 6, md: variant === 'drawer' ? 4 : 2.5 }}>
              <CippAutoComplete
                fullWidth
                multiple={true}
                creatable={false}
                label="Type"
                placeholder="All types"
                options={toOptions(allTypes, getTemplateTypeLabel)}
                value={toOptions(selectedTypes, getTemplateTypeLabel)}
                onChange={(newValue) =>
                  setSelectedTypes(
                    Array.isArray(newValue)
                      ? newValue.map((option) => option.value)
                      : []
                  )
                }
              />
            </Grid>
          )}
          {allCategories.length > 1 && (
            <Grid size={{ xs: 12, sm: 6, md: variant === 'drawer' ? 4 : 3 }}>
              <CippAutoComplete
                fullWidth
                multiple={true}
                creatable={false}
                label="Category"
                placeholder="All categories"
                options={toOptions(allCategories)}
                value={toOptions(selectedCategories)}
                onChange={(newValue) =>
                  setSelectedCategories(
                    Array.isArray(newValue)
                      ? newValue.map((option) => option.value)
                      : []
                  )
                }
              />
            </Grid>
          )}
        </Grid>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 2 }}
        >
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={(e, newMode) => {
              if (newMode !== null) setViewMode(newMode)
            }}
          >
            <ToggleButton value="card" aria-label="card view">
              <ViewModule fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewList fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            size="small"
            onChange={(e, newValue) => {
              if (newValue !== null) setStatusFilter(newValue)
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="notimported">Not Imported</ToggleButton>
            <ToggleButton value="imported">Imported</ToggleButton>
            <ToggleButton value="updates">Updates</ToggleButton>
          </ToggleButtonGroup>

          <FormControlLabel
            control={
              <Checkbox
                checked={allFilteredSelected}
                indeterminate={selectedItems.length > 0 && !allFilteredSelected}
                onChange={handleToggleSelectAll}
                size="small"
              />
            }
            label={
              selectedItems.length > 0
                ? `${selectedItems.length} selected`
                : `Select all (${filteredItems.length})`
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={forceImport}
                onChange={(e) => setForceImport(e.target.checked)}
                size="small"
              />
            }
            label="Force re-import"
          />
          <Button
            variant="contained"
            size="small"
            startIcon={
              importMutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <CloudDownload />
              )
            }
            onClick={handleImportSelected}
            disabled={selectedItems.length === 0 || importMutation.isPending}
          >
            Import Selected
          </Button>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: 'auto' }}
          >
            Showing {filteredItems.length} of {allItems.length} templates
          </Typography>
        </Stack>

        {warnings.map((warning, idx) => (
          <Alert key={idx} severity="warning" sx={{ mb: 1 }}>
            {warning}
          </Alert>
        ))}

        <Box sx={{ flexShrink: 0 }}>
          <CippApiResults apiObject={importMutation} />
        </Box>
      </Box>

      {/* Results */}
      {catalog.isLoading ? (
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {[...Array(6)].map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Skeleton variant="rectangular" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : filteredItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No templates match your search and filter criteria
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Try adjusting your search terms or clearing some filters
          </Typography>
        </Box>
      ) : viewMode === 'card' ? (
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <VirtualizedTemplateGrid
            items={filteredItems}
            renderItem={renderCard}
            itemsPerRowOverride={variant === 'drawer' ? 2 : undefined}
          />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
          <CompactTemplateList
            items={filteredItems}
            selected={selected}
            onToggleSelect={handleToggleSelect}
            onPreview={handlePreview}
            onImport={handleImportSingle}
            isImporting={importMutation.isPending}
          />
        </Box>
      )}

      {/* Preview dialog */}
      <Dialog
        fullWidth
        maxWidth="xl"
        open={!!previewItem}
        onClose={() => setPreviewItem(null)}
      >
        <DialogTitle>
          {previewItem?.DisplayName || 'Template Details'}
        </DialogTitle>
        <DialogContent>
          {previewQuery.isFetching ? (
            <Box>
              <Skeleton height={300} variant="rectangular" />
            </Box>
          ) : (
            <CippJsonView
              object={previewObject}
              type={jsonViewTypeForTemplate(previewItem?.Type)}
              defaultOpen={true}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={() => {
              importItems([previewItem])
              setPreviewItem(null)
            }}
            disabled={importMutation.isPending}
          >
            Import
          </Button>
          <Button variant="outlined" onClick={() => setPreviewItem(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
