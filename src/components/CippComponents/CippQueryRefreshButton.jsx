import { IconButton, SvgIcon, Tooltip } from '@mui/material'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Reloads a page's cached data on demand by invalidating its query keys.
 *
 * Distinct from a Sync button: syncing re-reads the tenant from Microsoft and queues background
 * work that can take a long time, whereas this only re-reads what CIPP already has stored. Use it
 * after a sync finishes elsewhere, or when someone else has refreshed the cache and the page is
 * showing what it loaded on arrival.
 */
export const CippQueryRefreshButton = ({
  queryKeys = [],
  isFetching = false,
  tooltip = 'Reload the cached data. This does not re-scan the tenant — use Sync data for that.',
}) => {
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    queryKeys.filter(Boolean).forEach((key) => {
      queryClient.invalidateQueries({ queryKey: [key] })
    })
  }

  return (
    <Tooltip title={tooltip}>
      <span>
        <IconButton size="small" onClick={handleRefresh} disabled={isFetching || !queryKeys.length}>
          <SvgIcon
            fontSize="small"
            sx={{
              animation: isFetching ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(-360deg)' },
              },
            }}
          >
            <ArrowPathIcon />
          </SvgIcon>
        </IconButton>
      </span>
    </Tooltip>
  )
}

export default CippQueryRefreshButton
