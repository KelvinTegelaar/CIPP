import { useMemo, useState } from 'react'
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
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { Add, Check, Search } from '@mui/icons-material'

const impactColors = {
  'Low Impact': 'info',
  'Medium Impact': 'warning',
  'High Impact': 'error',
}

// Browse-and-add picker for V3 standard definitions: search, category filter chips, and one
// card per standard with its metadata slice (impact, secure score, recommended-by).
export const CippBaselineStandardDialog = ({
  open,
  onClose,
  catalog,
  selectedStandards,
  onToggle,
}) => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const categories = useMemo(
    () => ['All', ...new Set(catalog.map((standard) => standard.cat))],
    [catalog]
  )

  const filtered = catalog.filter((standard) => {
    if (category !== 'All' && standard.cat !== category) return false
    if (!search) return true
    const query = search.toLowerCase()
    return (
      standard.label.toLowerCase().includes(query) ||
      (standard.helpText ?? '').toLowerCase().includes(query) ||
      (standard.tag ?? []).some((tag) => tag.toLowerCase().includes(query))
    )
  })

  const selectedCount = selectedStandards.length

  const handleClose = () => {
    setSearch('')
    setCategory('All')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle>Add Standards to Stage</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name, description, or benchmark tag..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {categories.map((entry) => (
              <Chip
                key={entry}
                label={entry.replace(' Standards', '')}
                size="small"
                color={category === entry ? 'primary' : 'default'}
                variant={category === entry ? 'filled' : 'outlined'}
                onClick={() => setCategory(entry)}
              />
            ))}
          </Stack>
          <Grid container spacing={2}>
            {filtered.map((standard) => {
              // Multi-instance standards count 'Name#n' keys; each click adds another instance.
              const instanceCount = selectedStandards.filter(
                (key) => key.split('#')[0] === standard.name
              ).length
              const isSelected = instanceCount > 0
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {standard.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 1 }}
                      >
                        {standard.cat}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{ mb: 1 }}
                      >
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
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {standard.helpText}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        startIcon={
                          isSelected && !standard.multiple ? <Check /> : <Add />
                        }
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
                    </CardActions>
                  </Card>
                </Grid>
              )
            })}
            {filtered.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  No standards match this search.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Box sx={{ flexGrow: 1, pl: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {selectedCount} standard{selectedCount === 1 ? '' : 's'} in this
            stage
          </Typography>
        </Box>
        <Button variant="contained" onClick={handleClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CippBaselineStandardDialog
