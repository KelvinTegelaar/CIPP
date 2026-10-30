import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippEnterpriseAppSwitcher } from '../../../../../components/CippComponents/CippEnterpriseAppSwitcher'
import tabOptions from './tabOptions'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { Box } from '@mui/system'
import { Typography, Button, Alert } from '@mui/material'
import { CippEnterpriseAppStatusChip } from '../../../../../components/CippComponents/CippEnterpriseAppStatusChip'
import { CippTimeAgo } from '../../../../../components/CippComponents/CippTimeAgo'
import { useEffect, useMemo, useState } from 'react'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import CippEnterpriseAppRoles from '../../../../../components/CippComponents/CippEnterpriseAppRoles'
import { usePermissions } from '../../../../../hooks/use-permissions.js'
import { getEnterpriseAppDetailHeaderActions } from '../../../../../components/CippComponents/EnterpriseAppActions.jsx'

const spSelect =
  'id,appId,displayName,createdDateTime,accountEnabled,publisherName,signInAudience,tags'

const Page = () => {
  const userSettingsDefaults = useSettings()
  const { checkPermissions } = usePermissions()
  const canWriteApplication = checkPermissions(['Tenant.Application.ReadWrite'])
  const canWriteRoles = checkPermissions(['Identity.Role.ReadWrite'])
  const router = useRouter()
  const rawSpId = router.query.spId
  const spObjectId = Array.isArray(rawSpId) ? rawSpId[0] : rawSpId
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    if (spObjectId) {
      setWaiting(true)
    }
  }, [spObjectId])

  const tenantFilter = router.query.tenantFilter ?? userSettingsDefaults.currentTenant

  const spRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: spObjectId ? `servicePrincipals/${spObjectId}` : 'servicePrincipals',
      $select: spSelect,
      tenantFilter,
    },
    queryKey: `EnterpriseApp-spId-${spObjectId}-roles`,
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

  const title = !spObjectId
    ? 'No Enterprise Application Selected'
    : !spRequest.isSuccess
      ? 'Loading...'
      : spData?.displayName || spData?.appId || spObjectId || 'Enterprise application'

  const subtitle =
    spRequest.isSuccess && spData
      ? [
          {
            component: <CippEnterpriseAppStatusChip accountEnabled={spData?.accountEnabled} />,
          },
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

  const actionsData = useMemo(
    () => (spData ? { ...spData, Tenant: tenantFilter } : undefined),
    [spData, tenantFilter]
  )

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      titleControl={
        <CippEnterpriseAppSwitcher
          title={title}
          currentSpId={spObjectId}
          tenantFilter={tenantFilter}
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
      {spObjectId && spRequest.isLoading && <CippFormSkeleton layout={[1, 1, 1]} />}
      {spRequest.isSuccess && !spData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Typography sx={{ color: 'text.secondary' }}>
            No enterprise application found for this service principal ID.
          </Typography>
        </Box>
      )}
      {spRequest.isSuccess && spData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <CippHead title={`${title} — Roles`} />
          <CippEnterpriseAppRoles
            key={spObjectId}
            servicePrincipalId={spObjectId}
            tenantFilter={tenantFilter}
            canEdit={canWriteRoles}
          />
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
