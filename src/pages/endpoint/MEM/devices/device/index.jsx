import { Layout as DashboardLayout } from '../../../../../layouts/index.js'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall, ApiPostCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon'
import {
  PhoneAndroid,
  Computer,
  PhoneIphone,
  Laptop,
  Launch,
  Security,
  CheckCircle,
  Warning,
  Sync,
  Fingerprint,
  Group,
} from '@mui/icons-material'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import tabOptions from './tabOptions'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { getIntuneDeviceActions } from '../../../../../components/CippComponents/CippIntuneDeviceActions.jsx'
import { Box, Stack } from '@mui/system'
import { Grid } from '@mui/system'
import { SvgIcon, Typography, Card, CardHeader, Divider, Tooltip, IconButton } from '@mui/material'
import { CippBannerListCard } from '../../../../../components/CippCards/CippBannerListCard'
import { CippTimeAgo } from '../../../../../components/CippComponents/CippTimeAgo'
import { useEffect, useState, useRef } from 'react'
import { PropertyList } from '../../../../../components/property-list'
import { PropertyListItem } from '../../../../../components/property-list-item'
import { CippDataTable } from '../../../../../components/CippTable/CippDataTable'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { Button } from '@mui/material'
import { getCippFormatting } from '../../../../../utils/get-cipp-formatting'
import { PencilIcon, EyeIcon } from '@heroicons/react/24/outline'

