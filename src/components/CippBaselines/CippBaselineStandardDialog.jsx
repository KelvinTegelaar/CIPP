import { useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { differenceInDays } from 'date-fns'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { CippAutoComplete } from '../CippComponents/CippAutocomplete'

const impactColors = {
  'Low Impact': 'info',
  'Medium Impact': 'warning',
  'High Impact': 'error',
}

const isNewStandard = (dateAdded) => {
  if (!dateAdded) return false
  return differenceInDays(new Date(), new Date(dateAdded)) <= 30
}

// Extract the base compliance framework from a benchmark tag (same buckets as the
// classic standards picker) so 'CIS M365 3.0 (1.1.1)' style tags filter as one group.
const extractTagFramework = (tag) => {
  if (tag.startsWith('CIS M365')) {
    const versionMatch = tag.match(/CIS M365 (\d+\.\d+)/)
    return versionMatch ? `CIS M365 ${versionMatch[1]}` : 'CIS M365'
  }
  if (tag.startsWith('CISA ')) return 'CISA'
  if (tag.startsWith('EIDSCA.')) return 'EIDSCA'
  if (tag.startsWith('Essential 8')) return 'Essential 8'
  if (tag.startsWith('NIST CSF')) {
    const versionMatch = tag.match(/NIST CSF (\d+\.\d+)/)
    return versionMatch ? `NIST CSF ${versionMatch[1]}` : 'NIST CSF'
  }
  if (tag.startsWith('exo_')) return 'Secure Score - Exchange'
  if (tag.startsWith('mdo_')) return 'Secure Score - Defender'
  if (tag.startsWith('spo_')) return 'Secure Score - SharePoint'
  if (tag.startsWith('mip_')) return 'Secure Score - Purview'
  return null
}

// One sort control instead of separate field + direction dropdowns: each option
// carries its natural reading order.
const sortOptions = [
  { label: 'Name (A-Z)', value: 'label-asc' },
  { label: 'Newest first', value: 'addedDate-desc' },
  { label: 'Category', value: 'category-asc' },
  { label: 'Impact (High-Low)', value: 'impact-desc' },
]

// Benchmark tags on a card: the first few visible, the rest behind a toggle chip.
const StandardTagChips = ({ tags, max = 4 }) => {
  const [showAll, setShowAll] = useState(false)
  if (tags.length === 0) return null
  const visible = showAll ? tags : tags.slice(0, max)
  return (
    <Stack
      direction="row"
      spacing={0.5}
      useFlexGap
      sx={{
        flexWrap: "wrap",
        mt: 1
      }}>
      {visible.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          size="small"
          color="info"
          variant="outlined"
          sx={{ fontSize: '0.7rem', height: 20 }}
        />
      ))}
      {tags.length > max && (
        <Chip
          label={showAll ? 'Show less' : `+${tags.length - max} more`}
          size="small"
          variant="outlined"
          onClick={() => setShowAll((prev) => !prev)}
          sx={{ fontSize: '0.7rem', height: 20 }}
        />
      )}
    </Stack>
  );
}

