import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippIcons } from '../../../../utils/icon-registry'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { usePermissions } from '../../../../hooks/use-permissions.js'
import { useSettings } from '../../../../hooks/use-settings'
import tabOptions from './tabOptions'
import { Button, Chip, Tooltip } from '@mui/material'
import { useState } from 'react'
import Link from 'next/link'
import { getEnterpriseAppListActions } from '../../../../components/CippComponents/EnterpriseAppActions.jsx'

const Page = () => {
  const pageTitle = 'Enterprise Applications'
  const apiUrl = '/api/ListGraphRequest'
  const tenant = useSettings().currentTenant
  const [showMicrosoftApps, setShowMicrosoftApps] = useState(false)

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
      'id,appId,displayName,createdDateTime,accountEnabled,homepage,publisherName,signInAudience,replyUrls,verifiedPublisher,info,applicationTemplateId,appOwnerOrganizationId,tags,passwordCredentials,keyCredentials',
    // Entra's default 'Enterprise Applications' view; Microsoft first-party apps are most of every tenant's SPs.
    ...(!showMicrosoftApps && {
      $filter: "tags/any(t:t eq 'WindowsAzureActiveDirectoryIntegratedApp')",
    }),
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
      queryKey={`${pageTitle} - ${tenant} - ${showMicrosoftApps}`}
      dataSourceControls={
        <Tooltip
          title={
            showMicrosoftApps
              ? 'Showing Microsoft first-party apps — click to hide them'
              : 'Microsoft first-party apps are hidden — click to show them'
          }
        >
          <Chip
            icon={
              showMicrosoftApps ? (
                <CippIcons.Visibility />
              ) : (
                <CippIcons.VisibilityOff />
              )
            }
            label={
              showMicrosoftApps
                ? 'Microsoft apps shown'
                : 'Microsoft apps hidden'
            }
            color="primary"
            size="small"
            variant="outlined"
            clickable
            onClick={() => setShowMicrosoftApps((prev) => !prev)}
          />
        </Tooltip>
      }
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
