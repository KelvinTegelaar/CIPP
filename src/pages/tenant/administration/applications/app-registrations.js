// this page is going to need some love for accounting for filters: https://github.com/KelvinTegelaar/CIPP/blob/main/src/views/tenant/administration/ListEnterpriseApps.jsx#L83
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippPermissionPreview from '../../../../components/CippComponents/CippPermissionPreview.jsx'
import { usePermissions } from '../../../../hooks/use-permissions.js'
import tabOptions from './tabOptions'
import { getAppRegistrationListActions } from '../../../../components/CippComponents/AppRegistrationActions.jsx'

const Page = () => {
  const pageTitle = 'App Registrations'
  const apiUrl = '/api/ListGraphRequest'

  const { checkPermissions } = usePermissions()
  const canWriteApplication = checkPermissions(['Tenant.Application.ReadWrite'])

  const actions = getAppRegistrationListActions(canWriteApplication)

  const offCanvas = {
    extendedInfoFields: [
      'displayName',
      'id',
      'appId',
      'createdDateTime',
      'signInAudience',
      'disabledByMicrosoftStatus',
      'replyUrls',
      'passwordCredentials',
      'keyCredentials',
    ],
    actions: actions,
    children: (row) => {
      return (
        <CippPermissionPreview
          applicationManifest={row}
          title="Application Manifest"
          maxHeight="800px"
          showAppIds={true}
        />
      )
    },
  }

  const simpleColumns = [
    'displayName',
    'appId',
    'createdDateTime',
    'signInAudience',
    'web.redirectUris',
    'publisherDomain',
    'passwordCredentials',
    'keyCredentials',
  ]

  const apiParams = {
    Endpoint: 'applications',
    $count: true,
    $top: 999,
  }

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiData={apiParams}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