// Browse-and-add picker for Baseline standard definitions. The filters stay
// visible (no collapsed panel to discover): search + four multi-select filters on
// one row, then a slim toolbar with the result count, added-state filter, sort,
// and the card/list view toggle.
export const CippBaselineStandardDialog = ({
  open,
  onClose,
  catalog,
  selectedStandards,
  onToggle,
}) => {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('card')
  const [sortOption, setSortOption] = useState(sortOptions[0])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedImpacts, setSelectedImpacts] = useState([])
  const [selectedRecommendedBy, setSelectedRecommendedBy] = useState([])
  const [selectedTagFrameworks, setSelectedTagFrameworks] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

  const { allCategories, allImpacts, allRecommendedBy, allTagFrameworks } =
    useMemo(() => {
      const categorySet = new Set()
      const impactSet = new Set()
      const recommendedBySet = new Set()
      const tagFrameworkSet = new Set()
      for (const standard of catalog) {
        if (standard.cat) categorySet.add(standard.cat)
        if (standard.impact) impactSet.add(standard.impact)
        for (const source of standard.recommendedBy ?? []) {
          recommendedBySet.add(source)
        }
        for (const tag of standard.tag ?? []) {
          const framework = extractTagFramework(tag)
          if (framework) tagFrameworkSet.add(framework)
        }
      }
      const impactOrder = ['Low Impact', 'Medium Impact', 'High Impact']
      return {
        allCategories: [...categorySet].sort(),
        allImpacts: [...impactSet].sort(
          (a, b) => impactOrder.indexOf(a) - impactOrder.indexOf(b)
        ),
        allRecommendedBy: [...recommendedBySet].sort(),
        allTagFrameworks: [...tagFrameworkSet].sort(),
      }
    }, [catalog])

  const toOptions = (values, labelOf = (value) => value) =>
    values.map((value) => ({ label: labelOf(value), value }))

  // Multi-instance standards count 'Name#n' keys; each click adds another instance.
  const instanceCountOf = (standard) =>
    selectedStandards.filter((key) => key.split('#')[0] === standard.name)
      .length

  const filtered = catalog.filter((standard) => {
    // A disabled definition is not ready for use: it never appears in the catalog, but
    // baselines that already contain it still render in the editor (catalogByName keeps
    // the full list) so existing configuration never turns invisible.
    if (standard.disabled === true) return false
    const query = search.toLowerCase()
    const matchesSearch =
      !query ||
      standard.label.toLowerCase().includes(query) ||
      (standard.helpText ?? '').toLowerCase().includes(query) ||
      (standard.tag ?? []).some((tag) => tag.toLowerCase().includes(query)) ||
      (standard.appliesToTest ?? []).some((testId) =>
        testId.toLowerCase().includes(query)
      )
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(standard.cat)
    const matchesImpact =
      selectedImpacts.length === 0 || selectedImpacts.includes(standard.impact)
    const matchesRecommendedBy =
      selectedRecommendedBy.length === 0 ||
      (standard.recommendedBy ?? []).some((source) =>
        selectedRecommendedBy.includes(source)
      )
    const matchesTagFramework =
      selectedTagFrameworks.length === 0 ||
      (standard.tag ?? []).some((tag) => {
        const framework = extractTagFramework(tag)
        return framework && selectedTagFrameworks.includes(framework)
      })
    const isSelected = instanceCountOf(standard) > 0
    const matchesStatusFilter =
      statusFilter === 'all' ||
      (statusFilter === 'added' && isSelected) ||
      (statusFilter === 'notAdded' && !isSelected)
    return (
      matchesSearch &&
      matchesCategory &&
      matchesImpact &&
      matchesRecommendedBy &&
      matchesTagFramework &&
      matchesStatusFilter
    )
  })

  const [sortBy, sortOrder] = sortOption.value.split('-')
  const sorted = [...filtered].sort((a, b) => {
    let aValue
    let bValue
    switch (sortBy) {
      case 'addedDate':
        aValue = new Date(a.addedDate || '1900-01-01')
        bValue = new Date(b.addedDate || '1900-01-01')
        break
      case 'category':
        aValue = a.cat?.toLowerCase() ?? ''
        bValue = b.cat?.toLowerCase() ?? ''
        break
      case 'impact': {
        const impactOrder = {
          'High Impact': 3,
          'Medium Impact': 2,
          'Low Impact': 1,
        }
        aValue = impactOrder[a.impact] ?? 0
        bValue = impactOrder[b.impact] ?? 0
        break
      }
      default:
        aValue = a.label.toLowerCase()
        bValue = b.label.toLowerCase()
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const hasActiveFilters =
    search !== '' ||
    selectedCategories.length > 0 ||
    selectedImpacts.length > 0 ||
    selectedRecommendedBy.length > 0 ||
    selectedTagFrameworks.length > 0 ||
    statusFilter !== 'all'

  const selectedCount = selectedStandards.length

  const clearAllFilters = () => {
    setSearch('')
    setSelectedCategories([])
    setSelectedImpacts([])
    setSelectedRecommendedBy([])
    setSelectedTagFrameworks([])
    setStatusFilter('all')
  }

  const handleClose = () => {
    clearAllFilters()
    setSortOption(sortOptions[0])
    setViewMode('card')
    onClose()
  }

  const addButton = (standard, instanceCount) => {
    const isSelected = instanceCount > 0
    return (
      <Button
        fullWidth
        size="small"
        variant={isSelected ? 'contained' : 'outlined'}
        startIcon={isSelected && !standard.multiple ? <CippIcons.Check /> : <CippIcons.Add />}
        onClick={() => onToggle(standard.name)}
      >
        {standard.multiple
          ? instanceCount > 0
            ? `Add another (${instanceCount} added)`
            : 'Add to stage'
          : isSelected
            ? 'Added'
            : 'Add to stage'}
      </Button>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle>Add Standards to Stage</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Search Standards"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoComplete="off"
                placeholder="Search by name, description, or benchmark tag..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <CippIcons.Search sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CippAutoComplete
                fullWidth
                multiple={true}
                creatable={false}
                label="Impact"
                placeholder="All impacts"
                options={toOptions(allImpacts)}
                value={toOptions(selectedImpacts)}
                onChange={(newValue) =>
                  setSelectedImpacts(
                    Array.isArray(newValue)
                      ? newValue.map((option) => option.value)
                      : []
                  )
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CippAutoComplete
                fullWidth
                multiple={true}
                creatable={false}
                label="Recommended By"
                placeholder="All sources"
                options={toOptions(allRecommendedBy)}
                value={toOptions(selectedRecommendedBy)}
                onChange={(newValue) =>
                  setSelectedRecommendedBy(
                    Array.isArray(newValue)
                      ? newValue.map((option) => option.value)
                      : []
                  )
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <CippAutoComplete
                fullWidth
                multiple={true}
                creatable={false}
                label="Compliance Tags"
                placeholder="All tags"
                options={toOptions(allTagFrameworks)}
                value={toOptions(selectedTagFrameworks)}
                onChange={(newValue) =>
                  setSelectedTagFrameworks(
                    Array.isArray(newValue)
                      ? newValue.map((option) => option.value)
                      : []
                  )
                }
              />
            </Grid>
          </Grid>

          <Stack
            direction="row"
            useFlexGap
            spacing={1.5}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap"
            }}>
            <Stack direction="row" spacing={1.5} sx={{
              alignItems: "center"
            }}>
              <Typography variant="body2" sx={{
                color: "text.secondary"
              }}>
                Showing {sorted.length} of {catalog.length} standards
              </Typography>
              {hasActiveFilters && (
                <Button
                  size="small"
                  startIcon={<CippIcons.Clear />}
                  onClick={clearAllFilters}
                >
                  Clear filters
                </Button>
              )}
            </Stack>
            <Stack
              direction="row"
              spacing={1.5}
              useFlexGap
              sx={{
                alignItems: "center",
                flexWrap: "wrap"
              }}>
              <ToggleButtonGroup
                value={statusFilter}
                exclusive
                size="small"
                onChange={(event, newValue) => {
                  if (newValue !== null) setStatusFilter(newValue)
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="added">Added</ToggleButton>
                <ToggleButton value="notAdded">Not added</ToggleButton>
              </ToggleButtonGroup>
              <Box sx={{ minWidth: 180 }}>
                <CippAutoComplete
                  fullWidth
                  multiple={false}
                  creatable={false}
                  disableClearable={true}
                  label="Sort"
                  options={sortOptions}
                  value={sortOption}
                  onChange={(newValue) => {
                    if (newValue) setSortOption(newValue)
                  }}
                />
              </Box>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                size="small"
                onChange={(event, newViewMode) => {
                  if (newViewMode !== null) setViewMode(newViewMode)
                }}
              >
                <ToggleButton value="card" aria-label="card view">
                  <Tooltip title="Card view">
                    <CippIcons.ViewModule fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="list" aria-label="list view">
                  <Tooltip title="List view">
                    <CippIcons.ViewList fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>

          {sorted.length === 0 && (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" sx={{
                color: "text.secondary"
              }}>
                No standards match your search and filter criteria
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mt: 1
                }}>
                Try adjusting your search terms or clearing some filters
              </Typography>
            </Box>
          )}

          {viewMode === 'card' ? (
            <Grid container spacing={2}>
              {sorted.map((standard) => {
                const instanceCount = instanceCountOf(standard)
                const isSelected = instanceCount > 0
                const benchmarkTags = (standard.tag ?? []).filter(
                  (tag) => !tag.toLowerCase().includes('impact')
                )
                return (
                  <Grid key={standard.name} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          {standard.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            display: 'block',
                            mb: 1
                          }}>
                          {standard.cat}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          sx={{
                            flexWrap: "wrap",
                            mb: 1
                          }}>
                          <Chip
                            variant="outlined"
                            size="small"
                            color={impactColors[standard.impact] ?? 'default'}
                            label={standard.impact}
                          />
                          {standard.secureScoreImpact > 0 && (
                            <Tooltip title="Potential Secure Score increase when compliant">
                              <Chip
                                variant="outlined"
                                size="small"
                                label={`+${standard.secureScoreImpact} pts`}
                              />
                            </Tooltip>
                          )}
                          {(standard.recommendedBy ?? []).map((source) => (
                            <Chip
                              key={source}
                              variant="outlined"
                              size="small"
                              color="info"
                              label={source}
                            />
                          ))}
                          {isNewStandard(standard.addedDate) && (
                            <Chip
                              variant="outlined"
                              size="small"
                              color="success"
                              label="New"
                            />
                          )}
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                          {standard.helpText}
                        </Typography>
                        <StandardTagChips tags={benchmarkTags} />
                      </CardContent>
                      <CardActions>
                        {addButton(standard, instanceCount)}
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <List sx={{ bgcolor: 'background.paper', pt: 0 }}>
              {sorted.map((standard) => {
                const instanceCount = instanceCountOf(standard)
                const isSelected = instanceCount > 0
                return (
                  <ListItem
                    key={standard.name}
                    sx={{
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      disableTypography
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 'medium' }}
                          >
                            {standard.label}
                          </Typography>
                          {isNewStandard(standard.addedDate) && (
                            <Chip
                              label="New"
                              size="small"
                              color="success"
                              sx={{
                                fontSize: '0.7rem',
                                height: 20,
                                fontWeight: 'bold',
                              }}
                            />
                          )}
                          <Chip
                            label={standard.cat}
                            size="small"
                            color="primary"
                          />
                          <Chip
                            label={standard.impact}
                            size="small"
                            color={impactColors[standard.impact] ?? 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 1
                            }}>
                            {standard.helpText}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 1,
                              alignItems: 'center',
                            }}
                          >
                            {(standard.tag ?? [])
                              .filter(
                                (tag) => !tag.toLowerCase().includes('impact')
                              )
                              .slice(0, 3)
                              .map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              ))}
                            {(standard.recommendedBy ?? []).length > 0 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary"
                                }}
                              >
                                • Recommended by:{' '}
                                {standard.recommendedBy.join(', ')}
                              </Typography>
                            )}
                            {standard.secureScoreImpact > 0 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary"
                                }}
                              >
                                • +{standard.secureScoreImpact} Secure Score pts
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                      sx={{ pr: 22 }}
                    />
                    <ListItemSecondaryAction sx={{ width: 190 }}>
                      {addButton(standard, instanceCount)}
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Box sx={{ flexGrow: 1, pl: 2 }}>
          <Typography variant="caption" sx={{
            color: "text.secondary"
          }}>
            {selectedCount} standard{selectedCount === 1 ? '' : 's'} in this
            stage
          </Typography>
        </Box>
        <Button variant="contained" onClick={handleClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CippBaselineStandardDialog
