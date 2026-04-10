import { Layout as DashboardLayout } from '../../../../../layouts/index.js'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall, ApiPostCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon'
import { Fingerprint, Launch, Apps, Group, CheckCircle, Warning, Badge } from '@mui/icons-material'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import tabOptions from './tabOptions'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { Box, Stack } from '@mui/system'
import { Grid } from '@mui/system'
import { Typography, Card, CardHeader, Divider, Button, SvgIcon } from '@mui/material'
import { CippBannerListCard } from '../../../../../components/CippCards/CippBannerListCard'
import { CippTimeAgo } from '../../../../../components/CippComponents/CippTimeAgo'
import { useEffect, useMemo, useState } from 'react'
import { PropertyList } from '../../../../../components/property-list'
import { PropertyListItem } from '../../../../../components/property-list-item'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { EyeIcon } from '@heroicons/react/24/outline'
import { usePermissions } from '../../../../../hooks/use-permissions.js'
import { getEnterpriseAppDetailHeaderActions } from '../../../../../components/CippComponents/EnterpriseAppActions.jsx'
import Link from 'next/link'
import { getListGraphBulkRequestRows } from '../../../../../utils/getListGraphBulkRequestRows.js'
import { CippCredentialExpandList } from '../../../../../components/CippComponents/CippCredentialExpandList.jsx'

const spSelect =
  'id,appId,displayName,createdDateTime,accountEnabled,homepage,publisherName,signInAudience,replyUrls,verifiedPublisher,info,api,appOwnerOrganizationId,tags,passwordCredentials,keyCredentials'

const getLatestCredentialExpiry = (credentials = []) => {
  if (!Array.isArray(credentials) || credentials.length === 0) return 'N/A'
  const validDates = credentials
    .map((cred) => cred?.endDateTime)
    .filter(Boolean)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  return validDates.length > 0 ? new Date(validDates[0]).toLocaleString() : 'N/A'
}

