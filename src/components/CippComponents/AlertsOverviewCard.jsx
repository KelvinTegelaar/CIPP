import { useMemo, useState } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { ApiGetCall } from '../../api/ApiCall'
import { getCippError } from '../../utils/get-cipp-error'
import { useDialog } from '../../hooks/use-dialog'
import { CippAlertSnoozeDialog } from './CippAlertSnoozeDialog'
import { CippApiDialog } from './CippApiDialog'
import {
  describeAlertItem,
  humanizeCmdlet,
} from '../../utils/format-alert-item'
import {
  ACTIVE_ALERT_STATUSES,
  describeAlertStatus,
  isFlapping,
  sortAlertItems,
  summarizeAlertItems,
} from '../../utils/alert-lifecycle'

const RESOLVED_WINDOW_DAYS = 2

const rowSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  py: 1,
}

const AlertRow = ({ item, muted, children }) => {
  const { title } = describeAlertItem(item.AlertItem, item.ContentPreview)
  const label = item.AlertComment?.trim() || humanizeCmdlet(item.CmdletName)
  const status = describeAlertStatus(item)
  const secondary = status ? `${label} · ${status}` : label
  const reopenCount = Number(item.ReopenCount ?? 0)

  return (
    <Box sx={{ ...rowSx, ...(muted ? { opacity: 0.55 } : {}) }}>
      {/* flex: 1 + minWidth: 0 lets the ellipsis engage before the row runs under the icons */}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          noWrap
          title={title}
          sx={{ fontWeight: muted ? 400 : 500 }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          title={secondary}
          sx={{ color: 'text.secondary' }}
        >
          {secondary}
        </Typography>
      </Box>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: 'center', flexShrink: 0 }}
      >
        {isFlapping(item) ? (
          <Tooltip title={`Resolved and reopened ${reopenCount} times`}>
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              icon={<CippIcons.Replay />}
              label="Flapping"
            />
          </Tooltip>
        ) : reopenCount > 0 ? (
          <Tooltip title="Resolved earlier and reopened">
            <Chip
              size="small"
              variant="outlined"
              icon={<CippIcons.Replay />}
              label={`×${reopenCount}`}
            />
          </Tooltip>
        ) : null}
        {item.Status === 'Acknowledged' && (
          <Chip
            size="small"
            color="info"
            variant="outlined"
            icon={<CippIcons.TaskAlt />}
            label="Acknowledged"
          />
        )}
        {children}
      </Stack>
    </Box>
  )
}

