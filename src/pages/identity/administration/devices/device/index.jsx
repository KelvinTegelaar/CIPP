import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { Alert, Button } from '@mui/material'
import { Box, Grid, Stack } from '@mui/system'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { CippTimeAgo } from '../../../../../components/CippComponents/CippTimeAgo'
import { CippEntitySwitcher } from '../../../../../components/CippComponents/CippEntitySwitcher'
import { CippPropertyListCard } from '../../../../../components/CippCards/CippPropertyListCard'
import { CippDataTable } from '../../../../../components/CippTable/CippDataTable'
import { useCippEntraDeviceActions } from '../../../../../components/CippComponents/CippEntraDeviceActions.jsx'
import tabOptions from './tabOptions'

const deviceSelect = [
  'id',
  'deviceId',
  'displayName',
  'accountEnabled',
  'trustType',
  'operatingSystem',
  'operatingSystemVersion',
  'manufacturer',
  'model',
  'profileType',
  'enrollmentType',
  'registrationDateTime',
  'approximateLastSignInDateTime',
  'isManaged',
  'isCompliant',
  'onPremisesSyncEnabled',
  'extensionAttributes',
].join(',')

const JOIN_TYPES = {
  AzureAd: 'Microsoft Entra joined',
  ServerAd: 'Microsoft Entra hybrid joined',
  Workplace: 'Microsoft Entra registered',
}

const yesNo = (value) => (value ? 'Yes' : 'No')

const resultOf = (request) => {
  const results = request.data?.Results
  return Array.isArray(results) ? results[0] : results
}