const Page = () => {
  const userSettingsDefaults = useSettings()
  const { checkPermissions } = usePermissions()
  const canWriteApplication = checkPermissions(['Tenant.Application.ReadWrite'])
  const router = useRouter()
  const rawSpId = router.query.spId
  const spObjectId = Array.isArray(rawSpId) ? rawSpId[0] : rawSpId
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    if (spObjectId) {
      setWaiting(true)
    }
  }, [spObjectId])

  const spRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: spObjectId ? `servicePrincipals/${spObjectId}` : 'servicePrincipals',
      $select: spSelect,
      tenantFilter: router.query.tenantFilter ?? userSettingsDefaults.currentTenant,
    },
    queryKey: `EnterpriseApp-spId-${spObjectId}`,
    waiting: waiting,
  })

  let spData = null
  if (spRequest.isSuccess && spRequest.data) {
    if (Array.isArray(spRequest.data.Results)) {
      spData = spRequest.data.Results[0]
    } else if (spRequest.data.Results) {
      spData = spRequest.data.Results
    } else {
      spData = spRequest.data
    }
  }

  const spBulkRequest = ApiPostCall({
    urlFromData: true,
  })

  function refreshFunction() {
    if (!spObjectId) return
    spBulkRequest.mutate({
      url: '/api/ListGraphBulkRequest',
      data: {
        tenantFilter: userSettingsDefaults.currentTenant,
        Requests: [
          {
            id: 'owners',
            url: `/servicePrincipals/${spObjectId}/owners`,
            method: 'GET',
          },
        ],
      },
    })
  }

  useEffect(() => {
    if (
      spObjectId &&
      userSettingsDefaults.currentTenant &&
      spRequest.isSuccess &&
      spData?.id &&
      !spBulkRequest.isSuccess
    ) {
      refreshFunction()
    }
  }, [
    spObjectId,
    userSettingsDefaults.currentTenant,
    spRequest.isSuccess,
    spData?.id,
    spBulkRequest.isSuccess,
  ])

  const bulkData = getListGraphBulkRequestRows(spBulkRequest)
  const ownersData = bulkData.find((item) => item.id === 'owners')
  const owners = ownersData?.body?.value ?? []

  const title = !spRequest.isSuccess
    ? 'Loading...'
    : spData?.displayName || spData?.appId || spObjectId || 'Enterprise application'

  const data = spData

  const subtitle =
    spRequest.isSuccess && spData
      ? [
          {
            icon: <Badge />,
            text: <CippCopyToClipBoard type="chip" text={spData?.appId || 'N/A'} />,
          },
          {
            icon: <Fingerprint />,
            text: <CippCopyToClipBoard type="chip" text={spData?.id || 'N/A'} />,
          },
          {
            icon: <CalendarIcon />,
            text: (
              <>
                Created: <CippTimeAgo data={spData?.createdDateTime} />
              </>
            ),
          },
          {
            icon: <Launch style={{ color: '#667085' }} />,
            text: (
              <Button
                color="muted"
                style={{ paddingLeft: 0 }}
                size="small"
                href={`https://entra.microsoft.com/${userSettingsDefaults.currentTenant}/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Overview/objectId/${spData?.id}/appId/${spData?.appId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View in Entra
              </Button>
            ),
          },
        ]
      : []

  const appActions = useMemo(
    () => getEnterpriseAppDetailHeaderActions(canWriteApplication),
    [canWriteApplication]
  )

  const actionsData = useMemo(() => {
    if (!spData) {
      return undefined
    }
    const tenant = router.query.tenantFilter ?? userSettingsDefaults.currentTenant
    return { ...spData, Tenant: tenant }
  }, [spData, router.query.tenantFilter, userSettingsDefaults.currentTenant])

  const ownersItems =
    owners.length > 0
      ? [
          {
            id: 1,
            cardLabelBox: {
              cardLabelBoxHeader: <Group />,
            },
            text: 'Owners',
            subtext: 'Directory objects that own this service principal',
            statusText: `${owners.length} Owner(s)`,
            statusColor: 'info.main',
            table: {
              title: 'Owners',
              hideTitle: true,
              data: owners,
              refreshFunction: refreshFunction,
              simpleColumns: ['displayName', 'userPrincipalName', 'mail', '@odata.type'],
              actions: [
                {
                  icon: <EyeIcon />,
                  label: 'View User',
                  link: `/identity/administration/users/user?userId=[id]&tenantFilter=${userSettingsDefaults.currentTenant}`,
                  condition: (row) => row?.['@odata.type'] === '#microsoft.graph.user',
                },
              ],
            },
          },
        ]
      : ownersData != null && typeof ownersData.status === 'number' && ownersData.status !== 200
        ? [
            {
              id: 1,
              cardLabelBox: '!',
              text: 'Error loading owners',
              subtext: ownersData?.body?.error?.message || 'Unknown error',
              statusColor: 'error.main',
              statusText: 'Error',
              propertyItems: [],
            },
          ]
        : [
            {
              id: 1,
              cardLabelBox: '-',
              text: 'No owners',
              subtext: 'No owners were returned for this enterprise application.',
              statusColor: 'warning.main',
              statusText: 'No Owners',
              propertyItems: [],
            },
          ]

  const tenantForApi = router.query.tenantFilter ?? userSettingsDefaults.currentTenant

  const credentialsItems = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: data?.passwordCredentials?.length > 0 ? <CheckCircle /> : <Warning />,
      },
      text: 'Password Credentials',
      subtext: `${data?.passwordCredentials?.length || 0} secret(s)`,
      statusColor: data?.passwordCredentials?.length > 0 ? 'info.main' : 'warning.main',
      statusText: data?.passwordCredentials?.length > 0 ? 'Configured' : 'None',
      propertyItems: [
        { label: 'Count', value: data?.passwordCredentials?.length || 0 },
        { label: 'Next Expiry', value: getLatestCredentialExpiry(data?.passwordCredentials) },
      ],
      children: (
        <CippCredentialExpandList
          credentials={data?.passwordCredentials || []}
          credentialType="password"
          appType="servicePrincipals"
          graphObjectId={data?.id}
          tenantFilter={tenantForApi}
          canRemove={canWriteApplication}
          onRemoved={() => spRequest.refetch()}
        />
      ),
    },
    {
      id: 2,
      cardLabelBox: {
        cardLabelBoxHeader: data?.keyCredentials?.length > 0 ? <CheckCircle /> : <Warning />,
      },
      text: 'Certificate Credentials',
      subtext: `${data?.keyCredentials?.length || 0} certificate(s)`,
      statusColor: data?.keyCredentials?.length > 0 ? 'info.main' : 'warning.main',
      statusText: data?.keyCredentials?.length > 0 ? 'Configured' : 'None',
      propertyItems: [
        { label: 'Count', value: data?.keyCredentials?.length || 0 },
        { label: 'Next Expiry', value: getLatestCredentialExpiry(data?.keyCredentials) },
      ],
      children: (
        <CippCredentialExpandList
          credentials={data?.keyCredentials || []}
          credentialType="key"
          appType="servicePrincipals"
          graphObjectId={data?.id}
          tenantFilter={tenantForApi}
          canRemove={canWriteApplication}
          onRemoved={() => spRequest.refetch()}
        />
      ),
    },
  ]

  const tenantQs = encodeURIComponent(
    router.query.tenantFilter ?? userSettingsDefaults.currentTenant
  )

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      actions={spData ? appActions : []}
      actionsData={actionsData}
      isFetching={spRequest.isLoading}
    >
      {spRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {spRequest.isSuccess && !spData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Typography color="text.secondary">
            No enterprise application found for this service principal ID.
          </Typography>
        </Box>
      )}
      {spRequest.isSuccess && spData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <CippHead title={title} />
          <Grid container spacing={2}>
            <Grid size={4}>
              <Card>
                <CardHeader title="Enterprise application" />
                <Divider />
                <PropertyList>
                  <PropertyListItem
                    divider
                    value={
                      <Stack alignItems="center" spacing={1}>
                        <SvgIcon sx={{ fontSize: 64 }}>
                          <Apps />
                        </SvgIcon>
                        <Typography variant="h6">{data?.displayName || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {data?.accountEnabled === false ? 'Disabled' : 'Enabled'}
                        </Typography>
                      </Stack>
                    }
                  />
                  <PropertyListItem
                    divider
                    label="Details"
                    value={
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Display name:
                          </Typography>
                          <Typography variant="inherit">{data?.displayName || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Application (client) ID:
                          </Typography>
                          <Typography variant="inherit">{data?.appId || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Object ID:
                          </Typography>
                          <Typography variant="inherit">{data?.id || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Sign-in audience:
                          </Typography>
                          <Typography variant="inherit">{data?.signInAudience || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Publisher:
                          </Typography>
                          <Typography variant="inherit">{data?.publisherName || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Homepage:
                          </Typography>
                          <Typography variant="inherit">{data?.homepage || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Created:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.createdDateTime
                              ? new Date(data.createdDateTime).toLocaleString()
                              : 'N/A'}
                          </Typography>
                        </Grid>
                        {data?.appId && (
                          <Grid size={{ xs: 12 }}>
                            <Button
                              component={Link}
                              href={`/tenant/administration/applications/app-registration?appId=${data.appId}&tenantFilter=${tenantQs}`}
                              size="small"
                              variant="outlined"
                            >
                              Open app registration in CIPP
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    }
                  />
                </PropertyList>
              </Card>
            </Grid>
            <Grid size={8}>
              <Stack spacing={3}>
                <Typography variant="h6">Credentials</Typography>
                <CippBannerListCard
                  isFetching={spRequest.isLoading}
                  items={credentialsItems}
                  isCollapsible={true}
                />
                <Typography variant="h6">Owners</Typography>
                <CippBannerListCard
                  isFetching={spBulkRequest.isPending}
                  items={ownersItems}
                  isCollapsible={true}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
