import { useRef, useState } from 'react'
import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippInfoBar } from '../../../components/CippCards/CippInfoBar'
import { CippMultiQueueTracker } from '../../../components/CippComponents/CippMultiQueueTracker'
import { CippQueryRefreshButton } from '../../../components/CippComponents/CippQueryRefreshButton'
import { SharingReportButton } from '../../../components/CippPdf/SharingReportButton'
import { CippChartCard } from '../../../components/CippCards/CippChartCard'
import { CippImageCard } from '../../../components/CippCards/CippImageCard'
import { CippPropertyListCard } from '../../../components/CippCards/CippPropertyListCard'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { CippApiDialog } from '../../../components/CippComponents/CippApiDialog'
import { useDialog } from '../../../hooks/use-dialog'
import { ApiGetCall } from '../../../api/ApiCall'
import { useSettings } from '../../../hooks/use-settings'
import {
  Alert,
  Button,
  Chip,
  Container,
  Divider,
  Link,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import {
  CloudArrowDownIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LinkIcon,
  LinkSlashIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'

const classificationChipColor = (classification) => {
  switch (String(classification).toLowerCase()) {
    case 'anonymous':
      return 'error'
    case 'external':
      return 'warning'
    case 'internal':
      return 'success'
    default:
      return 'default'
  }
}

// Row detail shown when a sharing link row is clicked.
const SharingLinkDetail = ({ row }) => {
  if (!row) return null

  const properties = [
    { label: 'Site', value: row.siteName },
    { label: 'Library', value: row.driveName },
    { label: 'Workload', value: row.workload },
    { label: 'Type', value: row.itemType },
    { label: 'Link Scope', value: row.linkScope },
    { label: 'Link Type', value: row.linkType },
    { label: 'Permission', value: Array.isArray(row.roles) ? row.roles.join(', ') : row.roles },
    { label: 'Password Protected', value: row.hasPassword ? 'Yes' : 'No' },
    {
      label: 'Expires',
      value: row.expirationDateTime ? new Date(row.expirationDateTime).toLocaleString() : 'Never',
    },
    {
      label: 'Last Modified',
      value: row.lastModifiedDateTime ? new Date(row.lastModifiedDateTime).toLocaleString() : '',
    },
  ]

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="h6">{row.fileName}</Typography>
        <Chip
          size="small"
          variant="outlined"
          label={row.classification}
          color={classificationChipColor(row.classification)}
        />
        <Chip size="small" variant="outlined" label={row.workload} />
      </Stack>
      <Divider />
      <Grid container spacing={2}>
        {properties
          .filter((prop) => prop.value !== undefined && prop.value !== null && prop.value !== '')
          .map((prop) => (
            <Grid size={{ md: 4, xs: 6 }} key={prop.label}>
              <Typography variant="subtitle2" color="text.secondary">
                {prop.label}
              </Typography>
              <Typography variant="body2">{String(prop.value)}</Typography>
            </Grid>
          ))}
      </Grid>
      {Array.isArray(row.sharedWith) && row.sharedWith.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">
            Shared With
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {row.sharedWith.map((recipient) => (
              <Chip key={recipient} size="small" variant="outlined" label={recipient} />
            ))}
          </Stack>
        </>
      )}
      <Divider />
      <Stack spacing={1}>
        {row.itemUrl && (
          <Typography variant="body2">
            File:{' '}
            <Link href={row.itemUrl} target="_blank" rel="noreferrer">
              {row.itemUrl}
            </Link>
          </Typography>
        )}
        {row.linkUrl && (
          <Typography variant="body2">
            Sharing link:{' '}
            <Link href={row.linkUrl} target="_blank" rel="noreferrer">
              {row.linkUrl}
            </Link>
          </Typography>
        )}
      </Stack>
    </Stack>
  )
}

// Datasets in the CIPP reporting database this report is compiled from. Site and library
// permissions are a separate access path with their own cache and report page.
const syncRows = [
  { Name: 'SharePointSharingLinks' },
  { Name: 'SharePointSiteUsage' },
  { Name: 'OneDriveUsage' },
]

