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
  IconButton,
  Tooltip,
} from "@mui/material";
import { Sync, Info, OpenInNew } from "@mui/icons-material";
import { ApiGetCall } from "../../../../api/ApiCall";
import { CippHead } from "../../../../components/CippComponents/CippHead";
import { useDialog } from "../../../../hooks/use-dialog";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { CippQueueTracker } from "../../../../components/CippTable/CippQueueTracker";
import { useState } from "react";

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

  return (
    <>
      <CippHead title="MDE Onboarding Status" />
      <Container maxWidth="lg" sx={{ mt: 2 }}>
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
                <Tooltip title="This report displays cached data from the CIPP reporting database. Click the Sync button to update the cache for the current tenant.">
                  <IconButton size="small">
                    <Info fontSize="small" />
                  </IconButton>
                </Tooltip>
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
  const syncDialog = useDialog();
  const [syncQueueId, setSyncQueueId] = useState(null);

  if (!isAllTenants) {
    return <SingleTenantView tenant={currentTenant} />;
  }

  const pageActions = [
    <Stack key="actions-stack" direction="row" spacing={1} alignItems="center">
      <CippQueueTracker
        queueId={syncQueueId}
        queryKey="MDEOnboarding-AllTenants"
        title="MDE Onboarding Sync"
      />
      <Tooltip title="This report displays cached data from the CIPP reporting database. Click the Sync button to update the cache for all tenants.">
        <IconButton size="small">
          <Info fontSize="small" />
        </IconButton>
      </Tooltip>
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
    </Stack>,
  ];

  return (
    <>
      <CippTablePage
        title="MDE Onboarding Status"
        apiUrl="/api/ListMDEOnboarding"
        apiData={{ UseReportDB: true }}
        queryKey="MDEOnboarding-AllTenants"
        simpleColumns={["Tenant", "partnerState", "CacheTimestamp"]}
        cardButton={pageActions}
      />
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync MDE Onboarding Status"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText:
            "Run MDE onboarding status sync for all tenants? This may take a while.",
          relatedQueryKeys: ["MDEOnboarding-AllTenants"],
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

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;