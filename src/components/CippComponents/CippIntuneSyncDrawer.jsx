import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings'
import { getCippTranslation } from '../../utils/get-cipp-translation'
import { CippOffCanvas } from './CippOffCanvas'
import { CippApiResults } from './CippApiResults'

const SYNC_STATUS_COLORS = {
  success: 'success',
  partialSuccess: 'warning',
  inProgress: 'info',
  failed: 'error',
}
const SYNC_FINISHED = ['success', 'partialSuccess', 'failed']

// Intune's sync pane: sends the sync and polls getSyncStatus() while the drawer is open
export const CippIntuneSyncDrawer = ({ row, visible, onClose }) => {
  const settings = useSettings()
  const tenantFilter = row?.Tenant ?? settings.currentTenant
  const sync = ApiPostCall({})
  // Finished once every reported step is done. After Sync now, the previous run still reads finished
  // until Graph shows the new notification, so keep polling until then.
  const isComplete = (reported) =>
    reported.length > 0 &&
    reported.every((c) => SYNC_FINISHED.includes(c.status)) &&
    !(
      sync.isSuccess &&
      Date.parse(reported.find((c) => c.name === 'notifyingDevice')?.reportedDateTime ?? 0) <
        sync.submittedAt
    )
  const status = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `deviceManagement/managedDevices('${row?.id}')/getSyncStatus()`,
      tenantFilter,
      NoPagination: true,
    },
    queryKey: `DeviceSyncStatus-${row?.id}`,
    waiting: visible && Boolean(row?.id),
    refetchInterval: (query) =>
      visible && !isComplete(query.state.data?.Results?.[0]?.components ?? []) ? 5000 : false,
  })
  const reported = status.data?.Results?.[0]?.components ?? []
  const complete = isComplete(reported)
  // Graph leaves policies and applications out until the device reports them; Intune's pane still lists both
  const placeholders = ['policies', 'applications'].map(
    (name) =>
      reported.find((c) => c.name === name) ?? {
        name,
        status: 'notStarted',
        moreInfo: `No ${name.replace(/ies$/, 'y').replace(/s$/, '')} updates`,
      }
  )
  const components = reported.length
    ? [
        ...reported.filter((c) => c.name === 'notifyingDevice'),
        ...placeholders,
        // Intune's pane hides deviceConnecting too
        ...reported.filter(
          (c) =>
            !['notifyingDevice', 'deviceConnecting', 'policies', 'applications'].includes(c.name)
        ),
      ]
    : []
  const done = components.filter((c) => SYNC_FINISHED.includes(c.status)).length

  return (
    <CippOffCanvas
      title={`Sync status: ${row?.deviceName ?? ''}`}
      visible={visible}
      onClose={onClose}
    >
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Button
          variant="contained"
          startIcon={<CippIcons.Sync />}
          disabled={sync.isPending}
          onClick={() =>
            sync.mutate({
              url: '/api/ExecDeviceAction',
              data: { GUID: row?.id, Action: 'syncDevice', tenantFilter },
            })
          }
        >
          Sync now
        </Button>
        {complete ? (
          <Alert severity="success">Sync complete. Monitoring stopped.</Alert>
        ) : (
          <Alert severity="info" icon={<CircularProgress size={18} />}>
            Monitoring sync status. Closing this drawer stops monitoring.
          </Alert>
        )}
        <CippApiResults apiObject={sync} />
        {components.length > 0 && (
          <LinearProgress
            variant="determinate"
            value={complete ? 100 : (done / components.length) * 100}
          />
        )}
        {components.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            {status.isFetching
              ? 'Loading sync status...'
              : 'No sync has been reported for this device yet.'}
          </Typography>
        )}
        {components.map((component) => (
          <Stack
            key={component.name}
            direction="row"
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <Typography variant="subtitle2">{getCippTranslation(component.name)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {[
                  component.moreInfo,
                  component.reportedDateTime &&
                    new Date(component.reportedDateTime).toLocaleString('en-GB'),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            </div>
            <Chip
              size="small"
              variant="outlined"
              label={getCippTranslation(component.status)}
              color={SYNC_STATUS_COLORS[component.status] ?? 'default'}
            />
          </Stack>
        ))}
      </Stack>
    </CippOffCanvas>
  )
}
