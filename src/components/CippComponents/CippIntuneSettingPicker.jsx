import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  fetchIntuneDefinitions,
  fetchIntuneDescendants,
  useIntuneCategories,
  useIntuneSettingIndex,
} from '../../hooks/use-intune-collection'

const MAX_RESULTS = 100
const MAX_DEPTH = 8
const EMPTY_EXISTING = []

const rankRow = (row, query) => {
  const name = (row.displayName ?? '').toLowerCase()
  if (name === query) return 0
  if (name.startsWith(query)) return 1
  if (name.includes(query)) return 2
  return 3
}

const splitList = (value) =>
  String(value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

export const searchSettingIndex = (
  rows,
  query,
  { technology, excludeIds = [] } = {}
) => {
  const needle = query.toLowerCase()
  const technologies = splitList(technology)
  const excluded = new Set(excludeIds)
  return rows
    .filter(
      (row) =>
        !excluded.has(row.id) &&
        (technologies.length === 0 ||
          splitList(row.technologies).some((entry) =>
            technologies.includes(entry)
          )) &&
        `${row.displayName ?? ''} ${row.categoryName ?? ''} ${row.description ?? ''} ${row.id}`
          .toLowerCase()
          .includes(needle)
    )
    .sort(
      (a, b) =>
        rankRow(a, needle) - rankRow(b, needle) ||
        (a.displayName ?? '').localeCompare(b.displayName ?? '')
    )
}

export const CippIntuneSettingPicker = ({
  open,
  onClose,
  onAdd,
  platform,
  technology,
  existingIds = EMPTY_EXISTING,
}) => {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [pendingId, setPendingId] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 200)
    return () => clearTimeout(timer)
  }, [search])

  const handleClose = () => {
    setSearch('')
    setDebounced('')
    setFailed(false)
    onClose()
  }

  const { rows, isLoading, isError } = useIntuneSettingIndex(platform, {
    enabled: open,
  })
  const categories = useIntuneCategories({ enabled: open })
  const rowsById = useMemo(
    () => new Map(rows.map((row) => [row.id, row])),
    [rows]
  )

  // A setting that only exists beneath another is added through its top-level setting, built with
  // the options that lead down to it.
  const handleSelect = async (id) => {
    setPendingId(id)
    setFailed(false)
    try {
      const wanted = new Set()
      let rootId = id
      while (rowsById.get(rootId)?.parentId && wanted.size < MAX_DEPTH) {
        wanted.add(rootId)
        rootId = rowsById.get(rootId).parentId
      }
      const [definition] = await fetchIntuneDefinitions([rootId])
      const added =
        definition &&
        onAdd(
          definition,
          await fetchIntuneDescendants(definition, wanted),
          wanted
        )
      if (added === false || !definition) setFailed(true)
    } finally {
      setPendingId(null)
    }
  }

  const matches = useMemo(
    () =>
      debounced.length < 2
        ? []
        : searchSettingIndex(rows, debounced, {
            technology,
            excludeIds: existingIds,
          }),
    [rows, debounced, technology, existingIds]
  )
  const results = matches.slice(0, MAX_RESULTS)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add a setting</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Search settings"
            placeholder="e.g. BitLocker, password length, Defender"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            helperText={`Searching settings that apply to ${platform}.`}
          />
          {failed && (
            <Alert severity="warning">
              This setting cannot be built from the catalog (for example, it
              needs a value in a specific format), so it was not added. Capture
              it from a tenant policy instead.
            </Alert>
          )}
          {isLoading ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <CircularProgress size={18} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Loading the setting catalog…
              </Typography>
            </Stack>
          ) : isError ? (
            <Alert severity="error">
              The setting catalog could not be loaded.
            </Alert>
          ) : debounced.length < 2 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Type at least two characters to search{' '}
              {rows.length.toLocaleString()} settings.
            </Typography>
          ) : results.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No settings matched, or every match is already in this policy.
            </Typography>
          ) : (
            <>
              {matches.length > results.length && (
                <Alert severity="info">
                  Showing the first {results.length} of {matches.length}{' '}
                  matches. Narrow the search to see more.
                </Alert>
              )}
              <List dense sx={{ maxHeight: 420, overflowY: 'auto' }}>
                {results.map((row) => {
                  // The path tells same-named categories apart, e.g. Edge's and Chrome's Extensions.
                  const category =
                    categories.get(row.categoryId)?.description ||
                    row.categoryName
                  return (
                    <ListItemButton
                      key={row.id}
                      disabled={!!pendingId}
                      onClick={() => handleSelect(row.id)}
                      alignItems="flex-start"
                    >
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                          >
                            <Typography variant="body2">
                              {row.displayName || row.id}
                            </Typography>
                            {category && (
                              <Chip
                                label={category}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {pendingId === row.id && (
                              <CircularProgress size={14} />
                            )}
                          </Stack>
                        }
                        secondary={
                          row.parentId
                            ? `Under ${rowsById.get(row.parentId)?.displayName ?? row.parentId}. ${row.description ?? ''}`
                            : row.description || row.id
                        }
                      />
                    </ListItemButton>
                  )
                })}
              </List>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CippIntuneSettingPicker
