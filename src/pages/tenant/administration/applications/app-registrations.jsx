import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippPermissionPreview from '../../../../components/CippComponents/CippPermissionPreview.jsx'
import { usePermissions } from '../../../../hooks/use-permissions.js'
import tabOptions from './tabOptions'
import { getAppRegistrationListActions } from '../../../../components/CippComponents/AppRegistrationActions.jsx'
import { useSettings } from '../../../../hooks/use-settings'
import {
  useAppSignInActivity,
  appSignInActivityColumns,
  appSignInActivityFilters,
} from '../../../../hooks/use-app-sign-in-activity'

const Page = () => {
  const pageTitle = 'App Registrations'
  const apiUrl = '/api/ListGraphRequest'

  const { checkPermissions } = usePermissions()
  const canWriteApplication = checkPermissions(['Tenant.Application.ReadWrite'])

  const actions = getAppRegistrationListActions(canWriteApplication)
  // The app's sign-ins in this tenant, through its enterprise app here.
  const signInActivity = useAppSignInActivity(useSettings().currentTenant)

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
    // Sign-in activity is read per tenant from the CIPP DB, so it is not shown for All Tenants.
    ...(signInActivity.enabled ? appSignInActivityColumns : []),
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
      rowOpen={{
        link: '/tenant/administration/applications/app-registration?appId=[appId]&tenantFilter=[Tenant]',
        condition: (row) => Boolean(row?.appId),
      }}
      simpleColumns={simpleColumns}
      dataTransform={signInActivity.dataTransform}
      filters={signInActivity.enabled ? appSignInActivityFilters : undefined}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
