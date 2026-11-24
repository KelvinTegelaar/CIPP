import { Skeleton, Stack, Typography } from '@mui/material'
import { ApiGetCall } from '../../api/ApiCall'
import { LinearProgressWithLabel } from '../linearProgressWithLabel'
import { formatBytes } from '../../utils/instance-diagnostics'

export const CippAppPackageStorageUsage = () => {
  const storage = ApiGetCall({
    url: '/api/ListAppPackageStorage',
    queryKey: 'ListAppPackageStorage',
  })
  const usage = storage.data?.[0]

  if (storage.isLoading) return <Skeleton height={24} />
  if (storage.isError || !usage)
    return (
      <Typography variant="body2" color="text.secondary">
        Package storage usage could not be loaded.
      </Typography>
    )

  if (usage.AccountName)
    return (
      <Typography variant="body2">
        {formatBytes(usage.AccountBytes)} of installers and packages stored in
        your storage account {usage.AccountName}
        {usage.UsedBytes > 0
          ? `, and ${formatBytes(usage.UsedBytes)} uploaded to CIPP storage before it was connected.`
          : '.'}
      </Typography>
    )

  if (!usage.LimitBytes)
    return (
      <Typography variant="body2">
        {formatBytes(usage.UsedBytes)} of installers and packages stored.
      </Typography>
    )

  return (
    <Stack spacing={0.5}>
      <LinearProgressWithLabel
        value={Math.min(100, (usage.UsedBytes / usage.LimitBytes) * 100)}
        colourLevels="flipped"
        addedLabel="used"
      />
      <Typography variant="body2" color="text.secondary">
        {formatBytes(usage.UsedBytes)} of {formatBytes(usage.LimitBytes)} used.
        New uploads are refused once storage is full; delete templates you no
        longer need, or connect your own storage account in Settings.
      </Typography>
    </Stack>
  )
}
