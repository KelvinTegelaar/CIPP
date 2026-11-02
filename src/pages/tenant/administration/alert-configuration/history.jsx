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
        'SnoozedBy',
        'SnoozeReason',
        'SnoozeUntilResolved',
        'SnoozeVisible',
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
