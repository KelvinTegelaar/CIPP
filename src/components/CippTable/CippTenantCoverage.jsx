import { useState } from 'react'
import {
  Button,
  Chip,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  Tooltip,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { CippQueueTracker } from './CippQueueTracker'

// An AllTenants cache's run, sync actions and tenant coverage, laid out like the report DB controls.
export const CippTenantCoverage = ({
  metadata,
  onCacheAction,
  queryKey,
  title,
}) => {
  const [anchor, setAnchor] = useState(null)
  const expected = metadata?.ExpectedTenants
  if (!expected || !onCacheAction) return null

  const cached = metadata.CachedTenants ?? 0
  const partial = cached < expected
  const filling = Boolean(metadata.QueueId)
  const run = (action) => {
    setAnchor(null)
    onCacheAction(action)
  }

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <CippQueueTracker
        queueId={metadata.QueueId}
        queryKey={queryKey}
        title={title}
      />
      <Button
        startIcon={
          <SvgIcon fontSize="small">
            <CippIcons.Sync />
          </SvgIcon>
        }
        size="xs"
        disabled={filling}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        Sync
      </Button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        <MenuItem disabled={!partial} onClick={() => run('FillMissing')}>
          Load missing tenants
        </MenuItem>
        <MenuItem onClick={() => run('RefreshCache')}>
          Reload all tenants
        </MenuItem>
      </Menu>
      <Tooltip
        title={
          partial
            ? `Cached data covers ${cached} of ${expected} tenants${filling ? ', more are loading' : ''}`
            : `Cached data covers all ${expected} tenants`
        }
      >
        <Chip
          icon={<CippIcons.CloudDone />}
          label={
            partial ? `${cached} of ${expected} tenants` : `${expected} tenants`
          }
          color={partial ? 'warning' : 'primary'}
          size="small"
          variant="outlined"
        />
      </Tooltip>
    </Stack>
  )
}
