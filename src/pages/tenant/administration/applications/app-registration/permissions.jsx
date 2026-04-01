import { Layout as DashboardLayout } from '../../../../../layouts/index.js'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon'
import { Fingerprint, Launch, Badge } from '@mui/icons-material'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import tabOptions from './tabOptions'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { Box } from '@mui/system'
import { Typography, Button } from '@mui/material'
import { CippTimeAgo } from '../../../../../components/CippComponents/CippTimeAgo'
import { useEffect, useMemo, useState } from 'react'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import CippAppRegistrationPermissions from '../../../../../components/CippComponents/CippAppRegistrationPermissions'
import { usePermissions } from '../../../../../hooks/use-permissions.js'
import { getAppRegistrationDetailHeaderActions } from '../../../../../components/CippComponents/AppRegistrationActions.jsx'

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
    queryKey: `Application-appId-${applicationClientId}-permissions`,
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

  const title = !appRequest.isSuccess
    ? 'Loading...'
    : appData?.displayName || appData?.appId || applicationClientId || 'Application registration'

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

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      actions={appData ? appActions : []}
      actionsData={actionsData}
      isFetching={appRequest.isLoading}
    >
      {appRequest.isLoading && <CippFormSkeleton layout={[1, 1, 1]} />}
      {appRequest.isSuccess && !appData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Typography color="text.secondary">
            No application registration found for this Application (client) ID.
          </Typography>
        </Box>
      )}
      {appRequest.isSuccess && appData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <CippHead title={`${title} — API permissions`} />
          <CippAppRegistrationPermissions requiredResourceAccess={appData.requiredResourceAccess} />
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
