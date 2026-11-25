import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from '../CippComponents/CippApiResults'

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

const StandardList = ({ title, items, color, ticked, onToggle }) => {
  if (items.length === 0) return null
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Typography>
      <List sx={{ pt: 0.5, pb: 0 }}>
        {items.map((item) => (
          <ListItem
            key={item.key}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
              alignItems: 'flex-start',
            }}
          >
            {onToggle && (
              <Checkbox
                checked={ticked.includes(item.key)}
                onChange={() => onToggle(item.key)}
                slotProps={{ input: { 'aria-label': `Add ${item.label}` } }}
                sx={{ mt: -0.5 }}
              />
            )}
            <ListItemText
              disableTypography
              primary={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  {item.stage && (
                    <Chip
                      label={item.stage}
                      size="small"
                      color={color}
                      variant="outlined"
                    />
                  )}
                </Box>
              }
              secondary={
                asArray(item.changes).length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block' }}
                  >
                    {asArray(item.changes).join(', ')}
                  </Typography>
                )
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

// What Align or Merge would change for one managed baseline, asked from the same endpoint
// in preview mode. Merge posts the ticked CyberDrain-only standards with the action as Add.
export const CippManagedBaselineSyncPreview = ({ formHook, row, action }) => {
  // The ticks belong to one baseline and action; another one starts empty.
  const previewOf = `${row?.GUID}|${action}`
  const [tickedFor, setTickedFor] = useState({ previewOf, keys: [] })
  const ticked = tickedFor.previewOf === previewOf ? tickedFor.keys : []
  const setTicked = (keys) => setTickedFor({ previewOf, keys })
  const preview = ApiPostCall({})
  const guid = row?.GUID

  useEffect(() => {
    if (!guid) return
    formHook.setValue('Add', [])
    preview.mutate({
      url: '/api/ExecManagedBaseline',
      data: { Action: action, GUID: guid, Preview: true },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guid, action])

  const toggle = (key) => {
    const next = ticked.includes(key)
      ? ticked.filter((entry) => entry !== key)
      : [...ticked, key]
    setTicked(next)
    formHook.setValue('Add', next)
  }

  const changes = preview.data?.data?.Metadata
  const overwritten = asArray(changes?.overwritten)
  const added = asArray(changes?.added)
  const removed = asArray(changes?.removed)
  const available = asArray(changes?.available)
  const kept = asArray(changes?.kept)
  const templates = asArray(changes?.templates)
  const nothingToDo =
    overwritten.length + added.length + removed.length + available.length ===
      0 && !changes?.stages

  return (
    <Stack spacing={2}>
      <CippApiResults apiObject={preview} errorsOnly={true} />
      {preview.isPending && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {changes && (
        <>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            CyberDrain publishes version {changes.newVersion}. This baseline was
            last brought to version {changes.currentVersion || 'unknown'}.
          </Typography>
          {nothingToDo && (
            <Alert severity="info">
              This baseline already matches CyberDrain&apos;s version.
            </Alert>
          )}
          <StandardList
            title="Overwritten with CyberDrain's settings"
            items={overwritten}
            color="info"
          />
          <StandardList title="Added" items={added} color="success" />
          <StandardList title="Removed" items={removed} color="error" />
          <StandardList
            title="Only in CyberDrain's version - tick the ones to add"
            items={available}
            color="info"
            ticked={ticked}
            onToggle={toggle}
          />
          {changes.stages && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Stages change from {asArray(changes.stages.from).join(', ')} to{' '}
              {asArray(changes.stages.to).join(', ')}.
            </Typography>
          )}
          {kept.length > 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {kept.length} of your own standard{kept.length === 1 ? '' : 's'}{' '}
              stay{kept.length === 1 ? 's' : ''} as{' '}
              {kept.length === 1 ? 'it is' : 'they are'}.
            </Typography>
          )}
          {templates.length > 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Templates brought to CyberDrain&apos;s version:{' '}
              {templates.join(', ')}.
            </Typography>
          )}
        </>
      )}
    </Stack>
  )
}

export default CippManagedBaselineSyncPreview
