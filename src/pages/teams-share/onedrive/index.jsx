import { Layout as DashboardLayout } from '../../../layouts/index'
import { CippIcons } from '../../../utils/icon-registry'
import { CippTablePage } from '../../../components/CippComponents/CippTablePage.jsx'
import { useCippReportDB } from '../../../components/CippComponents/CippReportDBControls'
import { useSettings } from '../../../hooks/use-settings'
import { usePermissions } from '../../../hooks/use-permissions'
import { CippEditSitePropertiesForm } from '../../../components/CippComponents/CippEditSitePropertiesForm'

const Page = () => {
  const pageTitle = 'OneDrive'
  const tenantFilter = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWriteSite = checkPermissions(['Sharepoint.Site.ReadWrite'])
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListSites?type=OneDriveUsageAccount',
    queryKey: 'ListSites-OneDriveUsageAccount',
    cacheName: 'OneDriveUsage',
    syncTitle: 'Sync OneDrive Report',
    syncData: { Types: 'OneDriveUsage' },
    allowToggle: true,
    defaultCached: false,
    allowAllTenantSync: true,
  })

  const actions = [
    {
      label: 'Add permissions to OneDrive',
      icon: <CippIcons.PersonAdd />,
      type: 'POST',
      url: '/api/ExecSharePointPerms',
      data: {
        UPN: 'ownerPrincipalName',
        URL: 'webUrl',
        RemovePermission: false,
      },
      confirmText: "Select the User to add to this user's OneDrive permissions",
      fields: [
        {
          type: 'autoComplete',
          name: 'onedriveAccessUser',
          label: 'Select User',
          multiple: false,
          creatable: false,
          api: {
            url: '/api/ListGraphRequest',
            data: {
              Endpoint: 'users',
              $select: 'id,displayName,userPrincipalName',
              $top: 999,
              $count: true,
            },
            queryKey: 'ListUsersAutoComplete',
            dataKey: 'Results',
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: 'userPrincipalName',
            addedField: {
              id: 'id',
            },
            showRefresh: true,
          },
        },
      ],
    },
    {
      label: 'Remove permissions from OneDrive',
      icon: <CippIcons.PersonRemove />,
      type: 'POST',
      url: '/api/ExecSharePointPerms',
      data: {
        UPN: 'ownerPrincipalName',
        URL: 'webUrl',
        RemovePermission: true,
      },
      confirmText: "Select the User to remove from this user's OneDrive permissions",
      fields: [
        {
          type: 'autoComplete',
          name: 'onedriveAccessUser',
          label: 'Select User',
          multiple: false,
          creatable: false,
          api: {
            url: '/api/ListGraphRequest',
            dataKey: 'Results',
            data: {
              Endpoint: 'users',
              manualPagination: true,
              $select: 'id,userPrincipalName,displayName',
              $count: true,
              $orderby: 'displayName',
              $top: 999,
            },
            labelField: (onedriveAccessUser) =>
              `${onedriveAccessUser.displayName} (${onedriveAccessUser.userPrincipalName})`,
            valueField: 'userPrincipalName',
            addedField: {
              displayName: 'displayName',
            },
          },
        },
      ],
    },
    {
      label: 'Edit OneDrive Site',
      type: 'POST',
      icon: <CippIcons.Settings />,
      url: '/api/ExecSetSiteProperties',
      confirmText:
        'Edit OneDrive site properties for [displayName]. Fields are prefilled with the current values.',
      condition: () => canWriteSite,
      children: ({ formHook, row }) => (
        <CippEditSitePropertiesForm formHook={formHook} row={row} tenantFilter={tenantFilter} />
      ),
      customDataformatter: (row, action, formData) => {
        const v = (x) => (x && typeof x === 'object' && 'value' in x ? x.value : x)
        // OneDrive sites are never group-connected, so the full personal-site property set
        // applies to every selected row.
        const formatRow = (siteRow) => {
          const payload = {
            tenantFilter: siteRow.Tenant ?? tenantFilter,
            SiteUrl: siteRow.webUrl,
            Title: formData.Title,
            SharingCapability: v(formData.SharingCapability),
            DefaultSharingLinkType: v(formData.DefaultSharingLinkType),
            DefaultLinkPermission: v(formData.DefaultLinkPermission),
            SharingDomainRestrictionMode: v(formData.SharingDomainRestrictionMode),
            OverrideTenantAnonymousLinkExpirationPolicy:
              !!formData.OverrideTenantAnonymousLinkExpirationPolicy,
            InheritVersionPolicyFromTenant: !!formData.InheritVersionPolicyFromTenant,
            LockState: v(formData.LockState),
          }
          if (v(formData.SharingDomainRestrictionMode) === 'AllowList') {
            payload.SharingAllowedDomainList = formData.SharingAllowedDomainList
          }
          if (v(formData.SharingDomainRestrictionMode) === 'BlockList') {
            payload.SharingBlockedDomainList = formData.SharingBlockedDomainList
          }
          if (formData.OverrideTenantAnonymousLinkExpirationPolicy) {
            payload.AnonymousLinkExpirationInDays = parseInt(
              formData.AnonymousLinkExpirationInDays ?? 0,
              10
            )
          }
          const storageMax = parseInt(formData.StorageMaximumLevel, 10)
          const storageWarn = parseInt(formData.StorageWarningLevel, 10)
          if (!isNaN(storageMax) && storageMax > 0) payload.StorageMaximumLevel = storageMax
          if (!isNaN(storageWarn) && storageWarn > 0) payload.StorageWarningLevel = storageWarn
          if (!formData.InheritVersionPolicyFromTenant) {
            payload.EnableAutoExpirationVersionTrim = !!formData.EnableAutoExpirationVersionTrim
            if (!formData.EnableAutoExpirationVersionTrim) {
              payload.MajorVersionLimit = parseInt(formData.MajorVersionLimit ?? 0, 10)
              payload.ExpireVersionsAfterDays = parseInt(formData.ExpireVersionsAfterDays ?? 0, 10)
            }
          }
          return payload
        }
        // When multiple rows are selected, row is an array. Returning an array
        // makes CippApiDialog send one request per row (bulk request mode).
        return Array.isArray(row) ? row.map(formatRow) : formatRow(row)
      },
      multiPost: false,
      allowResubmit: true,
    },
    {
      label: 'Reactivate Archived OneDrive',
      type: 'POST',
      icon: <CippIcons.Unarchive />,
      url: '/api/ExecReactivateSite',
      confirmText:
        'Reactivate the archived OneDrive for [displayName] ([ownerPrincipalName])? ' +
        'Reactivation is asynchronous and can take up to 24 hours. If the account is fully ' +
        'archived this may incur Microsoft 365 Archive reactivation and storage charges and ' +
        'requires Unlicensed OneDrive billing to be enabled in the tenant. After reactivation ' +
        'the account stays active for 30 days before it is archived again.',
      condition: () => canWriteSite,
      // Per-row Tenant (AllTenants / cached view) wins over the current tenant, matching the
      // "Edit OneDrive Site" action above. Returning an array on a multi-select sends one
      // request per row.
      customDataformatter: (row) => {
        const formatRow = (siteRow) => ({
          tenantFilter: siteRow.Tenant ?? tenantFilter,
          SiteUrl: siteRow.webUrl,
          SiteId: siteRow.siteId,
          WebId: siteRow.webId,
        })
        return Array.isArray(row) ? row.map(formatRow) : formatRow(row)
      },
      multiPost: false,
    },
  ]

  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === 'Tenant'),
    'displayName',
    'createdDateTime',
    'ownerPrincipalName',
    'lastActivityDate',
    'fileCount',
    'storageUsedInGigabytes',
    'storageAllocatedInGigabytes',
    'reportRefreshDate',
    'webUrl',
    ...reportDB.cacheColumns.filter((c) => c !== 'Tenant'),
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        simpleColumns={simpleColumns}
        dataSourceControls={reportDB.controls}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>

export default Page