// Stable empty fallback: CippDataTable syncs its `data` prop by reference, so a fresh [] on every
// render would re-trigger that sync in a loop.
const EMPTY_ROWS = []

const Page = () => {
  const currentTenant = useSettings().currentTenant
  const syncDialog = useDialog()
  // Each sync starts one queue per cache and returns its id in the response metadata, so the
  // ids are collected as the four responses arrive and handed to the tracker.
  const [syncQueueIds, setSyncQueueIds] = useState([])
  const newSyncRunRef = useRef(false)
  const queryKey = `ListSharePointSharing-${currentTenant}`

  const sharing = ApiGetCall({
    url: '/api/ListSharePointSharing',
    data: { tenantFilter: currentTenant },
    queryKey: queryKey,
    waiting: !!currentTenant && currentTenant !== 'AllTenants',
  })

  const data = sharing.data ?? {}
  const summary = data.summary ?? {}
  const byScope = data.byScope ?? []
  const byLinkType = data.byLinkType ?? []
  const topSites = data.topSites ?? []
  const topLibraries = data.topLibraries ?? []
  const topRecipients = data.topRecipients ?? []
  const needsSync = sharing.isSuccess && !summary.linksSynced
  const showLinkCharts = sharing.isFetching || byScope.length > 0

  const linkActions = [
    {
      label: 'Revoke Sharing Link',
      type: 'POST',
      url: '/api/ExecRemoveSharingLink',
      icon: (
        <SvgIcon fontSize="small">
          <LinkSlashIcon />
        </SvgIcon>
      ),
      data: {
        DriveId: 'driveId',
        ItemId: 'itemId',
        PermissionId: 'permissionId',
        FileName: 'fileName',
        CacheId: 'id',
      },
      confirmText:
        'Revoke this sharing link for [fileName]? Anyone using this link will lose access to the item.',
      color: 'error',
      relatedQueryKeys: [queryKey],
      multiPost: false,
    },
    {
      label: 'Open File',
      link: '[itemUrl]',
      external: true,
      target: '_blank',
      icon: (
        <SvgIcon fontSize="small">
          <DocumentTextIcon />
        </SvgIcon>
      ),
      multiPost: false,
    },
  ]

  const linkFilters = [
    {
      filterName: 'Anonymous',
      value: [{ id: 'classification', value: 'Anonymous' }],
      type: 'column',
    },
    {
      // Anyone with the link can change the content: the combination worth acting on first.
      filterName: 'Anonymous + Editable',
      value: [
        { id: 'classification', value: 'Anonymous' },
        { id: 'roles', value: 'write' },
      ],
      type: 'column',
    },
    {
      // A share on a folder carries everything below it, so one link can expose a whole tree.
      filterName: 'Folder Shares',
      value: [{ id: 'itemType', value: 'Folder' }],
      type: 'column',
    },
    {
      filterName: 'External',
      value: [{ id: 'classification', value: 'External' }],
      type: 'column',
    },
    {
      filterName: 'Internal',
      value: [{ id: 'classification', value: 'Internal' }],
      type: 'column',
    },
    {
      filterName: 'SharePoint',
      value: [{ id: 'workload', value: 'SharePoint' }],
      type: 'column',
    },
    {
      filterName: 'OneDrive',
      value: [{ id: 'workload', value: 'OneDrive' }],
      type: 'column',
    },
  ]

  const linkDetailOffCanvas = {
    size: 'lg',
    children: (row) => <SharingLinkDetail row={row} />,
  }

  return (
    <Container maxWidth={false} sx={{ flexGrow: 1, py: 2 }}>
      <Grid container spacing={2}>
        {currentTenant === 'AllTenants' ? (
          <Grid size={{ md: 4, xs: 12 }}>
            <CippImageCard
              title="Not supported"
              imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
              text="The SharePoint & OneDrive Sharing report requires a single tenant. Please select a tenant from the dropdown above."
            />
          </Grid>
        ) : (
          <>
            <Grid size={{ md: 12, xs: 12 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {summary.lastDataRefresh
                    ? `Last data refresh: ${new Date(summary.lastDataRefresh.UtcDateTime).toLocaleString()}`
                    : ''}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CippQueryRefreshButton
                    queryKeys={[queryKey, `${queryKey}-table`]}
                    isFetching={sharing.isFetching}
                  />
                  <CippMultiQueueTracker
                    queueIds={syncQueueIds}
                    relatedQueryKeys={[queryKey]}
                    label="Sharing sync"
                  />
                  <SharingReportButton sharingData={data} tenantName={currentTenant} />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      newSyncRunRef.current = true
                      syncDialog.handleOpen()
                    }}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <CloudArrowDownIcon />
                      </SvgIcon>
                    }
                  >
                    Sync data
                  </Button>
                </Stack>
              </Stack>
              {needsSync && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  No cached sharing data found for this tenant yet. Click "Sync data" to scan the
                  tenant's SharePoint sites and OneDrive accounts for sharing links; the report
                  populates once the sync completes.
                </Alert>
              )}
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippInfoBar
                isFetching={sharing.isFetching}
                data={[
                  {
                    icon: <LinkIcon />,
                    name: 'Sharing Links',
                    data: `${summary.totalLinks ?? 0}`,
                  },
                  {
                    icon: <GlobeAltIcon />,
                    name: 'Anonymous Links',
                    data: `${summary.anonymousLinks ?? 0}`,
                    color: 'error',
                  },
                  {
                    icon: <UserPlusIcon />,
                    name: 'External Links & Shares',
                    data: `${summary.externalLinks ?? 0}`,
                    color: 'warning',
                  },
                  {
                    icon: <ShieldCheckIcon />,
                    name: 'Internal Links',
                    data: `${summary.internalLinks ?? 0}`,
                    color: 'success',
                  },
                ]}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippPropertyListCard
                title="Sharing Risk Highlights"
                isFetching={sharing.isFetching}
                showDivider={false}
                propertyItems={[
                  { label: 'Anonymous & Editable', value: `${summary.anonymousEditLinks ?? 0}` },
                  {
                    label: 'Anonymous, No Expiry',
                    value: `${summary.neverExpiringAnonymous ?? 0}`,
                  },
                  { label: 'Shared Folders', value: `${summary.folderShares ?? 0}` },
                  { label: 'External Recipients', value: `${summary.externalRecipients ?? 0}` },
                ]}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippPropertyListCard
                title="Environment"
                isFetching={sharing.isFetching}
                showDivider={false}
                propertyItems={[
                  { label: 'SharePoint Sites', value: `${summary.sharePointSites ?? 0}` },
                  { label: 'Teams-Connected Sites', value: `${summary.teamsSites ?? 0}` },
                  { label: 'OneDrive Accounts', value: `${summary.oneDriveAccounts ?? 0}` },
                  { label: 'Shared Items', value: `${summary.itemsShared ?? 0}` },
                ]}
              />
            </Grid>

            {showLinkCharts && (
              <>
                <Grid size={{ md: 4, xs: 12 }}>
                  <CippChartCard
                    title="Links by Classification"
                    isFetching={sharing.isFetching}
                    chartType="donut"
                    labels={byScope.map((item) => item.scope)}
                    chartSeries={byScope.map((item) => item.links)}
                    totalLabel="Links"
                  />
                </Grid>
                <Grid size={{ md: 4, xs: 12 }}>
                  <CippChartCard
                    title="Top Sites by Sharing Links"
                    isFetching={sharing.isFetching}
                    chartType="bar"
                    labels={topSites.map((item) => item.site)}
                    chartSeries={topSites.map((item) => item.links)}
                    totalLabel="Links"
                  />
                </Grid>
                <Grid size={{ md: 4, xs: 12 }}>
                  <CippChartCard
                    title="Links by Type"
                    isFetching={sharing.isFetching}
                    chartType="pie"
                    labels={byLinkType.map((item) => item.type)}
                    chartSeries={byLinkType.map((item) => item.links)}
                    totalLabel="Links"
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <CippChartCard
                    title="Top Libraries by Sharing Links"
                    isFetching={sharing.isFetching}
                    chartType="bar"
                    labels={topLibraries.map((item) => item.library)}
                    chartSeries={topLibraries.map((item) => item.links)}
                    totalLabel="Links"
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <CippChartCard
                    title="Top External Recipients"
                    isFetching={sharing.isFetching}
                    chartType="bar"
                    labels={topRecipients.map((item) => item.recipient)}
                    chartSeries={topRecipients.map((item) => item.links)}
                    totalLabel="Shares"
                  />
                </Grid>
              </>
            )}

            {(sharing.isFetching || summary.usageSynced) && (
              <>
                <Grid size={{ md: 6, xs: 12 }}>
                  <CippChartCard
                    title="Storage Used (GB) by Workload"
                    isFetching={sharing.isFetching}
                    chartType="bar"
                    labels={['SharePoint', 'Teams', 'OneDrive']}
                    chartSeries={[
                      summary.sharePointStorageUsedGB ?? 0,
                      summary.teamsStorageUsedGB ?? 0,
                      summary.oneDriveStorageUsedGB ?? 0,
                    ]}
                    totalLabel="GB"
                  />
                </Grid>
                <Grid size={{ md: 6, xs: 12 }}>
                  <CippChartCard
                    title="Files by Workload"
                    isFetching={sharing.isFetching}
                    chartType="bar"
                    labels={['SharePoint', 'Teams', 'OneDrive']}
                    chartSeries={[
                      summary.sharePointFiles ?? 0,
                      summary.teamsFiles ?? 0,
                      summary.oneDriveFiles ?? 0,
                    ]}
                    totalLabel="Files"
                  />
                </Grid>
              </>
            )}

            <Grid size={{ md: 12, xs: 12 }}>
              <CippDataTable
                title="Sharing Links & External Shares"
                queryKey={`${queryKey}-table`}
                isFetching={sharing.isFetching}
                data={data.links ?? EMPTY_ROWS}
                refreshFunction={sharing}
                actions={linkActions}
                filters={linkFilters}
                offCanvas={linkDetailOffCanvas}
                offCanvasOnRowClick={true}
                simpleColumns={[
                  'fileName',
                  'itemType',
                  'workload',
                  'siteName',
                  'driveName',
                  'classification',
                  'linkType',
                  'linkScope',
                  'roles',
                  'sharedWith',
                  'hasPassword',
                  'expirationDateTime',
                  'lastModifiedDateTime',
                ]}
              />
            </Grid>

            <CippApiDialog
              createDialog={syncDialog}
              title="Sync sharing data"
              api={{
                type: 'GET',
                url: '/api/ExecCIPPDBCache',
                data: { Name: 'Name' },
                confirmText:
                  'Queue a refresh of the cached sharing links and SharePoint/OneDrive usage data for this tenant? Scanning every drive for sharing links can take a while on large tenants. Progress is shown next to the Sync button and the report refreshes itself once the syncs finish.',
                relatedQueryKeys: [queryKey],
                // One response per cache, each carrying the queue it started, so the ids arrive
                // one at a time and accumulate. The first response of a new run replaces the
                // previous run's ids instead of stacking on them — the flag is only cleared once
                // a sync actually starts, so cancelling the dialog leaves a running tracker alone.
                onSuccess: (result) => {
                  const queueId = result?.Metadata?.QueueId
                  if (!queueId) return
                  if (newSyncRunRef.current) {
                    newSyncRunRef.current = false
                    setSyncQueueIds([queueId])
                    return
                  }
                  setSyncQueueIds((previous) =>
                    previous.includes(queueId) ? previous : [...previous, queueId]
                  )
                },
              }}
              row={syncRows}
            />
          </>
        )}
      </Grid>
    </Container>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
