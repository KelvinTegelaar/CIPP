import { useMemo, useState } from 'react'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { ApiGetCallWithPagination } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { usePermissions } from '../../../../hooks/use-permissions'
import {
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Box, Grid } from '@mui/system'

const GUEST_STATUSES = [
  { status: 'Active', color: 'success', icon: CippIcons.CheckCircle },
  { status: 'Stale', color: 'error', icon: CippIcons.WarningAmber },
  { status: 'Pending Acceptance', color: 'warning', icon: CippIcons.HourglassEmpty },
  { status: 'Never Signed In', color: 'info', icon: CippIcons.PersonOff },
  { status: 'Disabled', color: 'secondary', icon: CippIcons.Block },
]

const SummaryCard = ({
  title,
  count,
  icon: Icon,
  color,
  selected,
  isFetching,
  onClick,
}) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      borderColor: selected ? `${color}.main` : undefined,
      borderWidth: selected ? 2 : 1,
    }}
  >
    <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={1.5} sx={{
          alignItems: "center"
        }}>
          <Icon color={color} sx={{ fontSize: 28 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {isFetching ? <Skeleton width={30} /> : count}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: "text.secondary",
                display: 'block'
              }}>
              {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
)

const Page = () => {
  const pageTitle = 'Guest Users'
  const currentTenant = useSettings().currentTenant
  const [statusFilter, setStatusFilter] = useState(null)
  const { checkPermissions } = usePermissions()
  const canWriteUser = checkPermissions(['Identity.User.ReadWrite'])

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListGuestUsers',
    queryKey: 'ListGuestUsers',
    cacheName: 'Guests',
    syncTitle: 'Sync Guest Users',
    allowToggle: true,
    defaultCached: true,
    allowAllTenantSync: true,
    cacheColumns: ['CacheTimestamp'],
    serverPagination: true,
  })

  const tenantQuery =
    currentTenant === 'AllTenants' ? '[Tenant]' : currentTenant
  const userHubLink = `/identity/administration/users/user?userId=[id]&tenantFilter=${tenantQuery}`

  // Same url/data/queryKey as the table below, so react-query shares one request
  // between the summary cards and the table; data must match what CippTablePage builds.
  const guestData = ApiGetCallWithPagination({
    url: reportDB.resolvedApiUrl,
    data: { tenantFilter: currentTenant, ...reportDB.resolvedApiData },
    queryKey: reportDB.resolvedQueryKey,
    waiting: true,
  })

  const guests = useMemo(
    () =>
      guestData.data?.pages?.flatMap((page) =>
        // Cached reads page as { Results, Metadata }; live reads stay a bare array.
        Array.isArray(page) ? page : Array.isArray(page?.Results) ? page.Results : []
      ) ?? [],
    [guestData.data]
  )

  const statusCounts = useMemo(() => {
    const counts = {}
    for (const guest of guests) {
      counts[guest.status] = (counts[guest.status] ?? 0) + 1
    }
    return counts
  }, [guests])

  // The trailing column-format entry drives the table's status filter from the
  // summary cards; an empty value clears it again. The named presets surface the
  // same one-click filters in the table's filter menu.
  const filterList = useMemo(
    () => [
      ...GUEST_STATUSES.map(({ status }) => ({
        filterName: `${status} guests`,
        value: [{ id: 'status', value: status }],
        type: 'column',
      })),
      { id: 'status', value: statusFilter ?? '' },
    ],
    [statusFilter]
  )

  const toggleStatusFilter = (status) =>
    setStatusFilter((current) => (current === status ? null : status))

  const tableFilter = (
    <Grid container spacing={2}>
      {/* stat tiles sit two-up on phones, six stacked rows push the table below the fold. mobile-layout-ok */}
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <SummaryCard
          title="Total Guests"
          count={guests.length}
          icon={CippIcons.GroupOutlined}
          color="primary"
          selected={statusFilter === null}
          isFetching={guestData.isFetching}
          onClick={() => setStatusFilter(null)}
        />
      </Grid>
      {/* mobile-layout-ok */}
      {GUEST_STATUSES.map(({ status, color, icon }) => (
        <Grid size={{ xs: 6, sm: 4, md: 2 }} key={status}>
          <SummaryCard
            title={status}
            count={statusCounts[status] ?? 0}
            icon={icon}
            color={color}
            selected={statusFilter === status}
            isFetching={guestData.isFetching}
            onClick={() => toggleStatusFilter(status)}
          />
        </Grid>
      ))}
    </Grid>
  )

  const actions = [
    {
      label: 'View User',
      link: userHubLink,
      pinned: true,
      multiPost: false,
      icon: <CippIcons.EyeIcon />,
      color: 'success',
    },
    {
      label: 'Re-invite Guest',
      type: 'POST',
      icon: <CippIcons.Send />,
      url: '/api/AddGuest',
      data: { displayName: 'displayName', mail: 'mail', sendInvite: '!true' },
      confirmText: 'Are you sure you want to re-send the invitation to [mail]?',
      multiPost: false,
      condition: (row) =>
        !!row.mail &&
        (row.status === 'Pending Acceptance' || row.status === 'Stale'),
    },
    {
      label: 'Set Sign In State',
      type: 'POST',
      icon: <CippIcons.LockPerson />,
      url: '/api/ExecDisableUser',
      data: { ID: 'id' },
      fields: [
        {
          type: 'radio',
          name: 'Enable',
          label: 'Sign In State',
          options: [
            { label: 'Enabled', value: true },
            { label: 'Disabled', value: false },
          ],
          validators: { required: 'Please select a sign-in state' },
        },
      ],
      confirmText:
        'Are you sure you want to set the sign-in state for [userPrincipalName]?',
      multiPost: false,
      condition: () => canWriteUser,
    },
    {
      label: 'Delete Guest',
      type: 'POST',
      icon: <CippIcons.Delete />,
      url: '/api/RemoveUser',
      data: { ID: 'id', userPrincipalName: 'userPrincipalName' },
      confirmText: 'Are you sure you want to delete [userPrincipalName]?',
      multiPost: false,
      condition: () => canWriteUser,
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'displayName',
      'userPrincipalName',
      'mail',
      'id',
      'status',
      'externalUserState',
      'externalUserStateChangeDateTime',
      'createdDateTime',
      'lastSignInDateTime',
      'lastInteractiveSignInDateTime',
      'lastNonInteractiveSignInDateTime',
      'lastSuccessfulSignInDateTime',
      'daysSinceSignIn',
      'accountEnabled',
      'sourceDomain',
      'sponsors',
    ],
    actions: actions,
  }

  const simpleColumns = [
    ...reportDB.cacheColumns,
    'displayName',
    'mail',
    'sourceDomain',
    'status',
    'accountEnabled',
    'createdDateTime',
    'lastSignInDateTime',
    'daysSinceSignIn',
  ]

  return (
    <>
      <CippTablePage
        tableFilter={tableFilter}
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        queryKey={reportDB.resolvedQueryKey}
        dataSourceControls={reportDB.controls}
        actions={actions}
        offCanvas={offCanvas}
        rowOpen={{
          link: userHubLink,
          condition: (row) => Boolean(row?.id),
        }}
        simpleColumns={simpleColumns}
        filters={filterList}
        // Paged cache reads arrive in table walk order, not sorted like the unpaged report.
        defaultSorting={[{ id: 'displayName', desc: false }]}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>
)

export default Page
