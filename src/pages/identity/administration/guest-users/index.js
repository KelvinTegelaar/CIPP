import { useMemo, useState } from 'react'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { ApiGetCallWithPagination } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import {
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Box, Grid } from '@mui/system'
import { EyeIcon } from '@heroicons/react/24/outline'
import {
  Block,
  CheckCircle,
  GroupOutlined,
  HourglassEmpty,
  PersonOff,
  Send,
  WarningAmber,
} from '@mui/icons-material'

const GUEST_STATUSES = [
  { status: 'Active', color: 'success', icon: CheckCircle },
  { status: 'Stale', color: 'error', icon: WarningAmber },
  { status: 'Pending Acceptance', color: 'warning', icon: HourglassEmpty },
  { status: 'Never Signed In', color: 'info', icon: PersonOff },
  { status: 'Disabled', color: 'secondary', icon: Block },
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
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Icon color={color} sx={{ fontSize: 28 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {isFetching ? <Skeleton width={30} /> : count}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: 'block' }}
            >
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

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListGuestUsers',
    queryKey: 'ListGuestUsers',
    cacheName: 'Guests',
    syncTitle: 'Sync Guest Users',
    allowToggle: true,
    defaultCached: true,
    allowAllTenantSync: true,
    cacheColumns: ['CacheTimestamp'],
  })

  // Same url/data/queryKey as the table below, so react-query shares one request
  // between the summary cards and the table.
  const guestData = ApiGetCallWithPagination({
    url: reportDB.resolvedApiUrl,
    data: { tenantFilter: currentTenant },
    queryKey: reportDB.resolvedQueryKey,
    waiting: true,
  })

  const guests = useMemo(
    () =>
      guestData.data?.pages?.flatMap((page) =>
        Array.isArray(page) ? page : []
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
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <SummaryCard
          title="Total Guests"
          count={guests.length}
          icon={GroupOutlined}
          color="primary"
          selected={statusFilter === null}
          isFetching={guestData.isFetching}
          onClick={() => setStatusFilter(null)}
        />
      </Grid>
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
      link: '/identity/administration/users/user?userId=[id]',
      multiPost: false,
      icon: <EyeIcon />,
      color: 'success',
    },
    {
      label: 'Re-invite Guest',
      type: 'POST',
      icon: <Send />,
      url: '/api/AddGuest',
      data: { displayName: 'displayName', mail: 'mail', sendInvite: '!true' },
      confirmText: 'Are you sure you want to re-send the invitation to [mail]?',
      multiPost: false,
      condition: (row) =>
        !!row.mail &&
        (row.status === 'Pending Acceptance' || row.status === 'Stale'),
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
        queryKey={reportDB.resolvedQueryKey}
        dataSourceControls={reportDB.controls}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={filterList}
      />
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>
)

export default Page
