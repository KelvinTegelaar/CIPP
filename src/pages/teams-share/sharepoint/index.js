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
} from '@mui/icons-material'
import Link from 'next/link'
import { Stack } from '@mui/system'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { useSettings } from '../../../hooks/use-settings'
import { useCippReportDB } from '../../../components/CippComponents/CippReportDBControls'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { CippFormCondition } from '../../../components/CippComponents/CippFormCondition'
import { CippPropertyList } from '../../../components/CippComponents/CippPropertyList'
import { ApiGetCall } from '../../../api/ApiCall'

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
    (key) => progress?.[key] !== undefined && progress?.[key] !== '',
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
    <Dialog
      fullWidth
      maxWidth="sm"
      open={!!drawerVisible}
      onClose={() => setDrawerVisible(false)}
    >
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
      confirmText: 'Select the User to add as a member.',
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
      label: 'Remove Member',
      type: 'POST',
      icon: <PersonRemove />,
      url: '/api/ExecSetSharePointMember',
      data: {
        groupId: 'ownerPrincipalName',
        add: false,
        URL: 'URL',
        SharePointType: 'rootWebTemplate',
      },
      confirmText: 'Select the User to remove as a member.',
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
      label: 'Delete Site',
      type: 'POST',
      icon: <Delete />,
      url: '/api/DeleteSharepointSite',
      data: {
        SiteId: 'siteId',
      },
      confirmText:
        'Are you sure you want to delete this SharePoint site? This action cannot be undone.',
      color: 'error',
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
      label: 'Check Cleanup Job Status',
      icon: <Assessment />,
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
            tenantFilter: tenantFilter,
          },
          dataKey: 'Results',
        }}
        simpleColumns={['fields.Title', 'fields.EMail', 'fields.IsSiteAdmin']}
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
