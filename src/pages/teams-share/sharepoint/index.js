import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippTablePage } from '../../../components/CippComponents/CippTablePage.jsx'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import {
  Add,
  AddToPhotos,
  PersonAdd,
  PersonRemove,
  AdminPanelSettings,
  NoAccounts,
  Delete,
  CleaningServices,
  Assessment,
  FolderShared,
  RestoreFromTrash,
  Settings,
} from '@mui/icons-material'
import Link from 'next/link'
import { Stack } from '@mui/system'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { useSettings } from '../../../hooks/use-settings'
import { usePermissions } from '../../../hooks/use-permissions'
import { useCippReportDB } from '../../../components/CippComponents/CippReportDBControls'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { CippFormCondition } from '../../../components/CippComponents/CippFormCondition'
import { CippPropertyList } from '../../../components/CippComponents/CippPropertyList'
import { ApiGetCall } from '../../../api/ApiCall'
import { CippEditSitePropertiesForm } from '../../../components/CippComponents/CippEditSitePropertiesForm'
import { CippSiteRecycleBinDialog } from '../../../components/CippComponents/CippSiteRecycleBinDialog'

// Friendly labels for the SharePoint version cleanup (trim) job progress fields.
const VERSION_CLEANUP_LABELS = {
  Status: 'Status',
  BatchDeleteMode: 'Cleanup Mode',
  RequestTimeInUTC: 'Requested (UTC)',
  LastProcessTimeInUTC: 'Last Processed (UTC)',
  CompleteTimeInUTC: 'Completed (UTC)',
  ListsProcessed: 'Lists Processed',
  ListsUpdated: 'Lists Updated',
  ListsFailed: 'Lists Failed',
  FilesProcessed: 'Files Processed',
  VersionsProcessed: 'Versions Processed',
  VersionsDeleted: 'Versions Deleted',
  VersionsFailed: 'Versions Failed',
  StorageReleased: 'Storage Released (bytes)',
  ErrorMessage: 'Error Message',
  WorkItemId: 'Work Item ID',
}
// Order in which the fields are shown.
const VERSION_CLEANUP_FIELDS = Object.keys(VERSION_CLEANUP_LABELS)

// Renders the body of the status modal based on the fetched job progress.
const VersionCleanupStatusBody = ({ statusApi }) => {
  const progress = statusApi.data?.Results

  if (statusApi.isError) {
    return <Alert severity="error">Failed to load cleanup job status.</Alert>
  }

  // No job: either an empty/blank response, or the API's explicit "NoRequestFound" status.
  if (
    !statusApi.isFetching &&
    (progress === undefined ||
      progress === null ||
      (typeof progress === 'string' && progress.trim() === '') ||
      progress?.Status === 'NoRequestFound')
  ) {
    return <Alert severity="info">No cleanup job found for this site.</Alert>
  }

  // Backend couldn't parse the payload and returned the raw string.
  if (!statusApi.isFetching && typeof progress === 'string') {
    return <Alert severity="info">{progress}</Alert>
  }

  const propertyItems = VERSION_CLEANUP_FIELDS.filter(
    (key) => progress?.[key] !== undefined && progress?.[key] !== ''
  ).map((key) => ({
    label: VERSION_CLEANUP_LABELS[key],
    value: String(progress[key]),
  }))

  return (
    <CippPropertyList
      isFetching={statusApi.isFetching}
      layout="two"
      propertyItems={
        propertyItems.length
          ? propertyItems
          : VERSION_CLEANUP_FIELDS.map((key) => ({ label: VERSION_CLEANUP_LABELS[key], value: '' }))
      }
    />
  )
}

