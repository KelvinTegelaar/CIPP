import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { useSettings } from "../../../../../hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall, ApiPostCall } from "../../../../../api/ApiCall";
import CippFormSkeleton from "../../../../../components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
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
  RestartAlt,
  LocationOn,
  Password,
  PasswordOutlined,
  Key,
  Edit,
  FindInPage,
  Shield,
  Archive,
  AutoMode,
  Recycling,
  ManageAccounts,
  Fingerprint,
  Group,
} from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import { Grid } from "@mui/system";
import { SvgIcon, Typography, Card, CardHeader, Divider } from "@mui/material";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { useEffect, useState, useRef } from "react";
import { PropertyList } from "../../../../../components/property-list";
import { PropertyListItem } from "../../../../../components/property-list-item";
import { CippDataTable } from "../../../../../components/CippTable/CippDataTable";
import { CippHead } from "../../../../../components/CippComponents/CippHead";
import { Button } from "@mui/material";
import { getCippFormatting } from "../../../../../utils/get-cipp-formatting";
import { PencilIcon, EyeIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { deviceId } = router.query;
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (deviceId) {
      setWaiting(true);
    }
  }, [deviceId]);

  const deviceRequest = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `deviceManagement/managedDevices/${deviceId}`,
      tenantFilter: router.query.tenantFilter ?? userSettingsDefaults.currentTenant,
    },
    queryKey: `ManagedDevice-${deviceId}`,
    waiting: waiting,
  });

  const deviceBulkRequest = ApiPostCall({
    urlFromData: true,
  });

  // Handle response structure - ListGraphRequest may wrap single items in Results array
  // Try Results array first, then Results as object, then data directly
  let deviceData = null;
  if (deviceRequest.isSuccess && deviceRequest.data) {
    if (Array.isArray(deviceRequest.data.Results)) {
      deviceData = deviceRequest.data.Results[0];
    } else if (deviceRequest.data.Results) {
      deviceData = deviceRequest.data.Results;
    } else {
      deviceData = deviceRequest.data;
    }
  }

  function refreshFunction() {
    if (!deviceId) return;
    const requests = [
      {
        id: "deviceCompliance",
        url: `/deviceManagement/managedDevices/${deviceId}/deviceCompliancePolicyStates`,
        method: "GET",
      },
      {
        id: "deviceConfiguration",
        url: `/deviceManagement/managedDevices/${deviceId}/deviceConfigurationStates`,
        method: "GET",
      },
      {
        id: "detectedApps",
        url: `/deviceManagement/managedDevices/${deviceId}/detectedApps`,
        method: "GET",
      },
      {
        id: "users",
        url: `/deviceManagement/managedDevices/${deviceId}/users`,
        method: "GET",
      },
      {
        id: "deviceMemberOf",
        url: `/devices/${deviceId}/transitiveMemberOf/microsoft.graph.group`,
        method: "GET",
      },
    ];

    deviceBulkRequest.mutate({
      url: "/api/ListGraphBulkRequest",
      data: {
        Requests: requests,
        tenantFilter: userSettingsDefaults.currentTenant,
      },
    });
  }

  useEffect(() => {
    if (deviceId && userSettingsDefaults.currentTenant && !deviceBulkRequest.isSuccess) {
      refreshFunction();
    }
  }, [deviceId, userSettingsDefaults.currentTenant, deviceBulkRequest.isSuccess]);

  const bulkData = deviceBulkRequest?.data?.data ?? [];
  const deviceComplianceData = bulkData?.find((item) => item.id === "deviceCompliance");
  const deviceConfigurationData = bulkData?.find((item) => item.id === "deviceConfiguration");
  const detectedAppsData = bulkData?.find((item) => item.id === "detectedApps");
  const usersData = bulkData?.find((item) => item.id === "users");
  const deviceMemberOfData = bulkData?.find((item) => item.id === "deviceMemberOf");

  const deviceCompliance = deviceComplianceData?.body?.value || [];
  const deviceConfiguration = deviceConfigurationData?.body?.value || [];
  const detectedApps = detectedAppsData?.body?.value || [];
  const users = usersData?.body?.value || [];
  const deviceMemberOf = deviceMemberOfData?.body?.value || [];

  // Helper function to format bytes to GB (matching getCippFormatting pattern)
  const formatBytesToGB = (bytes) => {
    if (!bytes || bytes === 0) return "N/A";
    const gb = bytes / 1024 / 1024 / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  // Set the title and subtitle for the layout
  const title = deviceRequest.isSuccess ? deviceData?.deviceName : "Loading...";

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
          icon: <Launch style={{ color: "#667085" }} />,
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
    : [];

  const data = deviceData;

  // Device actions from the devices table page
  const deviceActions = [
    {
      label: "View in Intune",
      link: `https://intune.microsoft.com/${userSettingsDefaults.currentTenant}/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/${deviceId}`,
      color: "info",
      icon: <Launch />,
      target: "_blank",
      multiPost: false,
      external: true,
    },
    {
      label: "Change Primary User",
      type: "POST",
      icon: <ManageAccounts />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "!users",
      },
      fields: [
        {
          type: "autoComplete",
          name: "user",
          label: "Select User",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/ListGraphRequest",
            data: {
              Endpoint: "users",
              $select: "id,displayName,userPrincipalName",
              $top: 999,
              $count: true,
            },
            queryKey: "ListUsersAutoComplete",
            dataKey: "Results",
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: "id",
            addedField: {
              userPrincipalName: "userPrincipalName",
            },
            showRefresh: true,
          },
        },
      ],
      confirmText: "Select the User to set as the primary user for [deviceName]",
    },
    {
      label: "Rename Device",
      type: "POST",
      icon: <Edit />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "setDeviceName",
      },
      confirmText: "Enter the new name for the device",
      fields: [
        {
          type: "textField",
          name: "input",
          label: "New Device Name",
          required: true,
        },
      ],
    },
    {
      label: "Sync Device",
      type: "POST",
      icon: <Sync />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "syncDevice",
      },
      confirmText: "Are you sure you want to sync [deviceName]?",
    },
    {
      label: "Reboot Device",
      type: "POST",
      icon: <RestartAlt />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "rebootNow",
      },
      confirmText: "Are you sure you want to reboot [deviceName]?",
    },
    {
      label: "Locate Device",
      type: "POST",
      icon: <LocationOn />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "locateDevice",
      },
      confirmText: "Are you sure you want to locate [deviceName]?",
    },
    {
      label: "Retrieve LAPS password",
      type: "POST",
      icon: <Password />,
      url: "/api/ExecGetLocalAdminPassword",
      data: {
        GUID: "azureADDeviceId",
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText: "Are you sure you want to retrieve the local admin password for [deviceName]?",
    },
    {
      label: "Rotate Local Admin Password",
      type: "POST",
      icon: <PasswordOutlined />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "RotateLocalAdminPassword",
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText: "Are you sure you want to rotate the password for [deviceName]?",
    },
    {
      label: "Retrieve BitLocker Keys",
      type: "POST",
      icon: <Key />,
      url: "/api/ExecGetRecoveryKey",
      data: {
        GUID: "azureADDeviceId",
        RecoveryKeyType: "!BitLocker",
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText: "Are you sure you want to retrieve the BitLocker keys for [deviceName]?",
    },
    {
      label: "Retrieve FileVault Key",
      type: "POST",
      icon: <Security />,
      url: "/api/ExecGetRecoveryKey",
      data: {
        GUID: "id",
        RecoveryKeyType: "!FileVault",
      },
      condition: (row) => row.operatingSystem === "macOS",
      confirmText: "Are you sure you want to retrieve the FileVault key for [deviceName]?",
    },
    {
      label: "Reset Passcode",
      type: "POST",
      icon: <PasswordOutlined />,
      url: "/api/ExecDevicePasscodeAction",
      data: {
        GUID: "id",
        Action: "resetPasscode",
      },
      condition: (row) => row.operatingSystem === "Android",
      confirmText:
        "Are you sure you want to reset the passcode for [deviceName]? A new passcode will be generated and displayed.",
    },
    {
      label: "Remove Passcode",
      type: "POST",
      icon: <Password />,
      url: "/api/ExecDevicePasscodeAction",
      data: {
        GUID: "id",
        Action: "resetPasscode",
      },
      condition: (row) => row.operatingSystem === "iOS",
      confirmText:
        "Are you sure you want to remove the passcode from [deviceName]? This will remove the device passcode requirement.",
    },
    {
      label: "Windows Defender Full Scan",
      type: "POST",
      icon: <Security />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "WindowsDefenderScan",
        quickScan: false,
      },
      confirmText: "Are you sure you want to perform a full scan on [deviceName]?",
    },
    {
      label: "Windows Defender Quick Scan",
      type: "POST",
      icon: <FindInPage />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "WindowsDefenderScan",
        quickScan: true,
      },
      confirmText: "Are you sure you want to perform a quick scan on [deviceName]?",
    },
    {
      label: "Update Windows Defender",
      type: "POST",
      icon: <Shield />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "windowsDefenderUpdateSignatures",
      },
      confirmText:
        "Are you sure you want to update the Windows Defender signatures for [deviceName]?",
    },
    {
      label: "Generate logs and ship to MEM",
      type: "POST",
      icon: <Archive />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "createDeviceLogCollectionRequest",
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText:
        "Are you sure you want to generate logs for device [deviceName] and ship these to MEM?",
    },
    {
      label: "Fresh Start (Remove user data)",
      type: "POST",
      icon: <RestartAlt />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "cleanWindowsDevice",
        keepUserData: false,
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText: "Are you sure you want to Fresh Start [deviceName]?",
    },
    {
      label: "Fresh Start (Do not remove user data)",
      type: "POST",
      icon: <RestartAlt />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "cleanWindowsDevice",
        keepUserData: true,
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText: "Are you sure you want to Fresh Start [deviceName]?",
    },
    {
      label: "Wipe Device, keep enrollment data",
      type: "POST",
      icon: <RestartAlt />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "cleanWindowsDevice",
        keepUserData: false,
        keepEnrollmentData: true,
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText: "Are you sure you want to wipe [deviceName], and retain enrollment data?",
    },
    {
      label: "Wipe Device, remove enrollment data",
      type: "POST",
      icon: <RestartAlt />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "cleanWindowsDevice",
        keepUserData: false,
        keepEnrollmentData: false,
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText: "Are you sure you want to wipe [deviceName], and remove enrollment data?",
    },
    {
      label: "Wipe Device, keep enrollment data, and continue at powerloss",
      type: "POST",
      icon: <RestartAlt />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "cleanWindowsDevice",
        keepEnrollmentData: true,
        keepUserData: false,
        useProtectedWipe: true,
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText:
        "Are you sure you want to wipe [deviceName]? This will retain enrollment data. Continuing at powerloss may cause boot issues if wipe is interrupted.",
    },
    {
      label: "Wipe Device, remove enrollment data, and continue at powerloss",
      type: "POST",
      icon: <RestartAlt />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "cleanWindowsDevice",
        keepEnrollmentData: false,
        keepUserData: false,
        useProtectedWipe: true,
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText:
        "Are you sure you want to wipe [deviceName]? This will also remove enrollment data. Continuing at powerloss may cause boot issues if wipe is interrupted.",
    },
    {
      label: "Autopilot Reset",
      type: "POST",
      icon: <AutoMode />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "wipe",
        keepUserData: "false",
        keepEnrollmentData: "true",
      },
      condition: (row) => row.operatingSystem === "Windows",
      confirmText: "Are you sure you want to Autopilot Reset [deviceName]?",
    },
    {
      label: "Delete device",
      type: "POST",
      icon: <Recycling />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "delete",
      },
      confirmText: "Are you sure you want to delete [deviceName]?",
    },
    {
      label: "Retire device",
      type: "POST",
      icon: <Recycling />,
      url: "/api/ExecDeviceAction",
      data: {
        GUID: "id",
        Action: "retire",
      },
      confirmText: "Are you sure you want to retire [deviceName]?",
    },
  ];

  // Get device icon based on OS
  const getDeviceIcon = () => {
    if (!data?.operatingSystem) return <Computer />;
    const os = data.operatingSystem.toLowerCase();
    if (os.includes("android")) return <PhoneAndroid />;
    if (os.includes("ios") || os.includes("iphone") || os.includes("ipad")) return <PhoneIphone />;
    if (os.includes("windows") || os.includes("macos")) return <Laptop />;
    return <Computer />;
  };

  // Prepare compliance policy items
  let compliancePolicyItems = [];
  if (deviceCompliance.length > 0) {
    compliancePolicyItems = deviceCompliance.map((policy, index) => ({
      id: index,
      cardLabelBox: {
        cardLabelBoxHeader: policy.complianceState === "compliant" ? <CheckCircle /> : <Warning />,
      },
      text: policy.displayName || "Unknown Policy",
      subtext: `State: ${policy.complianceState || "Unknown"}`,
      statusColor: policy.complianceState === "compliant" ? "success.main" : "warning.main",
      statusText: policy.complianceState || "Unknown",
      propertyItems: [
        {
          label: "Setting Count",
          value: policy.settingCount || "N/A",
        },
        {
          label: "Setting States",
          value: policy.settingStates?.length || 0,
        },
      ],
    }));
  } else if (deviceComplianceData?.status !== 200) {
    compliancePolicyItems = [
      {
        id: 1,
        cardLabelBox: "!",
        text: "Error loading compliance policies",
        subtext: deviceComplianceData?.error?.message || "Unknown error",
        statusColor: "error.main",
        statusText: "Error",
        propertyItems: [],
      },
    ];
  } else {
    compliancePolicyItems = [
      {
        id: 1,
        cardLabelBox: "-",
        text: "No compliance policies available",
        subtext: "This device does not have any compliance policies assigned.",
        statusColor: "warning.main",
        statusText: "No Policies",
        propertyItems: [],
      },
    ];
  }

  // Prepare configuration policy items
  let configurationPolicyItems = [];
  if (deviceConfiguration.length > 0) {
    configurationPolicyItems = deviceConfiguration.map((policy, index) => ({
      id: index,
      cardLabelBox: {
        cardLabelBoxHeader: policy.state === "compliant" ? <CheckCircle /> : <Warning />,
      },
      text: policy.displayName || "Unknown Policy",
      subtext: `State: ${policy.state || "Unknown"}`,
      statusColor: policy.state === "compliant" ? "success.main" : "warning.main",
      statusText: policy.state || "Unknown",
      propertyItems: [
        {
          label: "Setting Count",
          value: policy.settingCount || "N/A",
        },
        {
          label: "Setting States",
          value: policy.settingStates?.length || 0,
        },
      ],
    }));
  } else if (deviceConfigurationData?.status !== 200) {
    configurationPolicyItems = [
      {
        id: 1,
        cardLabelBox: "!",
        text: "Error loading configuration policies",
        subtext: deviceConfigurationData?.error?.message || "Unknown error",
        statusColor: "error.main",
        statusText: "Error",
        propertyItems: [],
      },
    ];
  } else {
    configurationPolicyItems = [
      {
        id: 1,
        cardLabelBox: "-",
        text: "No configuration policies available",
        subtext: "This device does not have any configuration policies assigned.",
        statusColor: "warning.main",
        statusText: "No Policies",
        propertyItems: [],
      },
    ];
  }

  // Prepare detected apps items
  let detectedAppsItems = [];
  if (detectedApps.length > 0) {
    detectedAppsItems = [
      {
        id: 1,
        cardLabelBox: {
          cardLabelBoxHeader: <CheckCircle />,
        },
        text: "Detected Applications",
        subtext: `${detectedApps.length} application(s) detected`,
        statusText: `${detectedApps.length} App(s)`,
        statusColor: "info.main",
        table: {
          title: "Detected Applications",
          hideTitle: true,
          data: detectedApps,
          simpleColumns: ["displayName", "version", "platform"],
          refreshFunction: refreshFunction,
        },
      },
    ];
  } else if (detectedAppsData?.status !== 200) {
    detectedAppsItems = [
      {
        id: 1,
        cardLabelBox: "!",
        text: "Error loading detected applications",
        subtext: detectedAppsData?.error?.message || "Unknown error",
        statusColor: "error.main",
        statusText: "Error",
        propertyItems: [],
      },
    ];
  } else {
    detectedAppsItems = [
      {
        id: 1,
        cardLabelBox: "-",
        text: "No detected applications",
        subtext: "No applications have been detected on this device.",
        statusColor: "warning.main",
        statusText: "No Apps",
        propertyItems: [],
      },
    ];
  }

  // Prepare users items
  let usersItems = [];
  if (users.length > 0) {
    usersItems = [
      {
        id: 1,
        cardLabelBox: {
          cardLabelBoxHeader: <CheckCircle />,
        },
        text: "Device Users",
        subtext: `${users.length} user(s) associated with this device`,
        statusText: `${users.length} User(s)`,
        statusColor: "info.main",
        table: {
          title: "Device Users",
          hideTitle: true,
          data: users,
          simpleColumns: ["displayName", "userPrincipalName", "mail"],
          refreshFunction: refreshFunction,
          actions: [
            {
              icon: <EyeIcon />,
              label: "View User",
              link: `/identity/administration/users/user?userId=[id]&tenantFilter=${userSettingsDefaults.currentTenant}`,
            },
          ],
        },
      },
    ];
  } else if (usersData?.status !== 200) {
    usersItems = [
      {
        id: 1,
        cardLabelBox: "!",
        text: "Error loading device users",
        subtext: usersData?.error?.message || "Unknown error",
        statusColor: "error.main",
        statusText: "Error",
        propertyItems: [],
      },
    ];
  } else {
    usersItems = [
      {
        id: 1,
        cardLabelBox: "-",
        text: "No users associated",
        subtext: "No users are currently associated with this device.",
        statusColor: "warning.main",
        statusText: "No Users",
        propertyItems: [],
      },
    ];
  }

  // Prepare group membership items
  const groupMembershipItems = deviceMemberOf.length > 0
    ? [
        {
          id: 1,
          cardLabelBox: {
            cardLabelBoxHeader: <Group />,
          },
          text: "Groups",
          subtext: "List of groups the device is a member of",
          statusText: ` ${
            deviceMemberOf?.filter((item) => item?.["@odata.type"] === "#microsoft.graph.group")
              .length
          } Group(s)`,
          statusColor: "info.main",
          table: {
            title: "Group Memberships",
            hideTitle: true,
            actions: [
              {
                icon: <PencilIcon />,
                label: "Edit Group",
                link: "/identity/administration/groups/edit?groupId=[id]&groupType=[calculatedGroupType]",
              },
            ],
            data: deviceMemberOf?.filter(
              (item) => item?.["@odata.type"] === "#microsoft.graph.group",
            ),
            refreshFunction: refreshFunction,
            simpleColumns: ["displayName", "groupTypes", "securityEnabled", "mailEnabled"],
          },
        },
      ]
    : deviceMemberOfData?.status !== 200
    ? [
        {
          id: 1,
          cardLabelBox: "!",
          text: "Error loading device group memberships",
          subtext: deviceMemberOfData?.error?.message || "Unknown error",
          statusColor: "error.main",
          statusText: "Error",
          propertyItems: [],
        },
      ]
    : [
        {
          id: 1,
          cardLabelBox: "-",
          text: "No group memberships",
          subtext: "This device is not a member of any groups.",
          statusColor: "warning.main",
          statusText: "No Groups",
          propertyItems: [],
        },
      ];

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
                <CardHeader title="Device Details" />
                <Divider />
                <PropertyList>
                  <PropertyListItem
                    divider
                    value={
                      <Stack alignItems="center" spacing={1}>
                        <SvgIcon sx={{ fontSize: 64 }}>{getDeviceIcon()}</SvgIcon>
                        <Typography variant="h6">{data?.deviceName || "N/A"}</Typography>
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
                            {getCippFormatting(data?.deviceName, "deviceName") || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Device ID:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.id, "id") || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Operating System:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.operatingSystem || "N/A"} {data?.osVersion || ""}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Manufacturer:
                          </Typography>
                          <Typography variant="inherit">{data?.manufacturer || "N/A"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Model:
                          </Typography>
                          <Typography variant="inherit">{data?.model || "N/A"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Serial Number:
                          </Typography>
                          <Typography variant="inherit">{data?.serialNumber || "N/A"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Compliance State:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.complianceState, "complianceState") || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Enrolled Date:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.enrolledDateTime
                              ? new Date(data.enrolledDateTime).toLocaleString()
                              : "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Last Sync:
                          </Typography>
                          <Typography variant="inherit">
                            {data?.lastSyncDateTime
                              ? new Date(data.lastSyncDateTime).toLocaleString()
                              : "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Owner Type:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.managedDeviceOwnerType, "managedDeviceOwnerType") ||
                              "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="inherit" color="text.primary" gutterBottom>
                            Enrollment Type:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(data?.deviceEnrollmentType, "deviceEnrollmentType") ||
                              "N/A"}
                          </Typography>
                        </Grid>
                        {data?.userPrincipalName && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="inherit" color="text.primary" gutterBottom>
                              Primary User:
                            </Typography>
                            <Typography variant="inherit">
                              {getCippFormatting(data?.userPrincipalName, "userPrincipalName") || "N/A"}
                            </Typography>
                          </Grid>
                        )}
                        {data?.totalStorageSpaceInBytes && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="inherit" color="text.primary" gutterBottom>
                              Storage:
                            </Typography>
                            <Typography variant="inherit">
                              {formatBytesToGB(data.freeStorageSpaceInBytes || 0)} free of{" "}
                              {formatBytesToGB(data.totalStorageSpaceInBytes)}
                              {data.freeStorageSpaceInBytes &&
                                data.totalStorageSpaceInBytes &&
                                ` (${Math.round(
                                  ((data.totalStorageSpaceInBytes - data.freeStorageSpaceInBytes) /
                                    data.totalStorageSpaceInBytes) *
                                    100,
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
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
