import { Card, Chip, Skeleton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { Storage } from '@mui/icons-material'
import { ApiGetCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'
import { usePermissions } from '../../hooks/use-permissions'
import { LinearProgressWithLabel } from '../linearProgressWithLabel'

// SharePoint reports the tenant quota in MB, and a tenant pool is routinely multiple TB.
// Roll the unit up so the figures stay readable instead of printing seven-digit megabytes.
const formatStorage = (sizeInMB) => {
  const size = Number(sizeInMB)
  if (!Number.isFinite(size)) return 'N/A'
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} TB`
  if (size >= 1024) return `${(size / 1024).toFixed(2)} GB`
  return `${Math.round(size)} MB`
}

/**
 * Slim tenant-wide SharePoint storage bar, ported from the "SharePoint Quota" donut on the
 * classic (v1) dashboard. Reads the SPO admin StorageQuotas API, so it is unaffected by the
 * usage-report anonymization that can blank out the per-site columns in the table below.
 *
 * The totals are tenant-wide: on a Multi-Geo tenant the endpoint sums used storage across
 * every geo location against the shared tenant pool. A per-geo chip row is added when there
 * is more than one location, so the aggregate never hides where the storage actually sits.
 *
 * Renders nothing when the data can't apply: AllTenants (the endpoint answers "Not Supported")
 * or a user without the Sharepoint.Admin read permission the endpoint requires.
 */
export const CippSharePointQuotaCard = () => {
  const currentTenant = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canReadQuota = checkPermissions(['Sharepoint.Admin.Read', 'Sharepoint.Admin.ReadWrite'])
  const isAllTenants = currentTenant === 'AllTenants'
  const enabled = !!currentTenant && !isAllTenants && canReadQuota

  const quota = ApiGetCall({
    url: '/api/ListSharepointQuota',
    data: { tenantFilter: currentTenant },
    // Same key the v1 dashboard uses, so the two share a single fetch.
    queryKey: `${currentTenant}-ListSharepointQuota`,
    waiting: enabled,
  })

  if (!enabled) return null

  const usedMB = Number(quota.data?.GeoUsedStorageMB)
  const totalMB = Number(quota.data?.TenantStorageMB)
  // The endpoint returns a 'Not available' percentage and no figures when the SharePoint admin
  // link or the quota call fails, so gate on having real numbers rather than on the status.
  const hasQuota = Number.isFinite(usedMB) && Number.isFinite(totalMB) && totalMB > 0
  const percentage = hasQuota ? Math.min(100, Math.round((usedMB / totalMB) * 1000) / 10) : 0
  // Only worth showing when the tenant actually spans geos - a single-geo tenant's one entry
  // repeats the Used chip above it.
  const geoLocations = Array.isArray(quota.data?.GeoLocations) ? quota.data.GeoLocations : []
  const isMultiGeo = geoLocations.length > 1

  return (
    <Card>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ px: 2, py: 1.5 }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 180 }}>
          <SvgIcon fontSize="small" color="primary">
            <Storage />
          </SvgIcon>
          <Typography variant="subtitle2" noWrap>
            Tenant Storage
          </Typography>
        </Stack>
        {quota.isFetching ? (
          <Skeleton variant="text" sx={{ flex: 1 }} />
        ) : hasQuota ? (
          <>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <LinearProgressWithLabel value={percentage} colourLevels="flipped" addedLabel="used" />
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Tooltip title="Storage used across every site in the tenant">
                <Chip size="small" variant="outlined" label={`Used ${formatStorage(usedMB)}`} />
              </Tooltip>
              <Tooltip title="Storage still available in the tenant pool">
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Free ${formatStorage(totalMB - usedMB)}`}
                />
              </Tooltip>
              <Tooltip title="Total tenant storage quota">
                <Chip size="small" variant="outlined" label={`Total ${formatStorage(totalMB)}`} />
              </Tooltip>
              {isMultiGeo &&
                geoLocations.map((geo, index) => (
                  <Tooltip
                    key={geo?.GeoLocation ?? index}
                    title={`Used in the ${geo?.GeoLocation ?? 'unknown'} geo location`}
                  >
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`${geo?.GeoLocation ?? '?'} ${formatStorage(geo?.GeoUsedStorageMB)}`}
                    />
                  </Tooltip>
                ))}
            </Stack>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Tenant storage usage is unavailable for this tenant.
          </Typography>
        )}
      </Stack>
    </Card>
  )
}

export default CippSharePointQuotaCard
