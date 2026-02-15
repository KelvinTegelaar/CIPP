import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { useSettings } from "../../../../../hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "../../../../../api/ApiCall";
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
  Fingerprint,
} from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import { Grid } from "@mui/system";
import { Typography, Card, CardHeader, Divider, Chip } from "@mui/material";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { useEffect, useState } from "react";
import { PropertyList } from "../../../../../components/property-list";
import { PropertyListItem } from "../../../../../components/property-list-item";
import { CippHead } from "../../../../../components/CippComponents/CippHead";
import { Button } from "@mui/material";
import { getCippFormatting } from "../../../../../utils/get-cipp-formatting";

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

  // Get device info for title/subtitle
  const deviceRequest = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `deviceManagement/managedDevices/${deviceId}`,
      tenantFilter: router.query.tenantFilter ?? userSettingsDefaults.currentTenant,
    },
    queryKey: `ManagedDevice-${deviceId}`,
    waiting: waiting,
  });

  // Get Defender state
  const defenderRequest = ApiGetCall({
    url: "/api/ListDefenderState",
    data: {
      DeviceID: deviceId,
      TenantFilter: router.query.tenantFilter ?? userSettingsDefaults.currentTenant,
    },
    queryKey: `DefenderState-${deviceId}`,
    waiting: waiting,
  });

  // Handle response structure - ListGraphRequest may wrap single items in Results array
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

  // Handle Defender state response - API returns array
  const defenderData = defenderRequest.isSuccess && defenderRequest.data?.[0] ? defenderRequest.data[0] : null;
  const protectionState = defenderData?.windowsProtectionState;

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

  // Helper to format boolean values
  const formatBoolean = (value) => {
    if (value === null || value === undefined) return "Unknown";
    return value ? "Enabled" : "Disabled";
  };

  // Helper to get status color
  const getStatusColor = (value) => {
    if (value === null || value === undefined) return "default";
    return value ? "success" : "error";
  };

  // Helper to format device state
  const formatDeviceState = (state) => {
    if (!state) return "Unknown";
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={deviceRequest.isLoading || defenderRequest.isLoading}
    >
      {(deviceRequest.isLoading || defenderRequest.isLoading) && (
        <CippFormSkeleton layout={[2, 1, 2, 2]} />
      )}
      {deviceRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
          }}
        >
          <CippHead title={`${title} - Windows Defender Status`} />
          {defenderRequest.isSuccess && defenderData ? (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Card>
                  <CardHeader title="Windows Defender Protection State" />
                  <Divider />
                  <PropertyList>
                    <PropertyListItem
                      divider
                      label="Device State"
                      value={
                        <Chip
                          label={formatDeviceState(protectionState?.deviceState)}
                          color={
                            protectionState?.deviceState === "clean"
                              ? "success"
                              : protectionState?.deviceState === "fullScanPending" ||
                                  protectionState?.deviceState === "rebootPending" ||
                                  protectionState?.deviceState === "manualStepsPending"
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      }
                    />
                    <PropertyListItem
                      divider
                      label="Malware Protection"
                      value={
                        <Chip
                          label={formatBoolean(protectionState?.malwareProtectionEnabled)}
                          color={getStatusColor(protectionState?.malwareProtectionEnabled)}
                          size="small"
                        />
                      }
                    />
                    <PropertyListItem
                      divider
                      label="Real-Time Protection"
                      value={
                        <Chip
                          label={formatBoolean(protectionState?.realTimeProtectionEnabled)}
                          color={getStatusColor(protectionState?.realTimeProtectionEnabled)}
                          size="small"
                        />
                      }
                    />
                    <PropertyListItem
                      divider
                      label="Network Inspection System"
                      value={
                        <Chip
                          label={formatBoolean(protectionState?.networkInspectionSystemEnabled)}
                          color={getStatusColor(protectionState?.networkInspectionSystemEnabled)}
                          size="small"
                        />
                      }
                    />
                    <PropertyListItem
                      divider
                      label="Quick Scan Overdue"
                      value={
                        <Chip
                          label={formatBoolean(protectionState?.quickScanOverdue)}
                          color={protectionState?.quickScanOverdue ? "error" : "success"}
                          size="small"
                        />
                      }
                    />
                    <PropertyListItem
                      divider
                      label="Full Scan Overdue"
                      value={
                        <Chip
                          label={formatBoolean(protectionState?.fullScanOverdue)}
                          color={protectionState?.fullScanOverdue ? "error" : "success"}
                          size="small"
                        />
                      }
                    />
                    <PropertyListItem
                      divider
                      label="Signature Update Overdue"
                      value={
                        <Chip
                          label={formatBoolean(protectionState?.signatureUpdateOverdue)}
                          color={protectionState?.signatureUpdateOverdue ? "error" : "success"}
                          size="small"
                        />
                      }
                    />
                    <PropertyListItem
                      divider
                      label="Reboot Required"
                      value={
                        <Chip
                          label={formatBoolean(protectionState?.rebootRequired)}
                          color={protectionState?.rebootRequired ? "warning" : "success"}
                          size="small"
                        />
                      }
                    />
                    {protectionState?.lastReportedDateTime && (
                      <PropertyListItem
                        divider
                        label="Last Reported"
                        value={
                          <Typography variant="inherit">
                            {new Date(protectionState.lastReportedDateTime).toLocaleString()}
                            {" ("}
                            <CippTimeAgo data={protectionState.lastReportedDateTime} />
                            {")"}
                          </Typography>
                        }
                      />
                    )}
                  </PropertyList>
                </Card>
              </Grid>
            </Grid>
          ) : defenderRequest.isSuccess && !defenderData ? (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Card>
                  <CardHeader title="Windows Defender Protection State" />
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No Defender state information available for this device. This may indicate:
                    </Typography>
                    <ul>
                      <li>The device is not a Windows device</li>
                      <li>Windows Defender is not enabled on this device</li>
                      <li>The device has not reported its Defender state yet</li>
                    </ul>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Card>
                  <CardHeader title="Windows Defender Protection State" />
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Typography variant="body1" color="error">
                      Error loading Defender state information. Please try refreshing the page.
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
