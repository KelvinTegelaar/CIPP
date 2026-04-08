import { Layout as DashboardLayout } from '../../../../../layouts/index.js'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall, ApiPostCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon'
import {
  Fingerprint,
  Launch,
  Security,
  Group,
  CheckCircle,
  Warning,
  Badge,
} from '@mui/icons-material'
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
import CippPermissionPreview from '../../../../../components/CippComponents/CippPermissionPreview.jsx'
import { EyeIcon } from '@heroicons/react/24/outline'
import { usePermissions } from '../../../../../hooks/use-permissions.js'
import { getAppRegistrationDetailHeaderActions } from '../../../../../components/CippComponents/AppRegistrationActions.jsx'
import { getListGraphBulkRequestRows } from '../../../../../utils/getListGraphBulkRequestRows.js'
import { CippCredentialExpandList } from '../../../../../components/CippComponents/CippCredentialExpandList.jsx'

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
  const rawAppId = router.query.appId
  const applicationClientId = Array.isArray(rawAppId) ? rawAppId[0] : rawAppId
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    if (applicationClientId) {
      setWaiting(true)
    }
  }, [applicationClientId])

  const appRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: applicationClientId
        ? `applications(appId='${applicationClientId}')`
        : 'applications',
      tenantFilter: router.query.tenantFilter ?? userSettingsDefaults.currentTenant,
    },
    queryKey: `Application-appId-${applicationClientId}`,
    waiting: waiting,
  })

  let appData = null
  if (appRequest.isSuccess && appRequest.data) {
    if (Array.isArray(appRequest.data.Results)) {
      appData = appRequest.data.Results[0]
    } else if (appRequest.data.Results) {
      appData = appRequest.data.Results
    } else {
      appData = appRequest.data
    }
  }

  const appBulkRequest = ApiPostCall({
    urlFromData: true,
  })

  function refreshFunction() {
    if (!applicationClientId || !appData?.id) return
    const requests = [
      {
        id: 'owners',
        url: `/applications/${appData.id}/owners`,
        method: 'GET',
      },
      {
        id: 'servicePrincipals',
        url: `/servicePrincipals?$filter=appId eq '${applicationClientId}'`,
        method: 'GET',
      },
    ]

    appBulkRequest.mutate({
      url: '/api/ListGraphBulkRequest',
      data: {
        Requests: requests,
        tenantFilter: userSettingsDefaults.currentTenant,
      },
    })
  }

  useEffect(() => {
    if (
      applicationClientId &&
      userSettingsDefaults.currentTenant &&
      appRequest.isSuccess &&
      appData?.id &&
      !appBulkRequest.isSuccess
    ) {
      refreshFunction()
    }
  }, [
    applicationClientId,
    userSettingsDefaults.currentTenant,
    appRequest.isSuccess,
    appData?.id,
    appBulkRequest.isSuccess,
  ])

  const bulkData = getListGraphBulkRequestRows(appBulkRequest)
  const ownersData = bulkData.find((item) => item.id === 'owners')
  const servicePrincipalsData = bulkData.find((item) => item.id === 'servicePrincipals')

  const owners = ownersData?.body?.value ?? []
  const servicePrincipals = servicePrincipalsData?.body?.value ?? []

  const title = !appRequest.isSuccess
    ? 'Loading...'
    : appData?.displayName || appData?.appId || applicationClientId || 'Application registration'
  const data = appData

  const subtitle =
    appRequest.isSuccess && appData
      ? [
          {
            icon: <Badge />,
            text: <CippCopyToClipBoard type="chip" text={appData?.appId || 'N/A'} />,
          },
          {
            icon: <Fingerprint />,
            text: <CippCopyToClipBoard type="chip" text={appData?.id || 'N/A'} />,
          },
          {
            icon: <CalendarIcon />,
            text: (
              <>
                Created: <CippTimeAgo data={appData?.createdDateTime} />
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
                href={`https://entra.microsoft.com/${userSettingsDefaults.currentTenant}/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/${appData?.appId}/isMSAApp/`}
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
    () => getAppRegistrationDetailHeaderActions(canWriteApplication),
    [canWriteApplication]
  )

  const actionsData = useMemo(() => {
    if (!appData) {
      return undefined
    }
    const tenant = router.query.tenantFilter ?? userSettingsDefaults.currentTenant
    return { ...appData, Tenant: tenant }
  }, [appData, router.query.tenantFilter, userSettingsDefaults.currentTenant])

  const ownersItems =
    owners.length > 0
      ? [
          {
            id: 1,
            cardLabelBox: {
              cardLabelBoxHeader: <Group />,
            },
            text: 'Owners',
            subtext: 'List of application owners',
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
              subtext: 'This application has no configured owners.',
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
        {
          label: 'Count',
          value: data?.passwordCredentials?.length || 0,
        },
        {
          label: 'Next Expiry',
          value: getLatestCredentialExpiry(data?.passwordCredentials),
        },
      ],
      children: (
        <CippCredentialExpandList
          credentials={data?.passwordCredentials || []}
          credentialType="password"
          appType="applications"
          graphObjectId={data?.id}
          tenantFilter={tenantForApi}
          canRemove={canWriteApplication}
          onRemoved={() => appRequest.refetch()}
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
        {
          label: 'Count',
          value: data?.keyCredentials?.length || 0,
        },
        {
          label: 'Next Expiry',
          value: getLatestCredentialExpiry(data?.keyCredentials),
        },
      ],
      children: (
        <CippCredentialExpandList
          credentials={data?.keyCredentials || []}
          credentialType="key"
          appType="applications"
          graphObjectId={data?.id}
          tenantFilter={tenantForApi}
          canRemove={canWriteApplication}
          onRemoved={() => appRequest.refetch()}
        />
      ),
    },
  ]

  const enterpriseAppItems =
    servicePrincipals.length > 0
      ? [
          {
            id: 1,
            cardLabelBox: {
              cardLabelBoxHeader: <CheckCircle />,
            },
            text: 'Enterprise App',
            subtext: 'Related service principal(s) for this app registration',
            statusText: `${servicePrincipals.length} Found`,
            statusColor: 'info.main',
            table: {
              title: 'Service Principals',
              hideTitle: true,
              data: servicePrincipals,
              refreshFunction: refreshFunction,
              simpleColumns: [
                'displayName',
                'id',
                'appOwnerOrganizationId',
                'servicePrincipalType',
              ],
            },
          },
        ]
      : servicePrincipalsData != null &&
          typeof servicePrincipalsData.status === 'number' &&
          servicePrincipalsData.status !== 200
        ? [
            {
              id: 1,
              cardLabelBox: '!',
              text: 'Error loading enterprise app data',
              subtext: servicePrincipalsData?.body?.error?.message || 'Unknown error',
              statusColor: 'error.main',
              statusText: 'Error',
              propertyItems: [],
            },
          ]
        : [
            {
              id: 1,
              cardLabelBox: '-',
              text: 'No enterprise app found',
              subtext:
                'No service principal exists yet for this application in the current tenant.',
              statusColor: 'warning.main',
              statusText: 'Not Found',
              propertyItems: [],
            },
          ]

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      actions={appData ? appActions : []}
      actionsData={actionsData}
      isFetching={appRequest.isLoading}
    >
      {appRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {appRequest.isSuccess && !appData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Typography color="text.secondary">
            No application registration found for this Application (client) ID.
          </Typography>
        </Box>
      )}
      {appRequest.isSuccess && appData && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <CippHead title={title} />
          <Grid container spacing={2}>
            <Grid size={4}>
              <Card>
                <CardHeader title="Application Details" />
                <Divider />
                <PropertyList>
                  <PropertyListItem
                    divider
                    value={
                      <Stack alignItems="center" spacing={1}>
                        <SvgIcon sx={{ fontSize: 64 }}>
                          <Security />
                        </SvgIcon>
                        <Typography variant="h6">{data?.displayName || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {data?.signInAudience || 'N/A'}
                        </Typography>
                      </Stack>
                    }
                  />
                  <PropertyListItem
                    divider
                    label="Configuration"
                    value={
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Display Name:
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
                            Sign-in Audience:
                          </Typography>
                          <Typography variant="inherit">{data?.signInAudience || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Publisher Domain:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.publisherDomain || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Disabled by Microsoft:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.disabledByMicrosoftStatus || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Created Date:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.createdDateTime
                              ? new Date(data.createdDateTime).toLocaleString()
                              : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Redirect URI Count:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.web?.redirectUris?.length || 0}
                          </Typography>
                        </Grid>
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
                  isFetching={appRequest.isLoading}
                  items={credentialsItems}
                  isCollapsible={true}
                />
                <Typography variant="h6">Owners</Typography>
                <CippBannerListCard
                  isFetching={appBulkRequest.isPending}
                  items={ownersItems}
                  isCollapsible={true}
                />
                <Typography variant="h6">Enterprise App</Typography>
                <CippBannerListCard
                  isFetching={appBulkRequest.isPending}
                  items={enterpriseAppItems}
                  isCollapsible={true}
                />
                <Typography variant="h6">Application Manifest</Typography>
                <CippPermissionPreview
                  applicationManifest={data}
                  title="Application Manifest"
                  maxHeight="800px"
                  showAppIds={true}
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