const Page = () => {
  const router = useRouter()
  const { deviceId } = router.query
  const currentTenant = useSettings().currentTenant
  const tenantFilter = router.query.tenantFilter ?? currentTenant
  const deviceKey = `EntraDevice-${tenantFilter}-${deviceId}`

  const deviceRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `devices/${deviceId}`,
      $select: deviceSelect,
      tenantFilter,
    },
    queryKey: deviceKey,
    waiting: Boolean(deviceId),
  })
  const device = resultOf(deviceRequest)

  const groupsKey = `${deviceKey}-groups`
  const groupsRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `devices/${deviceId}/memberOf/microsoft.graph.group`,
      $select: 'id,displayName,groupTypes,mailEnabled,securityEnabled',
      tenantFilter,
    },
    queryKey: groupsKey,
    waiting: Boolean(deviceId),
  })
  const groups = groupsRequest.data?.Results ?? []

  const intuneRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: 'deviceManagement/managedDevices',
      $filter: `azureADDeviceId eq '${device?.deviceId}'`,
      $select: 'id',
      tenantFilter,
    },
    queryKey: `${deviceKey}-intune`,
    waiting: Boolean(device?.deviceId),
  })
  const intuneDeviceId = resultOf(intuneRequest)?.id

  const deviceActions = useCippEntraDeviceActions()
  const actionsData = useMemo(
    () => (device ? { ...device, Tenant: tenantFilter } : undefined),
    [device, tenantFilter]
  )

  const groupRows = groups.map((group) => ({
    id: group.id,
    displayName: group.displayName,
    Membership: group.groupTypes?.includes('DynamicMembership')
      ? 'Dynamic'
      : 'Assigned',
    Type: group.groupTypes?.includes('Unified')
      ? 'Microsoft 365'
      : group.mailEnabled
        ? 'Mail-enabled security'
        : 'Security',
  }))

  const groupActions = [
    {
      label: 'View Group',
      link: '/identity/administration/groups/group?groupId=[id]',
      icon: <CippIcons.EyeIcon />,
      multiPost: false,
    },
    {
      label: 'Remove from group',
      type: 'POST',
      url: '/api/EditGroup',
      icon: <CippIcons.Delete />,
      color: 'danger',
      multiPost: false,
      // Dynamic group membership comes from the group's rule.
      condition: (row) => row.Membership === 'Assigned',
      customDataformatter: (row) => ({
        tenantFilter,
        groupId: row.id,
        groupName: row.displayName,
        RemoveMember: [{ label: device?.displayName, value: device?.id }],
      }),
      relatedQueryKeys: [groupsKey],
      confirmText: `Remove ${device?.displayName ?? 'this device'} from [displayName]?`,
    },
  ]

  const title = !deviceId
    ? 'No device selected'
    : deviceRequest.isError || (deviceRequest.isSuccess && !device?.displayName)
      ? 'Device not found'
      : (device?.displayName ?? 'Loading...')

  const subtitle = device
    ? [
        {
          icon: <CippIcons.Computer />,
          text: JOIN_TYPES[device.trustType] ?? device.trustType,
        },
        {
          icon: <CippIcons.Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={device.id} />,
        },
        {
          icon: <CippIcons.CalendarIcon />,
          text: (
            <>
              Last sign-in:{' '}
              <CippTimeAgo data={device.approximateLastSignInDateTime} />
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
              href={`https://entra.microsoft.com/${tenantFilter}/#view/Microsoft_AAD_Devices/DeviceDetailsMenuBlade/~/Properties/objectId/${device.id}/deviceId/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View in Entra
            </Button>
          ),
        },
        ...(intuneDeviceId
          ? [
              {
                icon: <CippIcons.LaptopMac />,
                text: (
                  <Button
                    color="muted"
                    style={{ paddingLeft: 0 }}
                    size="small"
                    href={`/endpoint/MEM/devices/device?deviceId=${intuneDeviceId}&tenantFilter=${tenantFilter}`}
                  >
                    View in CIPP Intune
                  </Button>
                ),
              },
            ]
          : []),
      ]
    : []

  const propertyItems = device
    ? [
        { label: 'Enabled', value: yesNo(device.accountEnabled) },
        {
          label: 'Join type',
          value: JOIN_TYPES[device.trustType] ?? device.trustType,
        },
        {
          label: 'Operating system',
          value: [device.operatingSystem, device.operatingSystemVersion]
            .filter(Boolean)
            .join(' '),
        },
        { label: 'Manufacturer', value: device.manufacturer },
        { label: 'Model', value: device.model },
        { label: 'Profile type', value: device.profileType },
        { label: 'Enrollment type', value: device.enrollmentType },
        { label: 'MDM managed', value: yesNo(device.isManaged) },
        { label: 'Compliant', value: yesNo(device.isCompliant) },
        {
          label: 'Synced from on-premises',
          value: yesNo(device.onPremisesSyncEnabled),
        },
        {
          label: 'Registered',
          value: device.registrationDateTime && (
            <CippTimeAgo data={device.registrationDateTime} />
          ),
        },
        { label: 'Device ID', value: device.deviceId },
      ].filter((item) => item.value)
    : []

  const extensionItems = Object.entries(device?.extensionAttributes ?? {})
    .filter(([, value]) => value)
    .map(([key, value]) => ({
      label: key.replace('extensionAttribute', 'Extension attribute '),
      value,
    }))

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
              Endpoint: 'devices',
              tenantFilter,
              $select: 'id,displayName,operatingSystem',
              $top: 999,
            },
            queryKey: `DeviceSwitcherEntra-${tenantFilter}`,
          }}
          getPrimary={(item) => item.displayName}
          getSecondary={(item) => item.operatingSystem}
          sortByPrimary
        />
      }
      subtitle={subtitle}
      actions={device ? deviceActions : []}
      actionsData={actionsData}
      queryKeys={[deviceKey, groupsKey]}
      backUrl="/identity/administration/devices"
      isFetching={deviceRequest.isLoading}
    >
      <CippHead title={title} />
      {!deviceId && (
        <Alert severity="info" sx={{ m: 2 }}>
          No device selected. Open this page from the Devices list.
        </Alert>
      )}
      {deviceId && deviceRequest.isLoading && (
        <CippFormSkeleton layout={[2, 1]} />
      )}
      {deviceRequest.isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          Could not load this device. It may have been deleted from Microsoft
          Entra.
        </Alert>
      )}
      {device && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippPropertyListCard
                title="Device"
                propertyItems={propertyItems}
                isFetching={deviceRequest.isFetching}
                copyItems={true}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                <CippPropertyListCard
                  title="Extension attributes"
                  propertyItems={
                    extensionItems.length
                      ? extensionItems
                      : [
                          {
                            label: 'None set',
                            value:
                              'Use Set Extension Attribute in the Actions menu to add one.',
                          },
                        ]
                  }
                  isFetching={deviceRequest.isFetching}
                  layout="double"
                />
                <CippDataTable
                  title="Groups"
                  data={groupRows}
                  simpleColumns={['displayName', 'Type', 'Membership']}
                  actions={groupActions}
                  isFetching={groupsRequest.isFetching}
                  refreshFunction={() => groupsRequest.refetch()}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default Page