// Custom-component action modal: opens directly (no confirmation step) and fetches the trim
// job status for the selected site, rendering it as a property list.
const VersionCleanupStatusModal = ({ row, tenantFilter, drawerVisible, setDrawerVisible }) => {
  const siteRow = Array.isArray(row) ? row[0] : row
  const siteUrl = siteRow?.webUrl
  const statusApi = ApiGetCall({
    url: '/api/ListSPOVersionCleanup',
    data: {
      tenantFilter: siteRow?.Tenant ?? tenantFilter,
      SiteUrl: siteUrl,
    },
    queryKey: `SPOVersionCleanupStatus-${siteUrl}`,
    waiting: !!drawerVisible && !!siteUrl,
  })

  return (
    <Dialog fullWidth maxWidth="sm" open={!!drawerVisible} onClose={() => setDrawerVisible(false)}>
      <DialogTitle>
        Cleanup Job Status{siteRow?.displayName ? ` — ${siteRow.displayName}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        <VersionCleanupStatusBody statusApi={statusApi} />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={() => setDrawerVisible(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const Page = () => {
  const pageTitle = 'SharePoint Sites'
  const tenantFilter = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWriteSite = checkPermissions(['Sharepoint.Site.ReadWrite'])
  const canReadSite = checkPermissions(['Sharepoint.Site.Read', 'Sharepoint.Site.ReadWrite'])
  const canReadRecycleBin = checkPermissions([
    'Sharepoint.SiteRecycleBin.Read',
    'Sharepoint.SiteRecycleBin.ReadWrite',
  ])
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListSites?type=SharePointSiteUsage',
    queryKey: 'ListSites-SharePointSiteUsage',
    cacheName: 'SharePointSiteUsage',
    syncTitle: 'Sync SharePoint Sites Report',
    syncData: { Types: 'SharePointSiteUsage' },
    allowToggle: true,
    defaultCached: true,
    allowAllTenantSync: true,
  })

  const actions = [
    {
      label: 'Add Member',
      type: 'POST',
      icon: <PersonAdd />,
      url: '/api/ExecSetSharePointMember',
      data: {
        groupId: 'ownerPrincipalName',
        add: true,
        URL: 'webUrl',
        SharePointType: 'rootWebTemplate',
      },
      confirmText: 'Select the User to add and the site role to add them to.',
      condition: () => canWriteSite,
      fields: [
        {
          type: 'autoComplete',
          name: 'user',
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
        {
          type: 'radio',
          name: 'Role',
          label: 'Site Role',
          options: [
            { label: 'Members', value: 'Members' },
            { label: 'Owners', value: 'Owners' },
            { label: 'Visitors', value: 'Visitors' },
          ],
        },
      ],
      defaultvalues: {
        Role: 'Members',
      },
      allowResubmit: true,
      multiPost: false,
    },
    {
      label: 'Remove Member',
      type: 'POST',
      icon: <PersonRemove />,
      url: '/api/ExecSetSharePointMember',
      data: {
        groupId: 'ownerPrincipalName',
        add: false,
        URL: 'webUrl',
        SharePointType: 'rootWebTemplate',
      },
      confirmText: 'Select the user to remove from their site role.',
      condition: () => canWriteSite,
      children: ({ formHook, row }) => {
        const siteRow = Array.isArray(row) ? row[0] : row
        return (
          <CippFormComponent
            type="autoComplete"
            name="user"
            label="Select Member"
            multiple={false}
            creatable={false}
            formControl={formHook}
            validators={{ required: 'Please select a member' }}
            api={{
              url: '/api/ListSiteMembers',
              data: {
                SiteId: siteRow?.siteId,
                SiteUrl: siteRow?.webUrl,
                tenantFilter: siteRow?.Tenant ?? tenantFilter,
              },
              queryKey: `SiteMembersPicker-${siteRow?.siteId}`,
              dataKey: 'Results',
              labelField: (member) =>
                `${member.Title} (${member.UserPrincipalName}) — ${member.Group}`,
              valueField: 'UserPrincipalName',
              addedField: {
                Group: 'Group',
                Type: 'Type',
              },
              dataFilter: (options) =>
                options.filter(
                  (option, index, all) =>
                    option.value &&
                    ['Owners', 'Members', 'Visitors'].includes(option.addedFields?.Group) &&
                    all.findIndex(
                      (o) =>
                        o.value === option.value &&
                        o.addedFields?.Group === option.addedFields?.Group
                    ) === index
                ),
              showRefresh: true,
            }}
          />
        )
      },
      multiPost: false,
      allowResubmit: true,
    },
    {
      label: 'Remove User From Site',
      type: 'POST',
      icon: <NoAccounts />,
      url: '/api/ExecRemoveSiteUser',
      data: {
        SiteUrl: 'webUrl',
      },
      confirmText:
        'Remove a user from the entire site: this removes them from every site group and direct permission grant at once. Sharing links they received are not revoked.',
      condition: () => canWriteSite,
      children: ({ formHook, row }) => {
        const siteRow = Array.isArray(row) ? row[0] : row
        return (
          <CippFormComponent
            type="autoComplete"
            name="user"
            label="Select User"
            multiple={false}
            creatable={false}
            formControl={formHook}
            validators={{ required: 'Please select a user' }}
            api={{
              url: '/api/ListSiteMembers',
              data: {
                SiteId: siteRow?.siteId,
                SiteUrl: siteRow?.webUrl,
                tenantFilter: siteRow?.Tenant ?? tenantFilter,
              },
              queryKey: `SiteMembersPicker-${siteRow?.siteId}`,
              dataKey: 'Results',
              labelField: (member) =>
                `${member.Title} (${member.UserPrincipalName})${member.IsGuest ? ' — Guest' : ''} — ${member.Group}`,
              valueField: 'UserPrincipalName',
              addedField: {
                LoginName: 'LoginName',
                Type: 'Type',
              },
              dataFilter: (options) =>
                options.filter(
                  (option, index, all) =>
                    option.value &&
                    option.addedFields?.Type === 'User' &&
                    all.findIndex((o) => o.value === option.value) === index
                ),
              showRefresh: true,
            }}
          />
        )
      },
      multiPost: false,
    },
    {
      label: 'Revoke Sharing Links',
      type: 'POST',
      icon: <FolderShared />,
      url: '/api/ExecBulkRemoveSharingLinks',
      data: {
        SiteUrl: 'webUrl',
      },
      confirmText:
        'Bulk revoke sharing links on [displayName]. This uses the sharing report cache: links created since the last sharing sync are not covered - run a sync from the Sharing Report page first for full coverage.',
      condition: () => canWriteSite,
      fields: [
        {
          type: 'radio',
          name: 'Scope',
          label: 'Which links to revoke',
          options: [
            { label: 'Anonymous links only (anyone with the link)', value: 'Anonymous' },
            { label: 'Anonymous + external user shares', value: 'External' },
            { label: 'All sharing links, including internal', value: 'All' },
          ],
        },
      ],
      defaultvalues: {
        Scope: 'Anonymous',
      },
      multiPost: false,
    },
    {
      label: 'Edit Site',
      type: 'POST',
      icon: <Settings />,
      url: '/api/ExecSetSiteProperties',
      confirmText:
        'Edit site properties for [displayName]. Fields are prefilled with the current values.',
      condition: () => canWriteSite,
      children: ({ formHook, row }) => (
        <CippEditSitePropertiesForm formHook={formHook} row={row} tenantFilter={tenantFilter} />
      ),
      customDataformatter: (row, action, formData) => {
        const siteRow = Array.isArray(row) ? row[0] : row
        const isGroupSite = siteRow?.rootWebTemplate === 'Group'
        const v = (x) => (x && typeof x === 'object' && 'value' in x ? x.value : x)
        const payload = {
          tenantFilter: siteRow.Tenant ?? tenantFilter,
          SiteUrl: siteRow.webUrl,
          SharingCapability: v(formData.SharingCapability),
          DefaultSharingLinkType: v(formData.DefaultSharingLinkType),
          DefaultLinkPermission: v(formData.DefaultLinkPermission),
          LockState: v(formData.LockState),
        }
        if (!isGroupSite) {
          payload.Title = formData.Title
          payload.SharingDomainRestrictionMode = v(formData.SharingDomainRestrictionMode)
          payload.OverrideTenantAnonymousLinkExpirationPolicy =
            !!formData.OverrideTenantAnonymousLinkExpirationPolicy
          payload.InheritVersionPolicyFromTenant = !!formData.InheritVersionPolicyFromTenant
        }
        if (!isGroupSite && v(formData.SharingDomainRestrictionMode) === 'AllowList') {
          payload.SharingAllowedDomainList = formData.SharingAllowedDomainList
        }
        if (!isGroupSite && v(formData.SharingDomainRestrictionMode) === 'BlockList') {
          payload.SharingBlockedDomainList = formData.SharingBlockedDomainList
        }
        if (!isGroupSite && formData.OverrideTenantAnonymousLinkExpirationPolicy) {
          payload.AnonymousLinkExpirationInDays = parseInt(
            formData.AnonymousLinkExpirationInDays ?? 0,
            10
          )
        }
        const storageMax = parseInt(formData.StorageMaximumLevel, 10)
        const storageWarn = parseInt(formData.StorageWarningLevel, 10)
        if (!isNaN(storageMax) && storageMax > 0) payload.StorageMaximumLevel = storageMax
        if (!isNaN(storageWarn) && storageWarn > 0) payload.StorageWarningLevel = storageWarn
        if (!isGroupSite && !formData.InheritVersionPolicyFromTenant) {
          payload.EnableAutoExpirationVersionTrim = !!formData.EnableAutoExpirationVersionTrim
          if (!formData.EnableAutoExpirationVersionTrim) {
            payload.MajorVersionLimit = parseInt(formData.MajorVersionLimit ?? 0, 10)
            payload.ExpireVersionsAfterDays = parseInt(formData.ExpireVersionsAfterDays ?? 0, 10)
          }
        }
        return payload
      },
      multiPost: false,
      allowResubmit: true,
    },
    {
      label: 'Add Site Admin',
      type: 'POST',
      icon: <AdminPanelSettings />,
      url: '/api/ExecSharePointPerms',
      data: {
        UPN: 'ownerPrincipalName',
        RemovePermission: false,
        URL: 'webUrl',
      },
      confirmText: 'Select the User to add to the Site Admins permissions',
      condition: () => canWriteSite,
      fields: [
        {
          type: 'autoComplete',
          name: 'user',
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
      multiPost: false,
    },
    {
      label: 'Remove Site Admin',
      type: 'POST',
      icon: <NoAccounts />,
      url: '/api/ExecSharePointPerms',
      data: {
        UPN: 'ownerPrincipalName',
        RemovePermission: true,
        URL: 'webUrl',
      },
      confirmText: 'Select the User to remove from the Site Admins permissions',
      condition: () => canWriteSite,
      fields: [
        {
          type: 'autoComplete',
          name: 'user',
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
      multiPost: false,
    },
    {
      label: 'Set Library Permission',
      type: 'POST',
      icon: <FolderShared />,
      url: '/api/ExecSetLibraryPermission',
      confirmText:
        'Grant users or groups a permission level on a document library of [displayName].',
      condition: () => canWriteSite,
      children: ({ formHook, row }) => {
        const siteRow = Array.isArray(row) ? row[0] : row
        return (
          <>
            <CippFormComponent
              type="autoComplete"
              name="library"
              label="Document Library"
              multiple={false}
              creatable={false}
              formControl={formHook}
              validators={{ required: 'Please select a document library' }}
              api={{
                url: '/api/ListSiteLibraries',
                data: {
                  SiteId: siteRow?.siteId,
                  SiteUrl: siteRow?.webUrl,
                  tenantFilter: siteRow?.Tenant ?? tenantFilter,
                },
                queryKey: `SiteLibraries-${siteRow?.siteId}`,
                dataKey: 'Results',
                labelField: (library) => library.Title,
                valueField: 'Id',
                showRefresh: true,
              }}
            />
            <CippFormComponent
              type="autoComplete"
              name="users"
              label="Users"
              multiple={true}
              creatable={false}
              formControl={formHook}
              api={{
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
              }}
            />
            <CippFormComponent
              type="autoComplete"
              name="groups"
              label="Groups"
              multiple={true}
              creatable={false}
              formControl={formHook}
              api={{
                url: '/api/ListGraphRequest',
                data: {
                  Endpoint: 'groups',
                  $select: 'id,displayName,mail,securityEnabled,groupTypes',
                  $top: 999,
                  $count: true,
                },
                queryKey: 'ListGroupsAutoComplete',
                dataKey: 'Results',
                labelField: (group) =>
                  group.mail ? `${group.displayName} (${group.mail})` : group.displayName,
                valueField: 'id',
                addedField: {
                  securityEnabled: 'securityEnabled',
                  groupTypes: 'groupTypes',
                },
                showRefresh: true,
              }}
            />
            <CippFormComponent
              type="radio"
              name="PermissionLevel"
              label="Permission Level"
              formControl={formHook}
              options={[
                { label: 'Read', value: 'read' },
                { label: 'Contribute', value: 'contribute' },
                { label: 'Edit', value: 'edit' },
                { label: 'Design', value: 'design' },
                { label: 'Full Control', value: 'fullControl' },
              ]}
            />
          </>
        )
      },
      defaultvalues: {
        PermissionLevel: 'read',
      },
      customDataformatter: (row, action, formData) => {
        const siteRow = Array.isArray(row) ? row[0] : row
        return {
          tenantFilter: siteRow.Tenant ?? tenantFilter,
          SiteUrl: siteRow.webUrl,
          ListId: formData.library?.value,
          LibraryName: formData.library?.label,
          PermissionLevel: formData.PermissionLevel,
          Users: formData.users ?? [],
          Groups: formData.groups ?? [],
        }
      },
      multiPost: false,
    },
    {
      label: 'Delete Site',
      type: 'POST',
      icon: <Delete />,
      url: '/api/DeleteSharepointSite',
      data: {
        SiteId: 'siteId',
      },
      confirmText:
        'Are you sure you want to delete this SharePoint site? Deleted sites can be restored from the Deleted Sites page for 93 days.',
      color: 'error',
      // System sites cannot be deleted (SPO rejects it or the tenant breaks): admin site,
      // My Site host, search/compliance centers, root site, content type hub. Team channel
      // sites are deleted by deleting the channel in Teams, not directly.
      condition: (row) =>
        canWriteSite &&
        ![
          'Tenant Admin Site',
          'My Site Host',
          'Basic Search Center',
          'Compliance Policy Center',
          'SharePoint Online Tenant Fundamental Site',
          'Team Channel',
          'App Catalog Site',
        ].includes(row.rootWebTemplate) &&
        !/\.sharepoint\.com\/?$/i.test(row.webUrl ?? '') &&
        !/\/sites\/contentTypeHub$/i.test(row.webUrl ?? ''),
      multiPost: false,
    },
    {
      label: 'Start Version Cleanup Job',
      type: 'POST',
      icon: <CleaningServices />,
      url: '/api/ExecSPOVersionCleanup',
      data: {
        SiteUrl: 'webUrl',
      },
      confirmText:
        'Start a file version cleanup job for [displayName]. This will trim old file versions based on the selected mode.',
      condition: () => canWriteSite,
      children: ({ formHook }) => (
        <>
          <CippFormComponent
            type="radio"
            name="BatchDeleteMode"
            label="Cleanup Mode"
            formControl={formHook}
            options={[
              { label: 'Sync Policy — apply site version policy to existing versions', value: '2' },
              {
                label: 'Delete Older Than Days — remove versions older than a set number of days',
                value: '0',
              },
              { label: 'Count Limits — keep a maximum number of major versions', value: '1' },
            ]}
          />
          <CippFormCondition
            field="BatchDeleteMode"
            compareType="is"
            compareValue="0"
            formControl={formHook}
          >
            <CippFormComponent
              type="number"
              name="DeleteOlderThanDays"
              label="Delete Versions Older Than (days)"
              formControl={formHook}
              validators={{
                required: 'Please enter the number of days',
                min: { value: 30, message: 'SharePoint requires at least 30 days' },
              }}
            />
          </CippFormCondition>
          <CippFormCondition
            field="BatchDeleteMode"
            compareType="is"
            compareValue="1"
            formControl={formHook}
          >
            <CippFormComponent
              type="number"
              name="MajorVersionLimit"
              label="Maximum Major Versions to Keep"
              formControl={formHook}
              validators={{ required: 'Please enter the version limit' }}
            />
            <CippFormComponent
              type="number"
              name="MajorWithMinorVersionsLimit"
              label="Major Versions That Keep Their Minor Versions"
              formControl={formHook}
              validators={{ required: 'Please enter the major-with-minor version limit' }}
            />
          </CippFormCondition>
        </>
      ),
      defaultvalues: {
        BatchDeleteMode: '2',
      },
      customDataformatter: (row, action, formData) => {
        const formatRow = (singleRow) => ({
          tenantFilter: singleRow.Tenant ?? tenantFilter,
          SiteUrl: singleRow.webUrl,
          BatchDeleteMode: parseInt(formData.BatchDeleteMode, 10),
          DeleteOlderThanDays:
            formData.BatchDeleteMode === '0' ? parseInt(formData.DeleteOlderThanDays, 10) : -1,
          MajorVersionLimit:
            formData.BatchDeleteMode === '1' ? parseInt(formData.MajorVersionLimit, 10) : -1,
          MajorWithMinorVersionsLimit:
            formData.BatchDeleteMode === '1'
              ? parseInt(formData.MajorWithMinorVersionsLimit, 10)
              : -1,
        })
        // When multiple rows are selected, row is an array. Returning an array
        // makes CippApiDialog send one request per row (bulk request mode).
        return Array.isArray(row) ? row.map(formatRow) : formatRow(row)
      },
      multiPost: false,
    },
    {
      label: 'Recycle Bin',
      icon: <RestoreFromTrash />,
      condition: () => canReadRecycleBin,
      customComponent: (row, { drawerVisible, setDrawerVisible }) => (
        <CippSiteRecycleBinDialog
          row={row}
          tenantFilter={tenantFilter}
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
        />
      ),
      multiPost: false,
    },
    {
      label: 'Check Cleanup Job Status',
      icon: <Assessment />,
      condition: () => canReadSite,
      customComponent: (row, { drawerVisible, setDrawerVisible }) => (
        <VersionCleanupStatusModal
          row={row}
          tenantFilter={tenantFilter}
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
        />
      ),
      multiPost: false,
    },
  ]

  const offCanvas = {
    extendedInfoFields: ['displayName', 'description', 'webUrl'],
    actions: actions,
    children: (row) => (
      <CippDataTable
        title="Site Members"
        queryKey={`site-members-${row.siteId}`}
        api={{
          url: '/api/ListSiteMembers',
          data: {
            SiteId: row.siteId,
            SiteUrl: row.webUrl,
            tenantFilter: tenantFilter,
          },
          dataKey: 'Results',
        }}
        simpleColumns={['Title', 'Email', 'Group', 'Type', 'IsGuest', 'IsSiteAdmin']}
      />
    ),
    size: 'lg', // Make the offcanvas extra large
  }

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

  const pageActions = (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button component={Link} href="/teams-share/sharepoint/add-site" startIcon={<Add />}>
        Add Site
      </Button>
      <Button
        component={Link}
        href="/teams-share/sharepoint/bulk-add-site"
        startIcon={<AddToPhotos />}
      >
        Bulk Add Sites
      </Button>
      {reportDB.controls}
    </Stack>
  )

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        cardButton={pageActions}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>

export default Page