const Page = () => {
  const userSettingsDefaults = useSettings()
  const router = useRouter()
  const { deviceId } = router.query
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    if (deviceId) {
      setWaiting(true)
    }
  }, [deviceId])

  const deviceRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `deviceManagement/managedDevices/${deviceId}`,
      tenantFilter: router.query.tenantFilter ?? userSettingsDefaults.currentTenant,
    },
    queryKey: `ManagedDevice-${deviceId}`,
    waiting: waiting,
  })

  const deviceBulkRequest = ApiPostCall({
    urlFromData: true,
  })

  // Handle response structure - ListGraphRequest may wrap single items in Results array
  // Try Results array first, then Results as object, then data directly
  let deviceData = null
  if (deviceRequest.isSuccess && deviceRequest.data) {
    if (Array.isArray(deviceRequest.data.Results)) {
      deviceData = deviceRequest.data.Results[0]
    } else if (deviceRequest.data.Results) {
      deviceData = deviceRequest.data.Results
    } else {
      deviceData = deviceRequest.data
    }
  }

  function refreshFunction() {
    if (!deviceId) return
    const requests = [
      {
        id: 'deviceCompliance',
        url: `/deviceManagement/managedDevices/${deviceId}/deviceCompliancePolicyStates`,
        method: 'GET',
      },
      {
        id: 'deviceConfiguration',
        url: `/deviceManagement/managedDevices/${deviceId}/deviceConfigurationStates`,
        method: 'GET',
      },
      {
        id: 'detectedApps',
        url: `/deviceManagement/managedDevices/${deviceId}/detectedApps`,
        method: 'GET',
      },
      {
        id: 'users',
        url: `/deviceManagement/managedDevices/${deviceId}/users`,
        method: 'GET',
      },
    ]

    // /devices/{id} requires the Entra directory object, not the Intune managedDevice id,
    // so address it by alternate key. All-zeros means the device is not Entra-joined.
    const azureADDeviceId = deviceData?.azureADDeviceId
    if (azureADDeviceId && azureADDeviceId !== '00000000-0000-0000-0000-000000000000') {
      requests.push({
        id: 'deviceMemberOf',
        // No /microsoft.graph.group cast: OData cast is an advanced query needing
        // ConsistencyLevel=eventual + $count, and silently returns [] without them.
        // Groups are filtered client-side on @odata.type below.
        url: `/devices(deviceId='${azureADDeviceId}')/transitiveMemberOf`,
        method: 'GET',
      })
    }

    deviceBulkRequest.mutate({
      url: '/api/ListGraphBulkRequest',
      data: {
        Requests: requests,
        tenantFilter: userSettingsDefaults.currentTenant,
      },
    })
  }

  useEffect(() => {
    // Wait for deviceRequest so azureADDeviceId is available for the memberOf request
    if (
      deviceId &&
      userSettingsDefaults.currentTenant &&
      deviceRequest.isSuccess &&
      !deviceBulkRequest.isSuccess
    ) {
      refreshFunction()
    }
  }, [
    deviceId,
    userSettingsDefaults.currentTenant,
    deviceRequest.isSuccess,
    deviceBulkRequest.isSuccess,
  ])

  const bulkData = deviceBulkRequest?.data?.data ?? []
  const deviceComplianceData = bulkData?.find((item) => item.id === 'deviceCompliance')
  const deviceConfigurationData = bulkData?.find((item) => item.id === 'deviceConfiguration')
  const detectedAppsData = bulkData?.find((item) => item.id === 'detectedApps')
  const usersData = bulkData?.find((item) => item.id === 'users')
  const deviceMemberOfData = bulkData?.find((item) => item.id === 'deviceMemberOf')

  const deviceCompliance = deviceComplianceData?.body?.value || []
  const deviceConfiguration = deviceConfigurationData?.body?.value || []
  const detectedApps = detectedAppsData?.body?.value || []
  const users = usersData?.body?.value || []
  const deviceMemberOf = deviceMemberOfData?.body?.value || []

  // Helper function to format bytes to GB (matching getCippFormatting pattern)
  const formatBytesToGB = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A'
    const gb = bytes / 1024 / 1024 / 1024
    return `${gb.toFixed(2)} GB`
  }

  // Set the title and subtitle for the layout
  const title = deviceRequest.isSuccess ? deviceData?.deviceName : 'Loading...'

  const subtitle = deviceRequest.isSuccess
    ? [
        {
          icon: <Computer />,
          text: <CippCopyToClipBoard type="chip" text={deviceData?.deviceName} />,
        },
        {
          icon: <Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={deviceData?.id} />,
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Last Sync: <CippTimeAgo data={deviceData?.lastSyncDateTime} />
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

  const data = deviceData

  const deviceActions = getIntuneDeviceActions({
    tenantFilter: userSettingsDefaults.currentTenant,
  })

  // Get device icon based on OS
  const getDeviceIcon = () => {
    if (!data?.operatingSystem) return <Computer />
    const os = data.operatingSystem.toLowerCase()
    if (os.includes('android')) return <PhoneAndroid />
    if (os.includes('ios') || os.includes('iphone') || os.includes('ipad')) return <PhoneIphone />
    if (os.includes('windows') || os.includes('macos')) return <Laptop />
    return <Computer />
  }

  // Prepare compliance policy items
  let compliancePolicyItems = []
  if (deviceCompliance.length > 0) {
    compliancePolicyItems = deviceCompliance.map((policy, index) => ({
      id: index,
      cardLabelBox: {
        cardLabelBoxHeader: policy.complianceState === 'compliant' ? <CheckCircle /> : <Warning />,
      },
      text: policy.displayName || 'Unknown Policy',
      subtext: `State: ${policy.complianceState || 'Unknown'}`,
      statusColor: policy.complianceState === 'compliant' ? 'success.main' : 'warning.main',
      statusText: policy.complianceState || 'Unknown',
      propertyItems: [
        {
          label: 'Setting Count',
          value: policy.settingCount || 'N/A',
        },
        {
          label: 'Setting States',
          value: policy.settingStates?.length || 0,
        },
      ],
    }))
  } else if (deviceComplianceData?.status !== 200) {
    compliancePolicyItems = [
      {
        id: 1,
        cardLabelBox: '!',
        text: 'Error loading compliance policies',
        subtext: deviceComplianceData?.error?.message || 'Unknown error',
        statusColor: 'error.main',
        statusText: 'Error',
        propertyItems: [],
      },
    ]
  } else {
    compliancePolicyItems = [
      {
        id: 1,
        cardLabelBox: '-',
        text: 'No compliance policies available',
        subtext: 'This device does not have any compliance policies assigned.',
        statusColor: 'warning.main',
        statusText: 'No Policies',
        propertyItems: [],
      },
    ]
  }

  // Prepare configuration policy items
  let configurationPolicyItems = []
  if (deviceConfiguration.length > 0) {
    configurationPolicyItems = deviceConfiguration.map((policy, index) => ({
      id: index,
      cardLabelBox: {
        cardLabelBoxHeader: policy.state === 'compliant' ? <CheckCircle /> : <Warning />,
      },
      text: policy.displayName || 'Unknown Policy',
      subtext: `State: ${policy.state || 'Unknown'}`,
      statusColor: policy.state === 'compliant' ? 'success.main' : 'warning.main',
      statusText: policy.state || 'Unknown',
      propertyItems: [
        {
          label: 'Setting Count',
          value: policy.settingCount || 'N/A',
        },
        {
          label: 'Setting States',
          value: policy.settingStates?.length || 0,
        },
      ],
    }))
  } else if (deviceConfigurationData?.status !== 200) {
    configurationPolicyItems = [
      {
        id: 1,
        cardLabelBox: '!',
        text: 'Error loading configuration policies',
        subtext: deviceConfigurationData?.error?.message || 'Unknown error',
        statusColor: 'error.main',
        statusText: 'Error',
        propertyItems: [],
      },
    ]
  } else {
    configurationPolicyItems = [
      {
        id: 1,
        cardLabelBox: '-',
        text: 'No configuration policies available',
        subtext: 'This device does not have any configuration policies assigned.',
        statusColor: 'warning.main',
        statusText: 'No Policies',
        propertyItems: [],
      },
    ]
  }

  // Prepare detected apps items
  let detectedAppsItems = []
  if (detectedApps.length > 0) {
    detectedAppsItems = [
      {
        id: 1,
        cardLabelBox: {
          cardLabelBoxHeader: <CheckCircle />,
        },
        text: 'Detected Applications',
        subtext: `${detectedApps.length} application(s) detected`,
        statusText: `${detectedApps.length} App(s)`,
        statusColor: 'info.main',
        table: {
          title: 'Detected Applications',
          hideTitle: true,
          data: detectedApps,
          simpleColumns: ['displayName', 'version', 'platform'],
          refreshFunction: refreshFunction,
        },
      },
    ]
  } else if (detectedAppsData?.status !== 200) {
    detectedAppsItems = [
      {
        id: 1,
        cardLabelBox: '!',
        text: 'Error loading detected applications',
        subtext: detectedAppsData?.error?.message || 'Unknown error',
        statusColor: 'error.main',
        statusText: 'Error',
        propertyItems: [],
      },
    ]
  } else {
    detectedAppsItems = [
      {
        id: 1,
        cardLabelBox: '-',
        text: 'No detected applications',
        subtext: 'No applications have been detected on this device.',
        statusColor: 'warning.main',
        statusText: 'No Apps',
        propertyItems: [],
      },
    ]
  }

  // Prepare users items
  let usersItems = []
  if (users.length > 0) {
    usersItems = [
      {
        id: 1,
        cardLabelBox: {
          cardLabelBoxHeader: <CheckCircle />,
        },
        text: 'Device Users',
        subtext: `${users.length} user(s) associated with this device`,
        statusText: `${users.length} User(s)`,
        statusColor: 'info.main',
        table: {
          title: 'Device Users',
          hideTitle: true,
          data: users,
          simpleColumns: ['displayName', 'userPrincipalName', 'mail'],
          refreshFunction: refreshFunction,
          actions: [
            {
              icon: <EyeIcon />,
              label: 'View User',
              link: `/identity/administration/users/user?userId=[id]&tenantFilter=${userSettingsDefaults.currentTenant}`,
            },
          ],
        },
      },
    ]
  } else if (usersData?.status !== 200) {
    usersItems = [
      {
        id: 1,
        cardLabelBox: '!',
        text: 'Error loading device users',
        subtext: usersData?.error?.message || 'Unknown error',
        statusColor: 'error.main',
        statusText: 'Error',
        propertyItems: [],
      },
    ]
  } else {
    usersItems = [
      {
        id: 1,
        cardLabelBox: '-',
        text: 'No users associated',
        subtext: 'No users are currently associated with this device.',
        statusColor: 'warning.main',
        statusText: 'No Users',
        propertyItems: [],
      },
    ]
  }

  // Prepare group membership items
  const groupMembershipItems =
    deviceMemberOf.length > 0
      ? [
          {
            id: 1,
            cardLabelBox: {
              cardLabelBoxHeader: <Group />,
            },
            text: 'Groups',
            subtext: 'List of groups the device is a member of',
            statusText: ` ${
              deviceMemberOf?.filter((item) => item?.['@odata.type'] === '#microsoft.graph.group')
                .length
            } Group(s)`,
            statusColor: 'info.main',
            table: {
              title: 'Group Memberships',
              hideTitle: true,
              actions: [
                {
                  icon: <PencilIcon />,
                  label: 'Edit Group',
                  link: '/identity/administration/groups/edit?groupId=[id]&groupType=[calculatedGroupType]',
                },
              ],
              data: deviceMemberOf?.filter(
                (item) => item?.['@odata.type'] === '#microsoft.graph.group'
              ),
              refreshFunction: refreshFunction,
              simpleColumns: ['displayName', 'groupTypes', 'securityEnabled', 'mailEnabled'],
            },
          },
        ]
      : deviceMemberOfData && deviceMemberOfData.status !== 200
        ? [
            {
              id: 1,
              cardLabelBox: '!',
              text: 'Error loading device group memberships',
              subtext: deviceMemberOfData?.error?.message || 'Unknown error',
              statusColor: 'error.main',
              statusText: 'Error',
              propertyItems: [],
            },
          ]
        : [
            {
              id: 1,
              cardLabelBox: '-',
              text: 'No group memberships',
              subtext: 'This device is not a member of any groups.',
              statusColor: 'warning.main',
              statusText: 'No Groups',
              propertyItems: [],
            },
          ]

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      actions={deviceActions}
      actionsData={data}
      subtitle={subtitle}
      isFetching={deviceRequest.isLoading}
    >
      {deviceRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {deviceRequest.isSuccess && (
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
                <CardHeader
                  title="Device Details"
                  action={
                    <Tooltip title="Refresh">
                      <IconButton
                        size="small"
                        onClick={() => {
                          deviceRequest.refetch()
                          refreshFunction()
                        }}
                      >
                        <Sync fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <PropertyList>
                  <PropertyListItem
                    divider
                    value={
                      <Stack alignItems="center" spacing={1}>
                        <SvgIcon sx={{ fontSize: 64 }}>{getDeviceIcon()}</SvgIcon>
                        <Typography variant="h6">{data?.deviceName || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {data?.manufacturer} {data?.model}
                        </Typography>
                      </Stack>
                    }
                  />
                  <PropertyListItem
                    divider
                    label="Device Information"
                    value={
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Device Name:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.deviceName, 'deviceName') || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Device ID:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.id, 'id') || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Operating System:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.operatingSystem || 'N/A'} {data?.osVersion || ''}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Manufacturer:
                          </Typography>
                          <Typography variant="inherit">{data?.manufacturer || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Model:
                          </Typography>
                          <Typography variant="inherit">{data?.model || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Serial Number:
                          </Typography>
                          <Typography variant="inherit">{data?.serialNumber || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Compliance State:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.complianceState, 'complianceState') || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Enrolled Date:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.enrolledDateTime
                              ? new Date(data.enrolledDateTime).toLocaleString()
                              : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Last Sync:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.lastSyncDateTime
                              ? new Date(data.lastSyncDateTime).toLocaleString()
                              : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Owner Type:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(
                              data?.managedDeviceOwnerType,
                              'managedDeviceOwnerType'
                            ) || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Enrollment Type:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(
                              data?.deviceEnrollmentType,
                              'deviceEnrollmentType'
                            ) || 'N/A'}
                          </Typography>
                        </Grid>
                        {data?.userPrincipalName && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="inherit" color="text.primary" gutterBottom>
                              Primary User:
                            </Typography>
                            <Typography variant="inherit">
                              {getCippFormatting(data?.userPrincipalName, 'userPrincipalName') ||
                                'N/A'}
                            </Typography>
                          </Grid>
                        )}
                        {data?.totalStorageSpaceInBytes && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="inherit" color="text.primary" gutterBottom>
                              Storage:
                            </Typography>
                            <Typography variant="inherit">
                              {formatBytesToGB(data.freeStorageSpaceInBytes || 0)} free of{' '}
                              {formatBytesToGB(data.totalStorageSpaceInBytes)}
                              {data.freeStorageSpaceInBytes &&
                                data.totalStorageSpaceInBytes &&
                                ` (${Math.round(
                                  ((data.totalStorageSpaceInBytes - data.freeStorageSpaceInBytes) /
                                    data.totalStorageSpaceInBytes) *
                                    100
                                )}% used)`}
                            </Typography>
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
                <Typography variant="h6">Compliance Policies</Typography>
                <CippBannerListCard
                  isFetching={deviceBulkRequest.isPending}
                  items={compliancePolicyItems}
                  isCollapsible={compliancePolicyItems.length > 0}
                />
                <Typography variant="h6">Configuration Policies</Typography>
                <CippBannerListCard
                  isFetching={deviceBulkRequest.isPending}
                  items={configurationPolicyItems}
                  isCollapsible={configurationPolicyItems.length > 0}
                />
                <Typography variant="h6">Detected Applications</Typography>
                <CippBannerListCard
                  isFetching={deviceBulkRequest.isPending}
                  items={detectedAppsItems}
                  isCollapsible={true}
                />
                <Typography variant="h6">Associated Users</Typography>
                <CippBannerListCard
                  isFetching={deviceBulkRequest.isPending}
                  items={usersItems}
                  isCollapsible={true}
                />
                <Typography variant="h6">Memberships</Typography>
                <CippBannerListCard
                  isFetching={deviceBulkRequest.isPending}
                  items={groupMembershipItems}
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
