// this page is going to need some love for accounting for filters: https://github.com/KelvinTegelaar/CIPP/blob/main/src/views/tenant/administration/ListEnterpriseApps.jsx#L83
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { RocketLaunch } from '@mui/icons-material'
import { usePermissions } from '../../../../hooks/use-permissions.js'
import tabOptions from './tabOptions'
import { Button } from '@mui/material'
import Link from 'next/link'
import { getEnterpriseAppListActions } from '../../../../components/CippComponents/EnterpriseAppActions.jsx'

const Page = () => {
  const pageTitle = 'Enterprise Applications'
  const apiUrl = '/api/ListGraphRequest'

  const { checkPermissions } = usePermissions()
  const canWriteApplication = checkPermissions(['Tenant.Application.ReadWrite'])

  const actions = getEnterpriseAppListActions(canWriteApplication)

  const offCanvas = {
    extendedInfoFields: [
      'displayName',
      'createdDateTime',
      'accountEnabled',
      'publisherName',
      'replyUrls',
      'appOwnerOrganizationId',
      'tags',
      'passwordCredentials',
      'keyCredentials',
    ],
    actions: actions,
  }

  const simpleColumns = [
    'info.logoUrl',
    'displayName',
    'appId',
    'accountEnabled',
    'createdDateTime',
    'publisherName',
    'homepage',
    'passwordCredentials',
    'keyCredentials',
  ]

  const apiParams = {
    Endpoint: 'servicePrincipals',
    $select:
      'id,appId,displayName,createdDateTime,accountEnabled,homepage,publisherName,signInAudience,replyUrls,verifiedPublisher,info,api,appOwnerOrganizationId,tags,passwordCredentials,keyCredentials',
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
      cardButton={
        <>
          <Button component={Link} href="/tenant/tools/appapproval" startIcon={<RocketLaunch />}>
            Deploy Template
          </Button>
        </>
      }
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
