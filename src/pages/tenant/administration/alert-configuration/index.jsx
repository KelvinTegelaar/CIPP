import { Button } from '@mui/material'
import { CippIcons } from '../../../../utils/icon-registry'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index' // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import Link from 'next/link'

const Page = () => {
  const pageTitle = 'Alerts'
  const actions = [
    {
      label: 'View Task Details',
      link: '/cipp/scheduler/task?id=[RowKey]',
      pinned: true,
      icon: <CippIcons.EyeIcon />,
      condition: (row) => row?.EventType === 'Scheduled Task',
    },
    {
      label: 'Edit Alert',
      link: '/tenant/administration/alert-configuration/alert?id=[RowKey]',
      pinned: true,
      icon: <CippIcons.Edit />,
      color: 'success',
      target: '_self',
    },
    {
      label: 'Clone & Edit Alert',
      link: '/tenant/administration/alert-configuration/alert?id=[RowKey]&clone=true',
      icon: <CippIcons.CopyAll />,
      color: 'success',
      target: '_self',
    },
    {
      label: 'Enable Alert',
      type: 'POST',
      url: '/api/ExecToggleAlert',
      data: {
        ID: 'RowKey',
        EventType: 'EventType',
        Disabled: '!false',
      },
      icon: <CippIcons.ToggleOn />,
      relatedQueryKeys: 'ListAlertsQueue',
      condition: (row) => row.Enabled !== true,
      confirmText: 'Are you sure you want to enable this alert?',
      multiPost: false,
    },
    {
      label: 'Disable Alert',
      type: 'POST',
      url: '/api/ExecToggleAlert',
      data: {
        ID: 'RowKey',
        EventType: 'EventType',
        Disabled: '!true',
      },
      icon: <CippIcons.ToggleOff />,
      relatedQueryKeys: 'ListAlertsQueue',
      condition: (row) => row.Enabled === true,
      confirmText:
        'Are you sure you want to disable this alert? It will not run until you enable it again.',
      multiPost: false,
    },
    {
      label: 'Delete Alert',
      type: 'POST',
      url: '/api/RemoveQueuedAlert',
      data: {
        ID: 'RowKey',
        EventType: 'EventType',
      },
      icon: <CippIcons.Delete />,
      relatedQueryKeys: 'ListAlertsQueue',
      confirmText: 'Are you sure you want to delete this Alert?',
      multiPost: false,
    },
  ]

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListAlertsQueue"
      tenantInTitle={false}
      cardButton={
        <Button
          component={Link}
          href="/tenant/administration/alert-configuration/alert"
          startIcon={<CippIcons.NotificationAdd />}
        >
          Add Alert
        </Button>
      }
      actions={actions}
      simpleColumns={[
        'Tenants',
        'EventType',
        'Enabled',
        'Conditions',
        'RepeatsEvery',
        'Actions',
        'AlertComment',
        'excludedTenants',
      ]}
      queryKey="ListAlertsQueue"
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
