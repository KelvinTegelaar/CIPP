import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import { Delete } from '@mui/icons-material'

const Page = () => {
  const actions = [
    {
      label: 'Remove Snooze',
      type: 'POST',
      url: '/api/ExecRemoveSnooze',
      data: {
        PartitionKey: 'PartitionKey',
        RowKey: 'RowKey',
      },
      icon: <Delete />,
      relatedQueryKeys: 'ListSnoozedAlerts',
      confirmText:
        'Are you sure you want to remove this snooze? The alert will fire again on the next run.',
      multiPost: false,
    },
  ]

  return (
    <CippTablePage
      title="Snoozed Alerts"
      apiUrl="/api/ListSnoozedAlerts"
      tenantInTitle={false}
      actions={actions}
      simpleColumns={[
        'CmdletName',
        'Tenant',
        'ContentPreview',
        'SnoozedBy',
        'Status',
        'RemainingDays',
      ]}
      queryKey="ListSnoozedAlerts"
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
