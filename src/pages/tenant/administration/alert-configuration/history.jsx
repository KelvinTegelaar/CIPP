import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'

const HISTORY_DAYS = 90

const Page = () => {
  const relatedQueryKeys = ['ListAlertHistory', 'ListSnoozedAlerts']

  const actions = [
    {
      label: 'Acknowledge',
      type: 'POST',
      url: '/api/ExecAcknowledgeAlert',
      data: {
        TenantFilter: 'Tenant',
        RowKey: 'RowKey',
        Action: '!Acknowledge',
      },
      fields: [{ type: 'textField', name: 'Note', label: 'Note (optional)' }],
      icon: <CippIcons.TaskAlt />,
      relatedQueryKeys,
      confirmText:
        'Mark this alert as acknowledged? It stays listed as known until the alert stops reporting it.',
      condition: (row) => row.Status === 'Open',
      multiPost: false,
    },
    {
      label: 'Remove Acknowledgement',
      type: 'POST',
      url: '/api/ExecAcknowledgeAlert',
      data: {
        TenantFilter: 'Tenant',
        RowKey: 'RowKey',
        Action: '!Unacknowledge',
      },
      icon: <CippIcons.Undo />,
      relatedQueryKeys,
      confirmText: 'Return this alert to open?',
      condition: (row) => row.Status === 'Acknowledged',
      multiPost: false,
    },
    {
      label: 'Remove Snooze',
      type: 'POST',
      url: '/api/ExecRemoveSnooze',
      data: {
        PartitionKey: 'SnoozePartitionKey',
        RowKey: 'SnoozeRowKey',
      },
      icon: <CippIcons.Delete />,
      relatedQueryKeys,
      confirmText:
        'Are you sure you want to remove this snooze? The alert returns to open now and notifies again on its next run.',
      condition: (row) => row.Status === 'Snoozed',
      multiPost: false,
    },
  ]

  return (
    <CippTablePage
      title="Alert History"
      apiUrl="/api/ListAlertResults"
      apiData={{
        tenantFilter: 'AllTenants',
        IncludeResolved: true,
        Days: HISTORY_DAYS,
      }}
      tenantInTitle={false}
      actions={actions}
      simpleColumns={[
        'Tenant',
        'CmdletName',
        'ContentPreview',
        'Status',
        'FirstSeen',
        'LastSeen',
        'LastChecked',
        'ResolvedAt',
        'ReopenCount',
        'AcknowledgedBy',
        'AcknowledgeNote',
        'SnoozedBy',
      ]}
      queryKey="ListAlertHistory"
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
