import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { useSettings } from "../../../../hooks/use-settings";
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Stack,
  Typography,
  CircularProgress,
  Button,
  SvgIcon,
} from "@mui/material";
import { Sync, OpenInNew } from "@mui/icons-material";
import { Grid } from "@mui/system";
import { ApiGetCall } from "../../../../api/ApiCall";
import { CippHead } from "../../../../components/CippComponents/CippHead";
import { useDialog } from "../../../../hooks/use-dialog";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { CippQueueTracker } from "../../../../components/CippTable/CippQueueTracker";
import { CippPropertyListCard } from "../../../../components/CippCards/CippPropertyListCard";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { useState } from "react";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";

const statusColors = {
  enabled: "success",
  available: "success",
  unavailable: "error",
  unresponsive: "warning",
  notSetUp: "default",
  error: "error",
};

const statusLabels = {
  enabled: "Enabled",
  available: "Available",
  unavailable: "Unavailable",
  unresponsive: "Unresponsive",
  notSetUp: "Not Set Up",
  error: "Error",
};

const SingleTenantView = ({ tenant }) => {
  const syncDialog = useDialog();
  const [syncQueueId, setSyncQueueId] = useState(null);

  const tenantList = ApiGetCall({
    url: "/api/listTenants",
    queryKey: "TenantSelector",
  });

  const tenantId = tenantList.data?.find(
    (t) => t.defaultDomainName === tenant
  )?.customerId;

  const { data, isFetching } = ApiGetCall({
    url: "/api/ListMDEOnboarding",
    queryKey: `MDEOnboarding-${tenant}`,
    data: { tenantFilter: tenant, UseReportDB: true },
    waiting: true,
  });

  const item = Array.isArray(data) ? data[0] : data;
  const status = item?.partnerState || "Unknown";

  const platformItems = [
    {
      label: "Windows",
      value: getCippFormatting(item?.windowsEnabled, "windowsEnabled"),
    },
    {
      label: "iOS",
      value: getCippFormatting(item?.iosEnabled, "iosEnabled"),
    },
    {
      label: "Android",
      value: getCippFormatting(item?.androidEnabled, "androidEnabled"),
    },
    {
      label: "macOS",
      value: getCippFormatting(item?.macEnabled, "macEnabled"),
    },
  ];

  const mamItems = [
    {
      label: "iOS MAM",
      value: getCippFormatting(
        item?.iosMobileApplicationManagementEnabled,
        "iosMobileApplicationManagementEnabled"
      ),
    },
    {
      label: "Android MAM",
      value: getCippFormatting(
        item?.androidMobileApplicationManagementEnabled,
        "androidMobileApplicationManagementEnabled"
      ),
    },
    {
      label: "Windows MAM",
      value: getCippFormatting(
        item?.windowsMobileApplicationManagementEnabled,
        "windowsMobileApplicationManagementEnabled"
      ),
    },
    {
      label: "MDE Attach",
      value: getCippFormatting(
        item?.microsoftDefenderForEndpointAttachEnabled,
        "microsoftDefenderForEndpointAttachEnabled"
      ),
    },
  ];

  const dataCollectionItems = [
    {
      label: "Block iOS on missing partner data",
      value: getCippFormatting(
        item?.iosDeviceBlockedOnMissingPartnerData,
        "iosDeviceBlockedOnMissingPartnerData"
      ),
    },
    {
      label: "Block Android on missing partner data",
      value: getCippFormatting(
        item?.androidDeviceBlockedOnMissingPartnerData,
        "androidDeviceBlockedOnMissingPartnerData"
      ),
    },
    {
      label: "Block Windows on missing partner data",
      value: getCippFormatting(
        item?.windowsDeviceBlockedOnMissingPartnerData,
        "windowsDeviceBlockedOnMissingPartnerData"
      ),
    },
    {
      label: "Block macOS on missing partner data",
      value: getCippFormatting(
        item?.macDeviceBlockedOnMissingPartnerData,
        "macDeviceBlockedOnMissingPartnerData"
      ),
    },
    {
      label: "Block unsupported OS versions",
      value: getCippFormatting(
        item?.partnerUnsupportedOsVersionBlocked,
        "partnerUnsupportedOsVersionBlocked"
      ),
    },
    {
      label: "Unresponsiveness threshold (days)",
      value:
        item?.partnerUnresponsivenessThresholdInDays ??
        getCippFormatting(null, "partnerUnresponsivenessThresholdInDays"),
    },
    {
      label: "Collect iOS app metadata",
      value: getCippFormatting(
        item?.allowPartnerToCollectIOSApplicationMetadata,
        "allowPartnerToCollectIOSApplicationMetadata"
      ),
    },
    {
      label: "Collect iOS personal app metadata",
      value: getCippFormatting(
        item?.allowPartnerToCollectIOSPersonalApplicationMetadata,
        "allowPartnerToCollectIOSPersonalApplicationMetadata"
      ),
    },
    {
      label: "Collect iOS certificate metadata",
      value: getCippFormatting(
        item?.allowPartnerToCollectIosCertificateMetadata,
        "allowPartnerToCollectIosCertificateMetadata"
      ),
    },
    {
      label: "Collect iOS personal certificate metadata",
      value: getCippFormatting(
        item?.allowPartnerToCollectIosPersonalCertificateMetadata,
        "allowPartnerToCollectIosPersonalCertificateMetadata"
      ),
    },
  ];

  return (
    <>
      <CippHead title="MDE Onboarding Status" />
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Stack spacing={3}>
          <Card>
            <CardHeader
              title="Microsoft Defender for Endpoint - Onboarding Status"
              action={
                <Stack direction="row" spacing={1} alignItems="center">
                  <CippQueueTracker
                    queueId={syncQueueId}
                    queryKey={`MDEOnboarding-${tenant}`}
                    title="MDE Onboarding Sync"
                  />
                  <Button
                    startIcon={
                      <SvgIcon fontSize="small">
                        <Sync />
                      </SvgIcon>
                    }
                    size="small"
                    onClick={syncDialog.handleOpen}
                  >
                    Sync
                  </Button>
                </Stack>
              }
            />
            <CardContent>
              {isFetching ? (
                <CircularProgress />
              ) : (
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body1">Status:</Typography>
                    <Chip
                      label={statusLabels[status] || status}
                      color={statusColors[status] || "default"}
                      size="medium"
                    />
                  </Stack>
                  {item?.lastHeartbeatDateTime && (
                    <Typography variant="body2" color="text.secondary">
                      Last heartbeat:{" "}
                      {new Date(item.lastHeartbeatDateTime).toLocaleString()}
                    </Typography>
                  )}
                  {item?.CacheTimestamp && (
                    <Typography variant="caption" color="text.secondary">
                      Last synced: {new Date(item.CacheTimestamp).toLocaleString()}
                    </Typography>
                  )}
                  {item?.error && (
                    <Typography variant="body2" color="error">
                      {item.error}
                    </Typography>
                  )}
                  {tenantId && status !== "enabled" && status !== "available" && (
                    <Button
                      variant="contained"
                      startIcon={<OpenInNew />}
                      href={`https://security.microsoft.com/securitysettings/endpoints/onboarding?tid=${tenantId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ alignSelf: "flex-start" }}
                    >
                      Start Onboarding
                    </Button>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>

          {!isFetching && item && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <CippPropertyListCard
                  title="Platform Support"
                  propertyItems={platformItems}
                  isFetching={isFetching}
                  showDivider={false}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <CippPropertyListCard
                  title="App Management & Attach"
                  propertyItems={mamItems}
                  isFetching={isFetching}
                  showDivider={false}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 12, lg: 4 }}>
                <CippPropertyListCard
                  title="Data Collection & Compliance"
                  propertyItems={dataCollectionItems}
                  isFetching={isFetching}
                  showDivider={false}
                />
              </Grid>
            </Grid>
          )}
        </Stack>
      </Container>
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync MDE Onboarding Status"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run MDE onboarding status sync for ${tenant}? This will update the data immediately.`,
          relatedQueryKeys: [`MDEOnboarding-${tenant}`],
          data: {
            Name: "MDEOnboarding",
          },
          onSuccess: (result) => {
            if (result?.Metadata?.QueueId) {
              setSyncQueueId(result.Metadata.QueueId);
            }
          },
        }}
      />
    </>
  );
};

const Page = () => {
  const currentTenant = useSettings().currentTenant;
  const isAllTenants = currentTenant === "AllTenants";

  const reportDB = useCippReportDB({
    apiUrl: "/api/ListMDEOnboarding",
    queryKey: "MDEOnboarding",
    cacheName: "MDEOnboarding",
    syncTitle: "Sync MDE Onboarding Status",
    allowToggle: false,
    defaultCached: true,
  });

  if (!isAllTenants) {
    return <SingleTenantView tenant={currentTenant} />;
  }

  return (
    <>
      <CippTablePage
        title="MDE Onboarding Status"
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={[
          "Tenant",
          "partnerState",
          "lastHeartbeatDateTime",
          "microsoftDefenderForEndpointAttachEnabled",
          "windowsEnabled",
          "iosEnabled",
          "androidEnabled",
          "macEnabled",
          "iosMobileApplicationManagementEnabled",
          "androidMobileApplicationManagementEnabled",
          "windowsMobileApplicationManagementEnabled",
          "partnerUnresponsivenessThresholdInDays",
          "CacheTimestamp",
        ]}
        cardButton={reportDB.controls}
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
