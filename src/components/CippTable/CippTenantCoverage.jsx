import { useState } from 'react'
import { Chip, Menu, MenuItem, Tooltip } from '@mui/material'

// How many tenants an AllTenants cache covers, with the actions that fill or rebuild it.
export const CippTenantCoverage = ({ metadata, onCacheAction }) => {
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
    <>
      <Tooltip
        title={
          partial
            ? `Cached data covers ${cached} of ${expected} tenants${filling ? ', more are loading' : ''}`
            : `Cached data covers all ${expected} tenants`
        }
      >
        <Chip
          size="small"
          variant="outlined"
          color={partial ? 'warning' : 'default'}
          label={
            partial ? `${cached} of ${expected} tenants` : `${expected} tenants`
          }
          onClick={(event) => setAnchor(event.currentTarget)}
        />
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
      >
        <MenuItem
          disabled={!partial || filling}
          onClick={() => run('FillMissing')}
        >
          Load missing tenants
        </MenuItem>
        <MenuItem disabled={filling} onClick={() => run('RefreshCache')}>
          Reload all tenants
        </MenuItem>
      </Menu>
    </>
  )
}
