import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useCallback } from 'react'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { ApiGetCall } from '../../../../api/ApiCall'
import { usePermissions } from '../../../../hooks/use-permissions'
import { useSettings } from '../../../../hooks/use-settings'
import { CippIcons } from '../../../../utils/icon-registry'
import { getCippError } from '../../../../utils/get-cipp-error'
import { isMultiTenant } from '../../../../utils/tenant-selection'

const ACTION_NAMES = {
  Isolate: 'Isolate',
  Unisolate: 'Release from isolation',
  RunAntiVirusScan: 'Antivirus scan',
}

const commentField = {
  type: 'textField',
  name: 'Comment',
  label: 'Comment (optional)',
  helperText:
    'Saved with the action in Defender after your name, for example a ticket number.',
}

const formatDate = (value) => (value ? new Date(value).toLocaleString() : '')

const DefenderActionHistoryDialog = ({
  tenantFilter,
  machineId,
  deviceName,
  open,
  onClose,
}) => {
  const history = ApiGetCall({
    url: '/api/ListDefenderMachineActions',
    data: { tenantFilter, machineId },
    queryKey: `ListDefenderMachineActions-${tenantFilter}-${machineId}`,
    waiting: open,
    staleTime: 0,
  })
  const actions = Array.isArray(history.data) ? history.data : []

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Defender action history for {deviceName}</DialogTitle>
      <DialogContent>
        {history.isError ? (
          <Alert severity="error">
            Could not read the action history from Defender:{' '}
            {getCippError(history.error)}
          </Alert>
        ) : history.isLoading ? (
          <CircularProgress size={24} />
        ) : actions.length === 0 ? (
          <Typography>
            Defender has no isolation, release or antivirus scan actions for
            this device.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell>Last updated</TableCell>
                <TableCell>Requested by</TableCell>
                <TableCell>Comment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actions.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>
                    {ACTION_NAMES[action.type] ?? action.type}
                    {action.scope ? ` (${action.scope})` : ''}
                  </TableCell>
                  <TableCell>
                    {action.status}
                    {action.errorHResult
                      ? ` (error 0x${(action.errorHResult >>> 0).toString(16).toUpperCase()})`
                      : ''}
                  </TableCell>
                  <TableCell>
                    {formatDate(action.creationDateTimeUtc)}
                  </TableCell>
                  <TableCell>
                    {formatDate(action.lastUpdateDateTimeUtc)}
                  </TableCell>
                  <TableCell>{action.requestor}</TableCell>
                  <TableCell>{action.requestorComment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<CippIcons.Refresh />}
          onClick={() => history.refetch()}
          disabled={history.isFetching}
        >
          Refresh
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

const Page = () => {
  const tenant = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canSendActions = checkPermissions(['Security.Defender.ReadWrite'])
  const canReadHistory = checkPermissions([
    'Security.Defender.Read',
    'Security.Defender.ReadWrite',
  ])

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListDefenderMachines',
    queryKey: 'ListDefenderMachines',
    cacheName: 'DefenderMachines',
    syncTitle: 'Sync Defender Devices',
    allowToggle: false,
    defaultCached: true,
    serverPagination: true,
  })

  const mapDevice = useCallback(
    (row) => (isMultiTenant(tenant) ? row : { ...row, Tenant: tenant }),
    [tenant]
  )
  const deviceAction = (action, extra) => (row, _action, formData) => ({
    tenantFilter: row.Tenant,
    machineId: row.id,
    Action: action,
    ...extra(formData),
    Comment: formData.Comment,
  })
  const hasTarget = (row) =>
    Boolean(row.id && row.Tenant) &&
    !isMultiTenant(row.Tenant) &&
    (isMultiTenant(tenant) || row.Tenant === tenant)
  const deviceLabel = (row) =>
    `${row.computerDnsName ?? row.id} in ${row.Tenant}`

  const actions = [
    {
      label: 'Isolate device',
      type: 'POST',
      url: '/api/ExecDefenderMachineAction',
      icon: <CippIcons.Lock />,
      color: 'danger',
      hideBulk: true,
      multiPost: false,
      fields: [
        {
          type: 'radio',
          name: 'IsolationType',
          label: 'Isolation type',
          options: [
            {
              label: 'Full: block all network traffic except Defender',
              value: 'Full',
            },
            {
              label:
                'Selective: allow the limited traffic Defender permits during selective isolation',
              value: 'Selective',
            },
          ],
          defaultValue: 'Full',
        },
        commentField,
      ],
      confirmText: (row) =>
        `Isolate ${deviceLabel(row)}? The device stays isolated until you release it, and it must still be able to reach Defender to receive the release.`,
      customDataformatter: deviceAction('Isolate', (formData) => ({
        IsolationType: formData.IsolationType ?? 'Full',
      })),
      relatedQueryKeys: ['ListDefenderMachineActions-*'],
      condition: (row) =>
        canSendActions &&
        hasTarget(row) &&
        row.onboardingStatus === 'Onboarded',
    },
    {
      label: 'Release from isolation',
      type: 'POST',
      url: '/api/ExecDefenderMachineAction',
      icon: <CippIcons.LockOpen />,
      color: 'info',
      hideBulk: true,
      multiPost: false,
      fields: [commentField],
      confirmText: (row) => `Release ${deviceLabel(row)} from isolation?`,
      customDataformatter: deviceAction('Release', () => ({})),
      relatedQueryKeys: ['ListDefenderMachineActions-*'],
      condition: (row) => canSendActions && hasTarget(row),
    },
    {
      label: 'Run antivirus scan',
      type: 'POST',
      url: '/api/ExecDefenderMachineAction',
      icon: <CippIcons.Security />,
      color: 'info',
      hideBulk: true,
      multiPost: false,
      fields: [
        {
          type: 'radio',
          name: 'ScanType',
          label: 'Scan type',
          options: [
            { label: 'Quick scan', value: 'Quick' },
            { label: 'Full scan', value: 'Full' },
          ],
          defaultValue: 'Quick',
        },
        commentField,
      ],
      confirmText: (row) =>
        `Run a Microsoft Defender Antivirus scan on ${deviceLabel(row)}?`,
      customDataformatter: deviceAction('Scan', (formData) => ({
        ScanType: formData.ScanType ?? 'Quick',
      })),
      relatedQueryKeys: ['ListDefenderMachineActions-*'],
      condition: (row) =>
        canSendActions &&
        hasTarget(row) &&
        row.onboardingStatus === 'Onboarded',
    },
    {
      label: 'Action history',
      icon: <CippIcons.History />,
      color: 'info',
      hideBulk: true,
      multiPost: false,
      customComponent: (row, { drawerVisible, setDrawerVisible }) => (
        <DefenderActionHistoryDialog
          tenantFilter={row.Tenant}
          machineId={row.id}
          deviceName={row.computerDnsName ?? row.id}
          open={!!drawerVisible}
          onClose={() => setDrawerVisible(false)}
        />
      ),
      condition: (row) => canReadHistory && hasTarget(row),
    },
  ]

  return (
    <>
      <CippTablePage
        title="Defender Devices"
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        dataMap={mapDevice}
        queryKey={reportDB.resolvedQueryKey}
        dataSourceControls={reportDB.controls}
        actions={actions}
        filters={[
          {
            filterName: 'Inactive',
            value: [{ id: 'healthStatus', value: 'Inactive' }],
            type: 'column',
          },
          {
            filterName: 'Antivirus passive',
            value: [{ id: 'avMode', value: 'Passive' }],
            type: 'column',
            filterType: 'equal',
          },
          {
            filterName: 'Signatures out of date',
            value: [{ id: 'avIsSignatureUpToDate', value: 'False' }],
            type: 'column',
          },
          {
            filterName: 'Can be onboarded',
            value: [{ id: 'onboardingStatus', value: 'CanBeOnboarded' }],
            type: 'column',
          },
        ]}
        offCanvas={{
          extendedInfoFields: [
            'computerDnsName',
            'id',
            'osPlatform',
            'version',
            'osBuild',
            'osArchitecture',
            'healthStatus',
            'onboardingStatus',
            'riskScore',
            'exposureLevel',
            'deviceValue',
            'firstSeen',
            'lastSeen',
            'lastIpAddress',
            'lastExternalIpAddress',
            'aadDeviceId',
            'machineTags',
            'rbacGroupName',
            'isExcluded',
            'managedBy',
            'managedByStatus',
            'avMode',
            'avSignatureVersion',
            'avSignatureUpdateTime',
            'avIsSignatureUpToDate',
            'avEngineVersion',
            'avIsEngineUpToDate',
            'avPlatformVersion',
            'avIsPlatformUpToDate',
            'quickScanResult',
            'quickScanTime',
            'fullScanResult',
            'fullScanTime',
          ],
        }}
        simpleColumns={[
          ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
          'computerDnsName',
          'osPlatform',
          'version',
          'healthStatus',
          'onboardingStatus',
          'riskScore',
          'exposureLevel',
          'avMode',
          'avIsSignatureUpToDate',
          'avSignatureUpdateTime',
          'lastSeen',
          'machineTags',
          ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
        ]}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout tenantGroupSupport={true}>{page}</DashboardLayout>
)

export default Page
