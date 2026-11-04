import { useMemo } from 'react'
import { Alert } from '@mui/material'
import { CippIcons } from '../../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippTablePage } from '../../../../../components/CippComponents/CippTablePage'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { useSettings } from '../../../../../hooks/use-settings'
import { usePermissions } from '../../../../../hooks/use-permissions.js'
import { exchangeAccessQueryKeys } from '../../../../../components/CippComponents/CippEnterpriseAppExchangeRbac'
import tabOptions from '../tabOptions'

const Page = () => {
  const pageTitle = 'App Mailbox Access'
  const tenant = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWrite = checkPermissions(['Tenant.Application.ReadWrite'])
  const queryKey = `ExoAppMailboxAccess-Policies-${tenant}`

  const actions = useMemo(
    () => [
      {
        label: "View app's Exchange access",
        link: `/tenant/administration/applications/enterprise-app/exchange?spId=[servicePrincipalId]&tenantFilter=${tenant}`,
        icon: <CippIcons.Launch />,
        multiPost: false,
        condition: (row) => !!row.servicePrincipalId,
      },
      ...(canWrite
        ? [
            {
              label: 'Remove Policy',
              type: 'POST',
              url: '/api/ExecEnterpriseAppExchangeRbac',
              icon: <CippIcons.Delete />,
              color: 'danger',
              confirmText:
                'Remove the [accessRight] policy for [scopeName], which applies to [appNames]? Their Entra mailbox permissions are no longer limited by it.',
              multiPost: false,
              relatedQueryKeys: exchangeAccessQueryKeys,
              customDataformatter: (rows) => ({
                tenantFilter: tenant,
                Action: 'RemovePolicies',
                PolicyIds: (Array.isArray(rows) ? rows : [rows]).map((row) => row.policyIdentity),
              }),
            },
          ]
        : []),
    ],
    [tenant, canWrite]
  )

  const simpleColumns = useMemo(
    () => ['appNames', 'accessRight', 'scopeName', 'isValid', 'description', 'policyIdentity'],
    []
  )

  return (
    <HeaderedTabbedLayout tabOptions={tabOptions} title={pageTitle}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Application access policies limit which mailboxes the mailbox permissions an app holds in
        Entra reach. RestrictAccess allows only the group's members; DenyAccess every mailbox but
        theirs. They do not limit Exchange application roles. Microsoft is replacing them with
        application roles scoped to a management scope or administrative unit, so new ones are not
        created here.
      </Alert>
      <CippTablePage
        title="Application Access Policies"
        apiUrl="/api/ListExoAppMailboxAccess"
        apiData={{ Type: 'Policies' }}
        apiDataKey="Results"
        queryKey={queryKey}
        actions={actions}
        simpleColumns={simpleColumns}
        hideTitle={true}
      />
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>

export default Page
