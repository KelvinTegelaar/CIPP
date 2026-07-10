import { Layout as DashboardLayout } from '../../layouts/index.js'
import { usePermissions } from '../../hooks/use-permissions'
import { useSettings } from '../../hooks/use-settings'
import { CippTablePage } from '../../components/CippComponents/CippTablePage.jsx'
import { NoAccounts } from '@mui/icons-material'

/*
 * Lists SharePoint Online's tenant external users store (live) and classifies every entry:
 * - Entra B2B: backed by a live Entra guest object
 * - Orphaned B2B: the Entra guest was deleted but SharePoint still knows the user
 * - SharePoint-only: legacy email-authenticated guest that never had an Entra object
 */
const Page = () => {
  const tenantFilter = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWriteSite = checkPermissions(['Sharepoint.Site.ReadWrite'])

  const actions = [
    {
      label: 'Remove Guest Access',
      type: 'POST',
      icon: <NoAccounts />,
      url: '/api/ExecRemoveSPOExternalUser',
      customDataformatter: (row) => {
        const r = Array.isArray(row) ? row[0] : row
        return {
          tenantFilter: r.Tenant ?? tenantFilter,
          EntraUserId: r.EntraUserId,
          LoginName: r.LoginName,
          SiteUrls: Array.isArray(r.Sites) ? r.Sites : [],
          DisplayName: r.DisplayName,
        }
      },
      confirmText:
        'Fully remove guest access for [DisplayName]? This deletes their Entra guest account (if one exists) AND removes them from every site listed in the Sites column, so nothing is left orphaned. Sharing links they hold can be revoked from the Sharing Report; the inert SharePoint store entry ages out on its own.',
      color: 'error',
      condition: (row) => canWriteSite && (row.InEntra || (row.Sites ?? []).length > 0),
      multiPost: false,
    },
  ]

  const filters = [
    {
      filterName: 'SharePoint-only',
      value: [{ id: 'GuestType', value: 'SharePoint-only (email authenticated)' }],
      type: 'column',
    },
    {
      filterName: 'Orphaned B2B',
      value: [{ id: 'GuestType', value: 'Orphaned B2B (not in Entra)' }],
      type: 'column',
    },
    {
      filterName: 'Entra B2B',
      value: [{ id: 'GuestType', value: 'Entra B2B' }],
      type: 'column',
    },
  ]

  return (
    <CippTablePage
      title="SharePoint External Users"
      apiUrl="/api/ListSharePointExternalUsers"
      apiDataKey="Results"
      actions={actions}
      filters={filters}
      simpleColumns={[
        'DisplayName',
        'AcceptedAs',
        'GuestType',
        'InEntra',
        'Source',
        'Sites',
        'WhenCreated',
        'InvitedBy',
      ]}
    />
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
