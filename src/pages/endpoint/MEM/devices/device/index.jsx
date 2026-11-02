import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall, ApiPostCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippEntitySwitcher } from '../../../../../components/CippComponents/CippEntitySwitcher'
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
import { CippDevicePolicySettingStates } from '../../../../../components/CippComponents/CippDevicePolicySettingStates'

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

  // Intune's own device-page reports: unlike the per-device state collections they also cover
  // settings catalog, administrative template and endpoint security policies.
  const reportTenant = router.query.tenantFilter ?? userSettingsDefaults.currentTenant
  // Both reports in one round trip; a report that failed comes back null with its reason in errors
  const policyReport = ApiGetCall({
    url: '/api/ListDevicePolicyStatus',
    data: { tenantFilter: reportTenant, deviceId, report: 'all' },
    queryKey: `DevicePolicyStatus-${deviceId}`,
    waiting: waiting,
  })

  const deviceBulkRequest = ApiPostCall({
    urlFromData: true,
  })
  const bulkFetchedForId = useRef(null)

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

    bulkFetchedForId.current = deviceId
    deviceBulkRequest.mutate({
      url: '/api/ListGraphBulkRequest',
      data: {
        Requests: requests,
        tenantFilter: router.query.tenantFilter ?? userSettingsDefaults.currentTenant,
      },
    })
  }

  useEffect(() => {
    // Wait for deviceRequest so azureADDeviceId is available for the memberOf request
    if (
      deviceId &&
      userSettingsDefaults.currentTenant &&
      deviceRequest.isSuccess &&
      bulkFetchedForId.current !== deviceId
    ) {
      refreshFunction()
    }
  }, [
    deviceId,
    userSettingsDefaults.currentTenant,
    deviceRequest.isSuccess,
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

  // Graph bulk items omit `error.message` on many failures (message is under body.error),
  // and a missing item makes `status !== 200` true — treat only real HTTP failures as errors.
  const isBulkRequestFailed = (item) =>
    item != null && typeof item.status === 'number' && (item.status < 200 || item.status >= 300)

  const getBulkFailureMessage = (item, fallback) =>
    item?.error?.message ||
    item?.body?.error?.message ||
    (typeof item?.body?.error === 'string' ? item.body.error : null) ||
    (item?.status ? `Unable to load this data (HTTP ${item.status}).` : null) ||
    fallback

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

  const data = deviceData

  const deviceActions = getIntuneDeviceActions({
    tenantFilter: userSettingsDefaults.currentTenant,
  })

  // Get device icon based on OS
  const getDeviceIcon = () => {
    if (!data?.operatingSystem) return <CippIcons.Computer />
    const os = data.operatingSystem.toLowerCase()
    if (os.includes('android')) return <CippIcons.PhoneAndroid />
    if (os.includes('ios') || os.includes('iphone') || os.includes('ipad')) return <CippIcons.PhoneIphone />
    if (os.includes('windows') || os.includes('macos')) return <CippIcons.Laptop />
    return <CippIcons.Computer />
  }

  const tenantFilter = router.query.tenantFilter ?? userSettingsDefaults.currentTenant

  const reportRows = (key) =>
    Array.isArray(policyReport.data?.Results?.[key]) ? policyReport.data.Results[key] : []
  const reportFailed = (key) =>
    policyReport.isError || Boolean(policyReport.data?.Results?.errors?.[key])
  const reportError = (key, fallback) => policyReport.data?.Results?.errors?.[key] ?? fallback
  // Setting-level drill-down only exists for policies the per-device state collections know about
  const complianceStateIds = new Set(deviceCompliance.map((policy) => policy.id))
  const configurationStateIds = new Set(deviceConfiguration.map((policy) => policy.id))

  const countOf = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`
  // Report times are UTC without a zone suffix
  const asUtc = (value) => (value && !value.endsWith('Z') ? `${value}Z` : value)
  const settingDetails = (row, stateIds, statesCollection) =>
    stateIds.has(row.policyId) ? (
      <CippDevicePolicySettingStates
        deviceId={deviceId}
        policyStateId={row.policyId}
        tenantFilter={tenantFilter}
        statesCollection={statesCollection}
      />
    ) : (
      <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
        Setting-level results are not available for this policy type.
      </Typography>
    )

  // Prepare compliance policy items
  // PolicyStatus 2 = compliant
  const complianceRows = reportRows('compliance').map((policy) => ({
    policyName: policy.PolicyName,
    status: policy.PolicyStatus_loc || 'Unknown',
    compliant: policy.PolicyStatus === 2,
    userPrincipalName: policy.UPN,
    lastContactDateTime: asUtc(policy.LastContact),
    policyVersion: policy.PolicyVersion,
    policyId: policy.PolicyId,
  }))
  const nonCompliantCount = complianceRows.filter((row) => !row.compliant).length
  let compliancePolicyItems = []
  if (complianceRows.length > 0) {
    compliancePolicyItems = [
      {
        id: 'compliance',
        cardLabelBox: {
          cardLabelBoxHeader:
            nonCompliantCount > 0 ? <CippIcons.Warning /> : <CippIcons.CheckCircle />,
        },
        text: 'Compliance Policies',
        subtext: `${countOf(complianceRows.length, 'policy', 'policies')}, ${nonCompliantCount} not compliant`,
        statusText: nonCompliantCount > 0 ? 'Not compliant' : 'Compliant',
        statusColor: nonCompliantCount > 0 ? 'warning.main' : 'success.main',
        table: {
          title: 'Compliance Policies',
          hideTitle: true,
          data: complianceRows,
          simpleColumns: ['policyName', 'status', 'userPrincipalName', 'lastContactDateTime'],
          refreshFunction: () => policyReport.refetch(),
          offCanvas: {
            children: (row) =>
              settingDetails(row, complianceStateIds, 'deviceCompliancePolicyStates'),
          },
        },
      },
    ]
  } else if (reportFailed('compliance')) {
    compliancePolicyItems = [
      {
        id: 'compliance',
        cardLabelBox: '!',
        text: 'Error loading compliance policies',
        subtext: reportError(
          'compliance',
          'Unable to load compliance policies. Try refreshing the device.'
        ),
        statusColor: 'error.main',
        statusText: 'Error',
        propertyItems: [],
      },
    ]
  } else {
    compliancePolicyItems = [
      {
        id: 'compliance',
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
  const configurationRows = reportRows('configuration').map((policy) => ({
    policyName: policy.PolicyName,
    status: policy.ReportStatus_loc || policy.ReportStatus || 'Unknown',
    succeeded: policy.ReportStatus === 'Succeeded',
    failed: ['Error', 'Conflict'].includes(policy.ReportStatus),
    policyType: policy.UnifiedPolicyType_loc,
    platform: policy.UnifiedPolicyPlatformType_loc,
    lastReportedDateTime: asUtc(policy.PspdpuLastModifiedTimeUtc),
    policyId: policy.PolicyId,
  }))
  const failedConfigurationCount = configurationRows.filter((row) => row.failed).length
  const pendingConfigurationCount = configurationRows.filter(
    (row) => !row.succeeded && !row.failed
  ).length
  let configurationPolicyItems = []
  if (configurationRows.length > 0) {
    configurationPolicyItems = [
      {
        id: 'configuration',
        cardLabelBox: {
          cardLabelBoxHeader:
            failedConfigurationCount > 0 ? <CippIcons.Warning /> : <CippIcons.CheckCircle />,
        },
        text: 'Configuration Policies',
        subtext: `${countOf(configurationRows.length, 'policy', 'policies')}, ${failedConfigurationCount} with errors or conflicts${
          pendingConfigurationCount > 0 ? `, ${pendingConfigurationCount} other` : ''
        }`,
        statusText: countOf(configurationRows.length, 'Policy', 'Policies'),
        statusColor:
          failedConfigurationCount > 0
            ? 'error.main'
            : pendingConfigurationCount > 0
              ? 'warning.main'
              : 'success.main',
        table: {
          title: 'Configuration Policies',
          hideTitle: true,
          data: configurationRows,
          simpleColumns: ['policyName', 'status', 'policyType', 'lastReportedDateTime'],
          refreshFunction: () => policyReport.refetch(),
          offCanvas: {
            children: (row) =>
              settingDetails(row, configurationStateIds, 'deviceConfigurationStates'),
          },
        },
      },
    ]
  } else if (reportFailed('configuration')) {
    configurationPolicyItems = [
      {
        id: 'configuration',
        cardLabelBox: '!',
        text: 'Error loading configuration policies',
        subtext: reportError(
          'configuration',
          'Unable to load configuration policies. Try refreshing the device.'
        ),
        statusColor: 'error.main',
        statusText: 'Error',
        propertyItems: [],
      },
    ]
  } else {
    configurationPolicyItems = [
      {
        id: 'configuration',
        cardLabelBox: '-',
        text: 'No configuration policies available',
        subtext: 'This device does not have any configuration policies assigned.',
        statusColor: 'warning.main',
        statusText: 'No Policies',
        propertyItems: [],
      },
    ]
  }

  // Enrollment configurations that applied when the device enrolled; the report has no status
  const enrollmentRows = reportRows('enrollment').map((policy) => ({
    profileName: policy.ProfileName,
    policyType: policy.PolicyType_loc || policy.PolicyType,
  }))
  let enrollmentPolicyItems = []
  if (enrollmentRows.length > 0) {
    enrollmentPolicyItems = [
      {
        id: 'enrollment',
        cardLabelBox: { cardLabelBoxHeader: <CippIcons.CheckCircle /> },
        text: 'Enrollment Configurations',
        subtext: `${countOf(enrollmentRows.length, 'configuration', 'configurations')} applied at enrollment`,
        statusText: countOf(enrollmentRows.length, 'Configuration', 'Configurations'),
        statusColor: 'success.main',
        table: {
          title: 'Enrollment Configurations',
          hideTitle: true,
          data: enrollmentRows,
          simpleColumns: ['profileName', 'policyType'],
          refreshFunction: () => policyReport.refetch(),
        },
      },
    ]
  } else if (reportFailed('enrollment')) {
    enrollmentPolicyItems = [
      {
        id: 'enrollment',
        cardLabelBox: '!',
        text: 'Error loading enrollment configurations',
        subtext: reportError(
          'enrollment',
          'Unable to load enrollment configurations. Try refreshing the device.'
        ),
        statusColor: 'error.main',
        statusText: 'Error',
        propertyItems: [],
      },
    ]
  }

  // Prepare device action history, newest first. Action results can carry secrets
  // (a reset passcode), so only the name, state and times are kept.
  const deviceActionRows = [...(deviceData?.deviceActionResults ?? [])]
    .sort((a, b) => new Date(b.startDateTime ?? 0) - new Date(a.startDateTime ?? 0))
    .map((result) => ({
      actionName: (result.actionName ?? 'Unknown action')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase()),
      actionState: result.actionState,
      startDateTime: result.startDateTime,
      lastUpdatedDateTime: result.lastUpdatedDateTime,
    }))
  const pendingActionCount = deviceActionRows.filter((r) => r.actionState === 'pending').length
  const failedActionCount = deviceActionRows.filter((r) => r.actionState === 'failed').length
  let actionHistoryItems = []
  if (deviceActionRows.length > 0) {
    actionHistoryItems = [
      {
        id: 1,
        cardLabelBox: {
          cardLabelBoxHeader: failedActionCount > 0 ? <CippIcons.Warning /> : <CippIcons.CheckCircle />,
        },
        text: 'Device Actions',
        subtext: `${countOf(deviceActionRows.length, 'action', 'actions')} recorded${
          pendingActionCount > 0 ? `, ${pendingActionCount} pending` : ''
        }${failedActionCount > 0 ? `, ${failedActionCount} failed` : ''}`,
        statusText: countOf(deviceActionRows.length, 'Action', 'Actions'),
        statusColor: failedActionCount > 0 ? 'warning.main' : 'info.main',
        table: {
          title: 'Device Actions',
          hideTitle: true,
          data: deviceActionRows,
          simpleColumns: ['actionName', 'actionState', 'startDateTime', 'lastUpdatedDateTime'],
          refreshFunction: () => deviceRequest.refetch(),
        },
      },
    ]
  } else {
    actionHistoryItems = [
      {
        id: 1,
        cardLabelBox: '-',
        text: 'No device actions recorded',
        subtext: 'Actions such as sync, reboot or remediation runs appear here once queued.',
        statusColor: 'warning.main',
        statusText: 'No Actions',
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
          cardLabelBoxHeader: <CippIcons.CheckCircle />,
        },
        text: 'Detected Applications',
        subtext: `${countOf(detectedApps.length, 'application', 'applications')} detected`,
        statusText: countOf(detectedApps.length, 'App', 'Apps'),
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
  } else if (isBulkRequestFailed(detectedAppsData) || deviceBulkRequest.isError) {
    detectedAppsItems = [
      {
        id: 1,
        cardLabelBox: '!',
        text: 'Error loading detected applications',
        subtext: getBulkFailureMessage(
          detectedAppsData,
          'Unable to load detected applications. Try refreshing the device.'
        ),
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
          cardLabelBoxHeader: <CippIcons.CheckCircle />,
        },
        text: 'Device Users',
        subtext: `${countOf(users.length, 'user', 'users')} associated with this device`,
        statusText: countOf(users.length, 'User', 'Users'),
        statusColor: 'info.main',
        table: {
          title: 'Device Users',
          hideTitle: true,
          data: users,
          simpleColumns: ['displayName', 'userPrincipalName', 'mail'],
          refreshFunction: refreshFunction,
          actions: [
            {
              icon: <CippIcons.EyeIcon />,
              label: 'View User',
              link: `/identity/administration/users/user?userId=[id]&tenantFilter=${userSettingsDefaults.currentTenant}`,
              pinned: true,
            },
          ],
        },
      },
    ]
  } else if (isBulkRequestFailed(usersData) || deviceBulkRequest.isError) {
    usersItems = [
      {
        id: 1,
        cardLabelBox: '!',
        text: 'Error loading device users',
        subtext: getBulkFailureMessage(
          usersData,
          'Unable to load associated users. Try refreshing the device.'
        ),
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
              cardLabelBoxHeader: <CippIcons.Group />,
            },
            text: 'Groups',
            subtext: 'List of groups the device is a member of',
            statusText: countOf(
              deviceMemberOf?.filter((item) => item?.['@odata.type'] === '#microsoft.graph.group')
                .length,
              'Group',
              'Groups'
            ),
            statusColor: 'info.main',
            table: {
              title: 'Group Memberships',
              hideTitle: true,
              actions: [
                {
                  icon: <CippIcons.Edit />,
                  label: 'Edit Group',
                  link: '/identity/administration/groups/edit?groupId=[id]&groupType=[calculatedGroupType]',
                  pinned: true,
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
      : isBulkRequestFailed(deviceMemberOfData) || deviceBulkRequest.isError
        ? [
            {
              id: 1,
              cardLabelBox: '!',
              text: 'Error loading device group memberships',
              subtext: getBulkFailureMessage(
                deviceMemberOfData,
                'Unable to load group memberships. Try refreshing the device.'
              ),
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
              tenantFilter: router.query.tenantFilter ?? userSettingsDefaults.currentTenant,
              // Intune endpoints reject $orderby/$count, so ordering happens client-side.
              $select: 'id,deviceName,userPrincipalName',
              $top: 999,
            },
            queryKey: `DeviceSwitcher-${router.query.tenantFilter ?? userSettingsDefaults.currentTenant}`,
          }}
          getPrimary={(device) => device.deviceName}
          getSecondary={(device) => device.userPrincipalName}
          sortByPrimary
        />
      }
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
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card>
                <CardHeader
                  title="Device Details"
                  action={
                    <Tooltip title="Refresh">
                      <IconButton
                        size="small"
                        onClick={() => {
                          deviceRequest.refetch()
                          policyReport.refetch()
                          refreshFunction()
                        }}
                      >
                        <CippIcons.Sync fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <PropertyList>
                  <PropertyListItem
                    divider
                    value={
                      <Stack spacing={1} sx={{
                        alignItems: "center"
                      }}>
                        <SvgIcon sx={{ fontSize: 64 }}>{getDeviceIcon()}</SvgIcon>
                        <Typography variant="h6">{data?.deviceName || 'N/A'}</Typography>
                        <Typography variant="body2" sx={{
                          color: "text.secondary"
                        }}>
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
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Device Name:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.deviceName, 'deviceName') || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Device ID:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.id, 'id') || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Operating System:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.operatingSystem || 'N/A'} {data?.osVersion || ''}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Manufacturer:
                          </Typography>
                          <Typography variant="inherit">{data?.manufacturer || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Model:
                          </Typography>
                          <Typography variant="inherit">{data?.model || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Serial Number:
                          </Typography>
                          <Typography variant="inherit">{data?.serialNumber || 'N/A'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Compliance State:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.complianceState, 'complianceState') || 'N/A'}
                          </Typography>
                        </Grid>
                        {data?.complianceGracePeriodExpirationDateTime && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="inherit" gutterBottom sx={{
                              color: "text.primary"
                            }}>
                              Grace period expires:
                            </Typography>
                            <Typography variant="inherit">
                              {new Date(data.complianceGracePeriodExpirationDateTime).toLocaleString()}
                            </Typography>
                          </Grid>
                        )}
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Enrolled Date:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.enrolledDateTime
                              ? new Date(data.enrolledDateTime).toLocaleString()
                              : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
                            Last Sync:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.lastSyncDateTime
                              ? new Date(data.lastSyncDateTime).toLocaleString()
                              : 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
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
                          <Typography variant="inherit" gutterBottom sx={{
                            color: "text.primary"
                          }}>
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
                            <Typography variant="inherit" gutterBottom sx={{
                              color: "text.primary"
                            }}>
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
                            <Typography variant="inherit" gutterBottom sx={{
                              color: "text.primary"
                            }}>
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
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3}>
                <Typography variant="h6">Policies</Typography>
                <CippBannerListCard
                  isFetching={policyReport.isFetching}
                  items={[
                    ...compliancePolicyItems,
                    ...configurationPolicyItems,
                    ...enrollmentPolicyItems,
                  ]}
                  isCollapsible={true}
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
                <Typography variant="h6">Action History</Typography>
                <CippBannerListCard
                  isFetching={deviceRequest.isFetching}
                  items={actionHistoryItems}
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
