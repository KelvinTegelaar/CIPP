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
import CippEnterpriseAppPermissions from '../../../../../components/CippComponents/CippEnterpriseAppPermissions'
import { usePermissions } from '../../../../../hooks/use-permissions.js'
import { getEnterpriseAppDetailHeaderActions } from '../../../../../components/CippComponents/EnterpriseAppActions.jsx'

const spSelect =
  'id,appId,displayName,createdDateTime,accountEnabled,publisherName,signInAudience,tags'

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
    queryKey: `EnterpriseApp-spId-${spObjectId}-permissions`,
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

  const title = !spRequest.isSuccess
    ? 'Loading...'
    : spData?.displayName || spData?.appId || spObjectId || 'Enterprise application'

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

  const tenantFilter = router.query.tenantFilter ?? userSettingsDefaults.currentTenant

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      actions={spData ? appActions : []}
      actionsData={actionsData}
      isFetching={spRequest.isLoading}
    >
      {spRequest.isLoading && <CippFormSkeleton layout={[1, 1, 1]} />}
      {spRequest.isSuccess && !spData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Typography color="text.secondary">
            No enterprise application found for this service principal ID.
          </Typography>
        </Box>
      )}
      {spRequest.isSuccess && spData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <CippHead title={`${title} — API permissions`} />
          <CippEnterpriseAppPermissions
            key={spObjectId}
            servicePrincipalId={spObjectId}
            tenantFilter={tenantFilter}
          />
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
