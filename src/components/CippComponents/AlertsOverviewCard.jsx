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
import { describeAlertItem, humanizeCmdlet } from '../../utils/format-alert-item'

const ACTIVE_SNOOZE_STATUSES = ['Active', 'Forever']
const rowSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  py: 1,
}

const describeSnooze = (snooze) => {
  if (snooze.Status === 'Forever') return 'Snoozed indefinitely'
  if (snooze.Status === 'Expired') return 'Snooze expired'
  const until = Number(snooze.SnoozeUntil)
  const parts = []
  if (typeof snooze.RemainingDays === 'number') parts.push(`${snooze.RemainingDays}d left`)
  if (Number.isFinite(until) && until > 0) {
    const untilDate = new Date(until * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    parts.push(`until ${untilDate}`)
  }
  return `Snoozed${parts.length ? ` · ${parts.join(' · ')}` : ''}`
}

const SnoozeStatusChip = ({ snooze }) => {
  if (snooze.Status === 'Forever') {
    return <Chip size="small" variant="outlined" icon={<CippIcons.Snooze />} label="Forever" />
  }
  if (snooze.Status === 'Expired') {
    return <Chip size="small" variant="outlined" label="Expired" />
  }
  return (
    <Chip
      size="small"
      variant="outlined"
      icon={<CippIcons.Snooze />}
      label={`${snooze.RemainingDays}d`}
    />
  )
}

export const AlertsOverviewCard = ({ tenantFilter, sx }) => {
  const [snoozeTarget, setSnoozeTarget] = useState(null)
  const removeDialog = useDialog()

  const resultsQueryKey = `ListAlertResults-${tenantFilter}`
  // Dedicated key — must NOT be "ListSnoozedAlerts": that key is owned by the Snoozed
  // Alerts CippDataTable, which fetches it as an infinite query ({ pages }). A plain
  // useQuery here under the same key would clobber that cache entry and crash the table.
  const snoozeQueryKey = 'ListSnoozedAlerts-DashboardCard'
  const relatedQueryKeys = ['ListSnoozedAlerts', snoozeQueryKey, resultsQueryKey]

  const resultsApi = ApiGetCall({
    url: '/api/ListAlertResults',
    queryKey: resultsQueryKey,
    data: { tenantFilter },
    waiting: !!tenantFilter,
  })
  const snoozeApi = ApiGetCall({ url: '/api/ListSnoozedAlerts', queryKey: snoozeQueryKey })

  const tenantSnoozes = useMemo(
    () =>
      (Array.isArray(snoozeApi.data) ? snoozeApi.data : []).filter(
        (snooze) => snooze.Tenant === tenantFilter
      ),
    [snoozeApi.data, tenantFilter]
  )

  // Content hashes of items that are currently snoozed — used to drop them from the
  // active list (a just-snoozed item lingers in AlertLastRun until the alert next runs).
  const activeSnoozeHashes = useMemo(() => {
    const set = new Set()
    tenantSnoozes.forEach((snooze) => {
      if (ACTIVE_SNOOZE_STATUSES.includes(snooze.Status) && snooze.ContentHash) {
        set.add(snooze.ContentHash)
      }
    })
    return set
  }, [tenantSnoozes])

  const activeItems = useMemo(() => {
    const items = Array.isArray(resultsApi.data) ? resultsApi.data : []
    return items.filter((item) => !activeSnoozeHashes.has(item.ContentHash))
  }, [resultsApi.data, activeSnoozeHashes])

  const sortedSnoozes = useMemo(
    () =>
      [...tenantSnoozes].sort(
        (a, b) =>
          (ACTIVE_SNOOZE_STATUSES.includes(a.Status) ? 0 : 1) -
          (ACTIVE_SNOOZE_STATUSES.includes(b.Status) ? 0 : 1)
      ),
    [tenantSnoozes]
  )

  const activeSnoozeCount = tenantSnoozes.filter((snooze) =>
    ACTIVE_SNOOZE_STATUSES.includes(snooze.Status)
  ).length

  // A disabled query (no tenant yet) reports isLoading=false in react-query v5, so guard
  // on tenantFilter to avoid flashing a false "no alerts" state before the tenant resolves.
  const isLoading = !tenantFilter || resultsApi.isLoading || snoozeApi.isLoading
  const hasError = resultsApi.isError || snoozeApi.isError

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
        <Typography variant="body2" color="error" sx={{ py: 2, textAlign: 'center' }}>
          {getCippError(resultsApi.error || snoozeApi.error)}
        </Typography>
      )
    }

    return (
      <>
        <Stack useFlexGap direction="row" sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            size="small"
            color={activeItems.length ? 'error' : 'success'}
            variant={activeItems.length ? 'filled' : 'outlined'}
            icon={<CippIcons.NotificationsActive />}
            label={`${activeItems.length} Active`}
          />
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            icon={<CippIcons.Snooze />}
            label={`${activeSnoozeCount} Snoozed`}
          />
        </Stack>

        <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
          {activeItems.length > 0 ? (
            <Stack divider={<Divider flexItem />}>
              {activeItems.map((item, index) => {
                const { title, detail } = describeAlertItem(item.AlertItem, item.ContentPreview)
                const label = item.AlertComment?.trim() || humanizeCmdlet(item.CmdletName)
                const secondary = detail ? `${label} · ${detail}` : label
                return (
                  <Box key={`active-${item.CmdletName}-${item.ContentHash}-${index}`} sx={rowSx}>
                    {/* flex: 1 + minWidth: 0 lets the ellipsis engage before the row runs under the icon */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" noWrap title={title} sx={{
                        fontWeight: 500
                      }}>
                        {title}
                      </Typography>
                      <Typography variant="caption" noWrap title={secondary} sx={{
                        color: "text.secondary"
                      }}>
                        {secondary}
                      </Typography>
                    </Box>
                    <Tooltip title="Snooze this alert">
                      <IconButton size="small" onClick={() => setSnoozeTarget(item)} sx={{ flexShrink: 0 }}>
                        <CippIcons.Snooze fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                py: 2,
                textAlign: 'center'
              }}>
              No active alerts for this tenant.
            </Typography>
          )}

          {sortedSnoozes.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="overline" sx={{
                color: "text.secondary"
              }}>
                Snoozed
              </Typography>
              <Stack divider={<Divider flexItem />}>
                {sortedSnoozes.map((snooze) => {
                  const { title } = describeAlertItem(null, snooze.ContentPreview)
                  const status = describeSnooze(snooze)
                  const by = snooze.SnoozedBy ? ` · by ${snooze.SnoozedBy}` : ''
                  const secondary = `${humanizeCmdlet(snooze.CmdletName)} · ${status}${by}`
                  return (
                    <Box
                      key={`snoozed-${snooze.PartitionKey}-${snooze.RowKey}`}
                      sx={{ ...rowSx, opacity: 0.55 }}
                    >
                      {/* flex: 1 + minWidth: 0 lets the ellipsis engage before the row runs under the icons */}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" noWrap title={title}>
                          {title}
                        </Typography>
                        <Typography
                          variant="caption"
                          noWrap
                          title={secondary}
                          sx={{
                            color: "text.secondary"
                          }}
                        >
                          {secondary}
                        </Typography>
                      </Box>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          alignItems: "center",
                          flexShrink: 0
                        }}>
                        <SnoozeStatusChip snooze={snooze} />
                        <Tooltip title="Remove snooze">
                          <IconButton size="small" onClick={() => removeDialog.handleOpen(snooze)}>
                            <CippIcons.DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>
      </>
    );
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
          <Button
            component={Link}
            href="/tenant/administration/alert-configuration"
            size="small"
            startIcon={<CippIcons.Settings />}
          >
            Manage
          </Button>
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
        createDialog={removeDialog}
        title="Remove snooze"
        fields={[]}
        row={removeDialog.data ?? {}}
        api={{
          type: 'POST',
          url: '/api/ExecRemoveSnooze',
          confirmText:
            'Are you sure you want to remove this snooze? The alert will fire again on the next run.',
          data: { PartitionKey: 'PartitionKey', RowKey: 'RowKey' },
          relatedQueryKeys,
          multiPost: false,
        }}
      />
    </Card>
  )
}
