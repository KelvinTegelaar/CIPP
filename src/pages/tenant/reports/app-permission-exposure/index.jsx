import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import {
  CippAppPermissionExposureDetail,
  appPermissionExposureCaches,
  appPermissionExposureCellRenderers,
  appPermissionExposureFilters,
  signInActivityTooltip,
} from '../../../../components/CippComponents/CippAppPermissionExposureDetail'
import { usePermissions } from '../../../../hooks/use-permissions.js'
import { useSettings } from '../../../../hooks/use-settings'
import { CippIcons } from '../../../../utils/icon-registry'
import vendorTenantList from '../../../../data/vendorTenantList.json'

const pageTitle = 'App Permission Exposure'

const vendorsByTenantId = new Map(
  vendorTenantList.map((vendor) => [vendor.vendorTenantId?.toLowerCase(), vendor])
)

const vendorTypeLabels = {
  Microsoft: 'Microsoft',
  MSP: 'MSP tool',
  Business: 'Business app',
  Consumer: 'Personal Microsoft account',
}

const vendorTooltip = (row) => {
  const ownerTenantId = row?.AppOwnerTenantId
  const vendor = ownerTenantId ? vendorsByTenantId.get(ownerTenantId.toLowerCase()) : undefined
  if (!vendor && !row?.Vendor) return null
  const website = vendor?.website ?? row?.VendorWebsite
  const vendorType = vendor?.vendorType ?? row?.VendorType
  return {
    title: vendor?.vendorName ?? row?.Vendor,
    description: vendor?.description,
    items: [
      { label: 'Company', value: vendor?.companyName ?? row?.VendorCompany },
      { label: 'Website', value: website, href: website },
      { label: 'Vendor type', value: vendorTypeLabels[vendorType] ?? vendorType },
      { label: 'Category', value: vendor?.category ?? row?.VendorCategory },
      { label: 'Tags', value: vendor?.tags },
      {
        label: 'GDAP offboarding',
        value:
          vendor?.removeOnOffboarding === undefined
            ? undefined
            : vendor.removeOnOffboarding
              ? 'Offered for removal'
              : 'Kept',
      },
      { label: 'Owner tenant ID', value: ownerTenantId },
    ],
  }
}

const ownershipTooltip = (row) =>
  vendorTooltip(row) ??
  (row?.AppOwnerTenantId
    ? { items: [{ label: 'Owner tenant ID', value: row.AppOwnerTenantId }] }
    : null)

const cellTooltips = {
  Vendor: vendorTooltip,
  Ownership: ownershipTooltip,
  SignInActivity: signInActivityTooltip,
}

const Page = () => {
  const { checkPermissions } = usePermissions()
  const canWriteApplication = checkPermissions(['Tenant.Application.ReadWrite'])
  const currentTenant = useSettings().currentTenant

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListAppPermissionExposure',
    queryKey: 'ListAppPermissionExposure',
    cacheName: appPermissionExposureCaches,
    syncTitle: 'Sync App Permission Data',
    allowToggle: true,
    defaultCached: true,
  })

  const actions = [
    {
      icon: <CippIcons.EyeIcon />,
      label: 'View in CIPP',
      link: `/tenant/administration/applications/enterprise-app?spId=[ServicePrincipalId]&tenantFilter=${currentTenant}`,
      color: 'info',
      multiPost: false,
      external: false,
    },
    {
      icon: <CippIcons.Block />,
      label: 'Disable Service Principal',
      type: 'POST',
      color: 'warning',
      multiPost: false,
      url: '/api/ExecApplication',
      data: {
        Id: 'ServicePrincipalId',
        Type: 'servicePrincipals',
        Action: 'Update',
        Payload: { accountEnabled: false },
      },
      confirmText:
        "Disable '[AppDisplayName]'? Sign-ins and token issuance for this app stop in this tenant; its permissions stay in place and it can be enabled again.",
      relatedQueryKeys: [reportDB.resolvedQueryKey],
      condition: (row) => canWriteApplication && row?.AccountEnabled === true && !row?.IsCippApp,
    },
    {
      icon: <CippIcons.CheckCircle />,
      label: 'Enable Service Principal',
      type: 'POST',
      color: 'info',
      multiPost: false,
      url: '/api/ExecApplication',
      data: {
        Id: 'ServicePrincipalId',
        Type: 'servicePrincipals',
        Action: 'Update',
        Payload: { accountEnabled: true },
      },
      confirmText: "Enable '[AppDisplayName]' again?",
      relatedQueryKeys: [reportDB.resolvedQueryKey],
      condition: (row) => canWriteApplication && row?.AccountEnabled === false,
    },
    {
      icon: <CippIcons.Delete />,
      label: 'Delete Service Principal',
      type: 'POST',
      color: 'error',
      multiPost: false,
      url: '/api/ExecApplication',
      data: {
        Id: 'ServicePrincipalId',
        Type: 'servicePrincipals',
        Action: 'Delete',
      },
      confirmText:
        "Delete '[AppDisplayName]' from this tenant? This removes the app and every permission granted to it here. Using the app again needs a new consent.",
      confirmPhrase: 'DELETE',
      relatedQueryKeys: [reportDB.resolvedQueryKey],
      condition: (row) => canWriteApplication && !row?.IsCippApp,
    },
  ]

  const simpleColumns = [
    'AppDisplayName',
    'Risk',
    'HighestImpact',
    'Categories',
    'Ownership',
    'Vendor',
    'VendorCategory',
    'PublisherName',
    'VerifiedPublisher',
    'AccountEnabled',
    'SignInActivity',
    'LastSignInDateTime',
    'PermissionCount',
    'HasAllPrincipalsGrant',
    'AppId',
    ...reportDB.cacheColumns,
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={simpleColumns}
        cellTooltips={cellTooltips}
        cellRenderers={appPermissionExposureCellRenderers}
        filters={appPermissionExposureFilters}
        actions={actions}
        offCanvas={{
          size: 'lg',
          actions,
          children: (row) => <CippAppPermissionExposureDetail row={row} />,
        }}
        dataSourceControls={reportDB.controls}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>

export default Page
