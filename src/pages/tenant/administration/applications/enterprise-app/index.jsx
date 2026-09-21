import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall, ApiPostCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippEnterpriseAppSwitcher } from '../../../../../components/CippComponents/CippEnterpriseAppSwitcher'
import tabOptions from './tabOptions'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { Box, Stack } from '@mui/system'
import { Grid } from '@mui/system'
import { Typography, Card, CardHeader, Divider, Button, SvgIcon, Alert } from '@mui/material'
import { CippBannerListCard } from '../../../../../components/CippCards/CippBannerListCard'
import { CippTimeAgo } from '../../../../../components/CippComponents/CippTimeAgo'
import { useEffect, useMemo, useState, useRef } from 'react'
import { PropertyList } from '../../../../../components/property-list'
import { PropertyListItem } from '../../../../../components/property-list-item'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
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
  const bulkFetchedForId = useRef(null)

  function refreshFunction() {
    if (!spObjectId) return
    bulkFetchedForId.current = spObjectId
    spBulkRequest.mutate({
      url: '/api/ListGraphBulkRequest',
      data: {
        tenantFilter: router.query.tenantFilter ?? userSettingsDefaults.currentTenant,
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
      bulkFetchedForId.current !== spObjectId
    ) {
      refreshFunction()
    }
  }, [
    spObjectId,
    userSettingsDefaults.currentTenant,
    spRequest.isSuccess,
    spData?.id,
  ])

  const bulkData = getListGraphBulkRequestRows(spBulkRequest)
  const ownersData = bulkData.find((item) => item.id === 'owners')
  const owners = ownersData?.body?.value ?? []

  // Without a spId nothing is ever fetched, so falling back to the loading label here
  // would leave it stuck forever.
  const title = !spObjectId
    ? 'No Enterprise Application Selected'
    : !spRequest.isSuccess
      ? 'Loading...'
      : spData?.displayName || spData?.appId || spObjectId || 'Enterprise application'

  const data = spData

  const subtitle =
    spRequest.isSuccess && spData
      ? [
          {
            icon: <CippIcons.Badge />,
            text: <CippCopyToClipBoard type="chip" text={spData?.appId || 'N/A'} />,
          },
          {
            icon: <CippIcons.Fingerprint />,
            text: <CippCopyToClipBoard type="chip" text={spData?.id || 'N/A'} />,
          },
          {
            icon: <CippIcons.CalendarIcon />,
            text: (
              <>
                Created: <CippTimeAgo data={spData?.createdDateTime} />
              </>
            ),
          },
          {
            icon: <CippIcons.Launch />,
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
              cardLabelBoxHeader: <CippIcons.Group />,
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
                  icon: <CippIcons.EyeIcon />,
                  label: 'View User',
                  link: `/identity/administration/users/user?userId=[id]&tenantFilter=${userSettingsDefaults.currentTenant}`,
                  pinned: true,
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
        cardLabelBoxHeader: data?.passwordCredentials?.length > 0 ? <CippIcons.CheckCircle /> : <CippIcons.Warning />,
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
        cardLabelBoxHeader: data?.keyCredentials?.length > 0 ? <CippIcons.CheckCircle /> : <CippIcons.Warning />,
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
      titleControl={
        <CippEnterpriseAppSwitcher
          title={title}
          currentSpId={spObjectId}
          tenantFilter={router.query.tenantFilter ?? userSettingsDefaults.currentTenant}
        />
      }
      subtitle={subtitle}
      actions={spData ? appActions : []}
      actionsData={actionsData}
      isFetching={!!spObjectId && spRequest.isLoading}
    >
      {!spObjectId && (
        <Alert severity="info" sx={{ m: 2 }}>
          No enterprise application selected. Open this page from the Enterprise Apps list, or
          pick one from the switcher above.
        </Alert>
      )}
      {spObjectId && spRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {spRequest.isSuccess && !spData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Typography sx={{
            color: "text.secondary"
          }}>
            No enterprise application found for this service principal ID.
          </Typography>
        </Box>
      )}
      {spRequest.isSuccess && spData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <CippHead title={title} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card>
                <CardHeader title="Enterprise application" />
                <Divider />
                <PropertyList>
                  <PropertyListItem
                    divider
                    value={
                      <Stack spacing={1} sx={{
                        alignItems: "center"
                      }}>
                        <SvgIcon sx={{ fontSize: 64 }}>
                          <CippIcons.Apps />
                        </SvgIcon>
                        <Typography variant="h6">{data?.displayName || 'N/A'}</Typography>
                        <Typography variant="body2" sx={{
                          color: "text.secondary"
                        }}>
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
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Display name:
                          </Typography>
                          <Typography variant="inherit">{data?.displayName || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Application (client) ID:
                          </Typography>
                          <Typography variant="inherit">{data?.appId || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Object ID:
                          </Typography>
                          <Typography variant="inherit">{data?.id || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Sign-in audience:
                          </Typography>
                          <Typography variant="inherit">{data?.signInAudience || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Publisher:
                          </Typography>
                          <Typography variant="inherit">{data?.publisherName || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Homepage:
                          </Typography>
                          <Typography variant="inherit">{data?.homepage || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
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
            <Grid size={{ xs: 12, lg: 8 }}>
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
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
