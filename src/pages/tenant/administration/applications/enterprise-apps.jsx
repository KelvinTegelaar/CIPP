import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
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
      'id,appId,displayName,createdDateTime,accountEnabled,homepage,publisherName,signInAudience,replyUrls,verifiedPublisher,info,api,applicationTemplateId,appOwnerOrganizationId,tags,passwordCredentials,keyCredentials',
    $count: true,
    $top: 999,
  }

  // 'Visible to users?' in the MyApps portal is stored as the 'HideApp' tag on the service
  // principal; a column filter on the (already-returned) tags collection surfaces hidden apps.
  const filters = [
    {
      filterName: 'Hidden from MyApps portal',
      value: [{ id: 'tags', value: 'HideApp' }],
      type: 'column',
    },
  ]

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiData={apiParams}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      rowOpen={{
        link: '/tenant/administration/applications/enterprise-app?spId=[id]&tenantFilter=[Tenant]',
        condition: (row) => Boolean(row?.id),
      }}
      simpleColumns={simpleColumns}
      filters={filters}
      cardButton={
        <>
          <Button
            component={Link}
            href="/tenant/tools/appapproval"
            startIcon={<CippIcons.RocketLaunch />}
          >
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
