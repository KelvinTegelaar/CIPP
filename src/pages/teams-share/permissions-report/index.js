import { useRef, useState } from 'react'
import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippInfoBar } from '../../../components/CippCards/CippInfoBar'
import { CippChartCard } from '../../../components/CippCards/CippChartCard'
import { CippImageCard } from '../../../components/CippCards/CippImageCard'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import { CippApiDialog } from '../../../components/CippComponents/CippApiDialog'
import { CippMultiQueueTracker } from '../../../components/CippComponents/CippMultiQueueTracker'
import { CippQueryRefreshButton } from '../../../components/CippComponents/CippQueryRefreshButton'
import { PermissionsReportButton } from '../../../components/CippPdf/PermissionsReportButton'
import { useDialog } from '../../../hooks/use-dialog'
import { ApiGetCall } from '../../../api/ApiCall'
import { useSettings } from '../../../hooks/use-settings'
import { Alert, Button, Container, Stack, SvgIcon, Typography } from '@mui/material'
import { Grid } from '@mui/system'
import {
  BuildingOfficeIcon,
  CloudArrowDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  FolderIcon,
  GlobeAltIcon,
  KeyIcon,
  LockOpenIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'

// This report is compiled from one cache, so Sync starts a single queue.
const syncRows = [{ Name: 'SharePointPermissions' }]

// Stable empty fallback: CippDataTable syncs its `data` prop by reference, so a fresh [] on every
// render would re-trigger that sync in a loop.
const EMPTY_ROWS = []

const Page = () => {
  const currentTenant = useSettings().currentTenant
  const syncDialog = useDialog()
  const [syncQueueIds, setSyncQueueIds] = useState([])
  const newSyncRunRef = useRef(false)
  const queryKey = `ListSharePointPermissions-${currentTenant}`

  const permissions = ApiGetCall({
    url: '/api/ListSharePointPermissions',
    data: { tenantFilter: currentTenant },
    queryKey: queryKey,
    waiting: !!currentTenant && currentTenant !== 'AllTenants',
  })

  const data = permissions.data ?? {}
  const summary = data.summary ?? {}
  const assignments = data.assignments ?? EMPTY_ROWS
  const byPermissionLevel = data.byPermissionLevel ?? []
  const byPrincipalType = data.byPrincipalType ?? []
  const topSitesByUniqueLibraries = data.topSitesByUniqueLibraries ?? []
  const skippedSites = data.skippedSites ?? []
  const needsSync = permissions.isSuccess && !summary.permissionsSynced
  const showCharts = permissions.isFetching || byPermissionLevel.length > 0

  const permissionFilters = [
    {
      // Everyone / Everyone except external users / All Users: reachable by the whole tenant
      // regardless of what the site's membership says. Filters on the boolean rather than
      // broadClaim because the three claim names share no common substring.
      filterName: 'Tenant-Wide Grants',
      value: [{ id: 'isTenantWide', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'External Grants',
      value: [{ id: 'isGuest', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Full Control',
      value: [{ id: 'permissionLevel', value: 'Full Control' }],
      type: 'column',
    },
    {
      // Libraries that no longer inherit, so site-level changes no longer reach them.
      filterName: 'Detached Libraries',
      value: [{ id: 'appliesTo', value: 'This library only' }],
      type: 'column',
    },
    {
      filterName: 'Site Level',
      value: [{ id: 'appliesTo', value: 'Whole site' }],
      type: 'column',
    },
  ]

  return (
    <Container maxWidth={false} sx={{ flexGrow: 1, py: 2 }}>
      <Grid container spacing={2}>
        {currentTenant === 'AllTenants' ? (
          <Grid size={{ md: 4, xs: 12 }}>
            <CippImageCard
              title="Not supported"
              imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
              text="The SharePoint Permissions report requires a single tenant. Please select a tenant from the dropdown above."
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
                    ? `Last data refresh: ${new Date(summary.lastDataRefresh.UtcDateTime ?? summary.lastDataRefresh).toLocaleString()}`
                    : ''}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CippQueryRefreshButton
                    queryKeys={[queryKey, `${queryKey}-table`]}
                    isFetching={permissions.isFetching}
                  />
                  <CippMultiQueueTracker
                    queueIds={syncQueueIds}
                    relatedQueryKeys={[queryKey]}
                    label="Permission scan"
                  />
                  <PermissionsReportButton permissionsData={data} tenantName={currentTenant} />
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
                  No cached permission data found for this tenant yet. Click "Sync data" to read
                  site and document library permissions. This scan reads permissions per library
                  rather than per file, so it is far quicker than the sharing link scan.
                </Alert>
              )}
              {skippedSites.length > 0 && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  {skippedSites.length} site(s) could not be read during the last scan. Results from
                  an earlier successful scan are kept where they exist, so those rows may be out of
                  date; sites never read successfully contribute nothing at all.
                </Alert>
              )}
            </Grid>

            <Grid size={{ md: 12, xs: 12 }}>
              <CippInfoBar
                isFetching={permissions.isFetching}
                data={[
                  {
                    icon: <GlobeAltIcon />,
                    name: 'Tenant-Wide Grants',
                    data: `${summary.broadClaimGrants ?? 0}`,
                    color: 'error',
                  },
                  {
                    icon: <UserPlusIcon />,
                    name: 'External Grants',
                    data: `${summary.externalGrants ?? 0}`,
                    color: 'warning',
                  },
                  {
                    icon: <KeyIcon />,
                    name: 'Direct Full Control',
                    data: `${summary.directFullControlGrants ?? 0}`,
                    color: 'warning',
                  },
                  {
                    icon: <LockOpenIcon />,
                    name: 'Detached Libraries',
                    data: `${summary.uniquePermissionLibraries ?? 0}`,
                  },
                ]}
              />
            </Grid>

            <Grid size={{ md: 12, xs: 12 }}>
              <CippInfoBar
                isFetching={permissions.isFetching}
                data={[
                  {
                    icon: <BuildingOfficeIcon />,
                    name: 'Sites Scanned',
                    data: `${summary.sitesScanned ?? 0}`,
                  },
                  {
                    icon: <FolderIcon />,
                    name: 'Libraries Scanned',
                    data: `${summary.librariesScanned ?? 0}`,
                  },
                  {
                    icon: <DocumentTextIcon />,
                    name: 'Permission Assignments',
                    data: `${summary.totalAssignments ?? 0}`,
                  },
                  {
                    icon: <ExclamationTriangleIcon />,
                    name: 'Sites Not Read',
                    data: `${summary.sitesSkipped ?? 0}`,
                    color: summary.sitesSkipped > 0 ? 'warning' : undefined,
                  },
                ]}
              />
            </Grid>

            {showCharts && (
              <>
                <Grid size={{ md: 4, xs: 12 }}>
                  <CippChartCard
                    title="Permissions by Level"
                    isFetching={permissions.isFetching}
                    chartType="donut"
                    labels={byPermissionLevel.map((item) => item.level)}
                    chartSeries={byPermissionLevel.map((item) => item.grants)}
                    totalLabel="Grants"
                  />
                </Grid>
                <Grid size={{ md: 4, xs: 12 }}>
                  <CippChartCard
                    title="Permissions by Principal Type"
                    isFetching={permissions.isFetching}
                    chartType="pie"
                    labels={byPrincipalType.map((item) => item.type)}
                    chartSeries={byPrincipalType.map((item) => item.grants)}
                    totalLabel="Grants"
                  />
                </Grid>
                <Grid size={{ md: 4, xs: 12 }}>
                  <CippChartCard
                    title="Top Sites by Detached Libraries"
                    isFetching={permissions.isFetching}
                    chartType="bar"
                    labels={topSitesByUniqueLibraries.map((item) => item.site)}
                    chartSeries={topSitesByUniqueLibraries.map((item) => item.libraries)}
                    totalLabel="Libraries"
                  />
                </Grid>
              </>
            )}

            <Grid size={{ md: 12, xs: 12 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Applies To</strong> shows how far each permission reaches.{' '}
                <em>Whole site</em> is a permission on the site itself, which every library that
                still inherits also gets. <em>This library only</em> means that library was detached
                and keeps its own permissions, so site-level changes no longer reach it. Libraries
                that still inherit are not listed — their permissions are the site&apos;s, so
                everything here is either the site&apos;s own permissions or a deliberate exception
                to them.
              </Alert>
              <CippDataTable
                title="Library Permissions"
                queryKey={`${queryKey}-table`}
                isFetching={permissions.isFetching}
                data={assignments}
                refreshFunction={permissions}
                filters={permissionFilters}
                simpleColumns={[
                  'siteName',
                  'appliesTo',
                  'libraryTitle',
                  'title',
                  'principalType',
                  'permissionLevel',
                  'broadClaim',
                  'isGuest',
                  'email',
                ]}
              />
            </Grid>

            <CippApiDialog
              createDialog={syncDialog}
              title="Sync permission data"
              api={{
                type: 'GET',
                url: '/api/ExecCIPPDBCache',
                data: { Name: 'Name' },
                confirmText:
                  'Queue a refresh of the cached site and document library permissions for this tenant? Progress is shown next to the Sync button and the report refreshes itself once the scan finishes.',
                relatedQueryKeys: [queryKey],
                // The response carries the queue it started. The first response of a new run
                // replaces the previous run's ids rather than stacking on them; the flag only
                // clears once a sync actually starts, so cancelling leaves a running tracker alone.
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
