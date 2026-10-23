import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippEntitySwitcher } from '../../../../../components/CippComponents/CippEntitySwitcher'
import tabOptions from './tabOptions'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { getIntuneDeviceActions } from '../../../../../components/CippComponents/CippIntuneDeviceActions.jsx'
import { Box } from '@mui/system'
import { Button } from '@mui/material'
import { CippTimeAgo } from '../../../../../components/CippComponents/CippTimeAgo'
import { CippDataTable } from '../../../../../components/CippTable/CippDataTable'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { useEffect, useState } from 'react'

const Page = () => {
  const userSettingsDefaults = useSettings()
  const router = useRouter()
  const { deviceId } = router.query
  const tenantFilter = router.query.tenantFilter ?? userSettingsDefaults.currentTenant
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    if (deviceId) {
      setWaiting(true)
    }
  }, [deviceId])

  // Same request and query key as the device overview tab, so switching tabs reuses the cache
  const deviceRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `deviceManagement/managedDevices/${deviceId}`,
      tenantFilter,
    },
    queryKey: `ManagedDevice-${deviceId}`,
    waiting: waiting,
  })

  const results = deviceRequest.data?.Results
  const deviceData = Array.isArray(results) ? results[0] : (results ?? deviceRequest.data)

  const title = deviceRequest.isSuccess ? deviceData?.deviceName : 'Loading...'

  const subtitle = deviceRequest.isSuccess
    ? [
        {
          icon: <CippIcons.Computer />,
          text: <CippCopyToClipBoard type="chip" text={deviceData?.deviceName} />,
        },
        {
          icon: <CippIcons.Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={deviceData?.id} />,
        },
        {
          icon: <CippIcons.CalendarIcon />,
          text: (
            <>
              Last Sync: <CippTimeAgo data={deviceData?.lastSyncDateTime} />
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
              href={`https://intune.microsoft.com/${userSettingsDefaults.currentTenant}/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/${deviceId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View in Intune
            </Button>
          ),
        },
      ]
    : []

  const deviceActions = getIntuneDeviceActions({ tenantFilter: userSettingsDefaults.currentTenant })

  const scriptStatesQueryKey = `DeviceHealthScriptStates-${deviceId}`

  const actions = [
    {
      label: 'Run Again',
      type: 'POST',
      icon: <CippIcons.Healing />,
      url: '/api/ExecDeviceAction',
      data: {
        GUID: 'deviceId',
        Action: '!initiateOnDemandProactiveRemediation',
        scriptPolicyId: 'policyId',
      },
      relatedQueryKeys: [scriptStatesQueryKey, `ManagedDevice-${deviceId}`],
      multiPost: false,
      confirmText: 'Run the remediation script [policyName] on this device again?',
    },
  ]

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      titleControl={
        <CippEntitySwitcher
          title={title}
          currentId={deviceId}
          queryParamKey="deviceId"
          entityName="device"
          api={{
            url: '/api/ListGraphRequest',
            data: {
              Endpoint: 'deviceManagement/managedDevices',
              tenantFilter,
              // Intune endpoints reject $orderby/$count, so ordering happens client-side.
              $select: 'id,deviceName,userPrincipalName',
              $top: 999,
            },
            queryKey: `DeviceSwitcher-${tenantFilter}`,
          }}
          getPrimary={(device) => device.deviceName}
          getSecondary={(device) => device.userPrincipalName}
          sortByPrimary
        />
      }
      actions={deviceActions}
      actionsData={deviceData}
      subtitle={subtitle}
      isFetching={deviceRequest.isLoading}
    >
      <CippHead title={title ? `${title} - Remediations` : 'Remediations'} />
      {deviceRequest.isLoading && <CippFormSkeleton layout={[1, 2]} />}
      {deviceRequest.isSuccess && (
        <Box sx={{ flexGrow: 1, py: 1 }}>
          <CippDataTable
            title="Remediations"
            queryKey={scriptStatesQueryKey}
            simpleColumns={[
              'policyName',
              'detectionState',
              'remediationState',
              'lastStateUpdateDateTime',
              'preRemediationDetectionScriptOutput',
              'postRemediationDetectionScriptOutput',
              'remediationScriptError',
            ]}
            actions={actions}
            api={{
              url: '/api/ListGraphRequest',
              data: {
                Endpoint: `deviceManagement/managedDevices/${deviceId}/deviceHealthScriptStates`,
                tenantFilter,
              },
              dataKey: 'Results',
            }}
          />
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