export const AlertsOverviewCard = ({ tenantFilter, sx }) => {
  const [snoozeTarget, setSnoozeTarget] = useState(null)
  const removeSnoozeDialog = useDialog()
  const acknowledgeDialog = useDialog()
  const unacknowledgeDialog = useDialog()

  const resultsQueryKey = `ListAlertResults-${tenantFilter}`
  const relatedQueryKeys = [
    'ListSnoozedAlerts',
    'ListAlertHistory',
    resultsQueryKey,
  ]

  const resultsApi = ApiGetCall({
    url: '/api/ListAlertResults',
    queryKey: resultsQueryKey,
    data: { tenantFilter, IncludeResolved: true, Days: RESOLVED_WINDOW_DAYS },
    waiting: !!tenantFilter,
  })

  const items = useMemo(
    () => sortAlertItems(Array.isArray(resultsApi.data) ? resultsApi.data : []),
    [resultsApi.data]
  )
  const counts = useMemo(() => summarizeAlertItems(items), [items])
  const activeItems = items.filter((item) =>
    ACTIVE_ALERT_STATUSES.includes(item.Status)
  )
  const snoozedItems = items.filter((item) => item.Status === 'Snoozed')
  const resolvedItems = items.filter((item) => item.Status === 'Resolved')

  // A disabled query (no tenant yet) reports isLoading=false in react-query v5, so guard
  // on tenantFilter to avoid flashing a false "no alerts" state before the tenant resolves.
  const isLoading = !tenantFilter || resultsApi.isLoading
  const hasError = resultsApi.isError

  const renderBody = () => {
    if (isLoading) {
      return (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={28} width="60%" />
          <Skeleton variant="rounded" height={44} />
          <Skeleton variant="rounded" height={44} />
          <Skeleton variant="rounded" height={44} />
        </Stack>
      )
    }

    if (hasError) {
      return (
        <Typography
          variant="body2"
          color="error"
          sx={{ py: 2, textAlign: 'center' }}
        >
          {getCippError(resultsApi.error)}
        </Typography>
      )
    }

    return (
      <>
        <Stack
          useFlexGap
          direction="row"
          sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}
        >
          <Chip
            size="small"
            color={counts.Open ? 'error' : 'success'}
            variant={counts.Open ? 'filled' : 'outlined'}
            icon={<CippIcons.NotificationsActive />}
            label={`${counts.Open} Open`}
          />
          <Chip
            size="small"
            color="info"
            variant="outlined"
            icon={<CippIcons.TaskAlt />}
            label={`${counts.Acknowledged} Acknowledged`}
          />
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            icon={<CippIcons.Snooze />}
            label={`${counts.Snoozed} Snoozed`}
          />
          <Chip
            size="small"
            color="success"
            variant="outlined"
            icon={<CippIcons.CheckCircle />}
            label={`${counts.Resolved} Resolved (${RESOLVED_WINDOW_DAYS * 24}h)`}
          />
        </Stack>

        <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
          {activeItems.length > 0 ? (
            <Stack divider={<Divider flexItem />}>
              {activeItems.map((item) => (
                <AlertRow
                  key={`active-${item.PartitionKey}-${item.RowKey}`}
                  item={item}
                >
                  {item.Status === 'Open' ? (
                    <Tooltip title="Acknowledge: keep it listed as known">
                      <IconButton
                        size="small"
                        onClick={() => acknowledgeDialog.handleOpen(item)}
                      >
                        <CippIcons.TaskAlt fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Remove acknowledgement">
                      <IconButton
                        size="small"
                        onClick={() => unacknowledgeDialog.handleOpen(item)}
                      >
                        <CippIcons.Undo fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Snooze: hide it for a while">
                    <IconButton
                      size="small"
                      onClick={() => setSnoozeTarget(item)}
                    >
                      <CippIcons.Snooze fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </AlertRow>
              ))}
            </Stack>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}
            >
              No open alerts for this tenant.
            </Typography>
          )}

          {snoozedItems.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Snoozed
              </Typography>
              <Stack divider={<Divider flexItem />}>
                {snoozedItems.map((item) => (
                  <AlertRow
                    key={`snoozed-${item.PartitionKey}-${item.RowKey}`}
                    item={item}
                    muted
                  >
                    <Tooltip title="Remove snooze">
                      <IconButton
                        size="small"
                        onClick={() => removeSnoozeDialog.handleOpen(item)}
                      >
                        <CippIcons.DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </AlertRow>
                ))}
              </Stack>
            </Box>
          )}

          {resolvedItems.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Recently resolved
              </Typography>
              <Stack divider={<Divider flexItem />}>
                {resolvedItems.map((item) => (
                  <AlertRow
                    key={`resolved-${item.PartitionKey}-${item.RowKey}`}
                    item={item}
                    muted
                  >
                    <CippIcons.CheckCircle fontSize="small" color="success" />
                  </AlertRow>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </>
    )
  }

  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CippIcons.NotificationsActive sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1">Alerts</Typography>
          </Box>
        }
        action={
          <Stack direction="row" spacing={0.5}>
            <Button
              component={Link}
              href="/tenant/administration/alert-configuration/history"
              size="small"
              startIcon={<CippIcons.History />}
            >
              History
            </Button>
            <Button
              component={Link}
              href="/tenant/administration/alert-configuration"
              size="small"
              startIcon={<CippIcons.Settings />}
            >
              Manage
            </Button>
          </Stack>
        }
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent>{renderBody()}</CardContent>

      <CippAlertSnoozeDialog
        open={Boolean(snoozeTarget)}
        onClose={() => setSnoozeTarget(null)}
        alertItem={snoozeTarget?.AlertItem}
        cmdletName={snoozeTarget?.CmdletName}
        tenantFilter={tenantFilter}
        relatedQueryKeys={relatedQueryKeys}
      />

      <CippApiDialog
        createDialog={acknowledgeDialog}
        title="Acknowledge alert"
        fields={[{ type: 'textField', name: 'Note', label: 'Note (optional)' }]}
        row={acknowledgeDialog.data ?? {}}
        api={{
          type: 'POST',
          url: '/api/ExecAcknowledgeAlert',
          confirmText:
            'Mark this alert as acknowledged? It stays listed as known until the alert stops reporting it.',
          data: {
            TenantFilter: 'Tenant',
            RowKey: 'RowKey',
            Action: '!Acknowledge',
          },
          relatedQueryKeys,
          multiPost: false,
        }}
      />

      <CippApiDialog
        createDialog={unacknowledgeDialog}
        title="Remove acknowledgement"
        fields={[]}
        row={unacknowledgeDialog.data ?? {}}
        api={{
          type: 'POST',
          url: '/api/ExecAcknowledgeAlert',
          confirmText: 'Return this alert to open?',
          data: {
            TenantFilter: 'Tenant',
            RowKey: 'RowKey',
            Action: '!Unacknowledge',
          },
          relatedQueryKeys,
          multiPost: false,
        }}
      />

      <CippApiDialog
        createDialog={removeSnoozeDialog}
        title="Remove snooze"
        fields={[]}
        row={removeSnoozeDialog.data ?? {}}
        api={{
          type: 'POST',
          url: '/api/ExecRemoveSnooze',
          confirmText:
            'Are you sure you want to remove this snooze? The alert returns to open now and notifies again on its next run.',
          data: { PartitionKey: 'SnoozePartitionKey', RowKey: 'SnoozeRowKey' },
          relatedQueryKeys,
          multiPost: false,
        }}
      />
    </Card>
  )
}
