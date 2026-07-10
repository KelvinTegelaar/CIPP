import { Layout as DashboardLayout } from '../../layouts/index.js'
import { usePermissions } from '../../hooks/use-permissions'
import { CippTablePage } from '../../components/CippComponents/CippTablePage.jsx'
import { RestoreFromTrash } from '@mui/icons-material'

const Page = () => {
  const { checkPermissions } = usePermissions()
  const canWriteSite = checkPermissions(['Sharepoint.Site.ReadWrite'])

  const actions = [
    {
      label: 'Restore Site',
      type: 'POST',
      icon: <RestoreFromTrash />,
      url: '/api/ExecRestoreDeletedSite',
      data: {
        SiteUrl: 'Url',
      },
      confirmText:
        'Restore [Url] from the tenant recycle bin? Large sites can take a while to finish restoring.',
      condition: () => canWriteSite,
      multiPost: false,
    },
  ]

  return (
    <CippTablePage
      title="Deleted SharePoint Sites"
      apiUrl="/api/ListDeletedSites"
      apiDataKey="Results"
      actions={actions}
      simpleColumns={[
        'Name',
        'Url',
        'Status',
        'DeletionTime',
        'DaysRemaining',
        'StorageMaximumLevel',
      ]}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
