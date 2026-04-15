import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Delete, PlayArrow, Schedule, Sync } from "@mui/icons-material";
import CippIntegrationSettings from "../../../components/CippIntegrations/CippIntegrationSettings";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "../../../hooks/use-settings";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { useRouter } from "next/router";
import extensions from "../../../data/Extensions.json";
import { useEffect, useState } from "react";
import { ArrowPathIcon, ArrowTopRightOnSquareIcon, BeakerIcon } from "@heroicons/react/24/outline";
import { SvgIcon } from "@mui/material";
import { CippApiResults } from "../../../components/CippComponents/CippApiResults";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";
import { CippTimeAgo } from "../../../components/CippComponents/CippTimeAgo";
import { useDialog } from "../../../hooks/use-dialog";
import CippPageCard from "../../../components/CippCards/CippPageCard";
import CippIntegrationTenantMapping from "../../../components/CippIntegrations/CippIntegrationTenantMapping";
import CippIntegrationFieldMapping from "../../../components/CippIntegrations/CippIntegrationFieldMapping";
import { CippCardTabPanel } from "../../../components/CippComponents/CippCardTabPanel";
import CippApiClientManagement from "../../../components/CippIntegrations/CippApiClientManagement";

function tabProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Page = () => {
  const router = useRouter();
  const settings = useSettings();
  const preferredTheme = settings.currentTheme?.value;
  const [value, setValue] = useState(0);

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const [testQuery, setTestQuery] = useState({ url: "", waiting: false, queryKey: "" });
  const actionTestResults = ApiGetCall({
    ...testQuery,
  });

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleIntegrationTest = () => {
    if (testQuery.waiting) {
      actionTestResults.refetch();
    }
    setTestQuery({
      url: "/api/ExecExtensionTest",
      data: {
        extensionName: router.query.id,
      },
      waiting: true,
      queryKey: `ExecExtensionTest-${router.query.id}`,
    });
  };

  const [syncQuery, setSyncQuery] = useState({ url: "", waiting: false, queryKey: "" });
  const actionSyncResults = ApiGetCall({
    ...syncQuery,
  });
  const clearHIBPKey = ApiPostCall({
    relatedQueryKeys: ["Integrations"],
  });
  const handleIntegrationSync = () => {
    setSyncQuery({
      url: "/api/ExecExtensionSync",
      data: {
        Extension: router.query.id,
      },
      waiting: true,
      queryKey: `ExecExtensionSync-${router.query.id}`,
    });
  };

  const formControl = useForm({
    mode: "onChange",
    defaultValues: integrations?.data,
  });

  const extension = extensions.find((extension) => extension.id === router.query.id) || {};

  const runAllNowDialog = useDialog();

  const ninjaCveSyncTasks = ApiGetCall({
    url: "/api/ListScheduledItems",
    data: {
      showHidden: true,
      Type: "Invoke-CIPPScheduledNinjaCveSync",
    },
    queryKey: "NinjaCveSyncTasks",
    enabled: router.query.id === "NinjaOne",
  });

  const ninjaTasks = Array.isArray(ninjaCveSyncTasks.data) ? ninjaCveSyncTasks.data : [];

  // Pick representative recurrence from first task — all tasks share the same recurrence
  const recurrenceDisplay = ninjaTasks.length > 0 ? ninjaTasks[0].Recurrence : null;
  const nextRun = ninjaTasks.length > 0 ? ninjaTasks[0].ScheduledTime : null;
  const lastRun = ninjaTasks.length > 0
    ? ninjaTasks.reduce((latest, t) => {
        if (!t.ExecutedTime) return latest;
        if (!latest) return t.ExecutedTime;
        return new Date(t.ExecutedTime) > new Date(latest) ? t.ExecutedTime : latest;
      }, null)
    : null;

  const NinjaCveSyncCard = () => (
    <Box sx={{ px: 3, pb: 3 }}>
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Schedule color="primary" />
              CVE Sync Schedule
            </Typography>
            <IconButton onClick={ninjaCveSyncTasks.refetch} size="small" title="Refresh">
              <Sync />
            </IconButton>
          </Box>

          {ninjaCveSyncTasks.isFetching ? (
            <Skeleton variant="rectangular" height={60} />
          ) : ninjaTasks.length === 0 ? (
            <Alert severity="info">
              No CVE sync tasks scheduled. Enable "Automated CVE Sync" above and save to create
              tasks for your mapped tenants.
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Chip
                  label="All mapped tenants"
                  color="success"
                  size="small"
                />
                {recurrenceDisplay && (
                  <Chip label={`Every ${recurrenceDisplay}`} size="small" variant="outlined" />
                )}
                {nextRun && (
                  <Typography variant="caption" color="text.secondary">
                    Next run: <CippTimeAgo data={nextRun} />
                  </Typography>
                )}
                {lastRun && (
                  <Typography variant="caption" color="text.secondary">
                    Last run: <CippTimeAgo data={lastRun} />
                  </Typography>
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                To change schedule settings, update the CVE Sync fields above and save. To remove,
                disable "Automated CVE Sync" above and save.
              </Typography>
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  onClick={runAllNowDialog.handleOpen}
                >
                  Run Now
                </Button>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  var logo = extension?.logo;
  if (preferredTheme === "dark" && extension?.logoDark) {
    logo = extension.logoDark;
  }

  useEffect(() => {
    if (integrations.isSuccess) {
      formControl.reset({
        ...integrations.data,
      });
      formControl.trigger();
    }
  }, [integrations.isSuccess]);

  return (
    <>
      {integrations.isLoading && (
        <CippPageCard title="Integrations" headerText={extension.headerText} hideTitleText={true}>
          <CardContent>
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={150} />
              <Skeleton variant="rectangular" height={150} />
              <Skeleton variant="rectangular" height={400} />
            </Stack>
          </CardContent>
        </CippPageCard>
      )}
      {integrations.isSuccess && extension && (
        <CippPageCard
          title={extension.name}
          backButtonTitle="Integrations"
          headerText={extension.headerText}
          hideTitleText={true}
          noTenantInHead={true}
        >
          <CardContent sx={{ pb: 0, mb: 0 }}>
            {logo && (
              <Box
                component="img"
                src={logo}
                alt={extension.name}
                sx={{ maxWidth: "50%", mx: "auto", maxHeight: "125px" }}
              />
            )}
            <Typography variant="body2" paragraph style={{ marginTop: "1em" }}>
              {extension.helpText}
            </Typography>
            {extension?.alertText && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {extension.alertText}
              </Alert>
            )}
            <Stack
              direction="row"
              spacing={2}
              sx={{ mb: 2, display: "flex", alignItems: "center" }}
            >
              {extension?.hideTestButton !== true && (
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleIntegrationTest()}
                    disabled={
                      actionTestResults?.isLoading ||
                      (extension?.SettingOptions?.find(
                        (setting) => setting?.name === `${extension.id}.Enabled`
                      ) &&
                        integrations?.data?.[extension.id]?.Enabled !== true)
                    }
                  >
                    <SvgIcon fontSize="small" style={{ marginRight: "8" }}>
                      <BeakerIcon />
                    </SvgIcon>
                    Test
                  </Button>
                </Box>
              )}
              {extension?.forceSyncButton && (
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleIntegrationSync()}
                    disabled={
                      actionSyncResults.isLoading ||
                      (extension?.SettingOptions?.find(
                        (setting) => setting?.name === `${extension.id}.Enabled`
                      ) &&
                        integrations?.data?.[extension.id]?.Enabled !== true)
                    }
                  >
                    <SvgIcon fontSize="small" style={{ marginRight: "8" }}>
                      <ArrowPathIcon />
                    </SvgIcon>
                    Force Sync
                  </Button>
                </Box>
              )}
              {extension?.id === "HIBP" && (
                <Box>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() =>
                      clearHIBPKey.mutate({
                        url: "/api/ExecExtensionClearHIBPKey",
                        data: {},
                      })
                    }
                    disabled={clearHIBPKey.isPending}
                  >
                    Clear API Key
                  </Button>
                </Box>
              )}
              {extension?.links && (
                <>
                  {extension.links.map((link, index) => (
                    <Box key={index}>
                      <Button href={link.url} target="_blank" rel="noreferrer" color="inherit">
                        <SvgIcon fontSize="small" style={{ marginRight: "8" }}>
                          <ArrowTopRightOnSquareIcon />
                        </SvgIcon>
                        {link.name}
                      </Button>
                    </Box>
                  ))}
                </>
              )}
            </Stack>
            <CippApiResults apiObject={actionTestResults} />
            <CippApiResults apiObject={actionSyncResults} />
            <CippApiResults apiObject={clearHIBPKey} />
          </CardContent>
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", px: "24px", m: "auto" }}>
              <Tabs value={value} onChange={handleTabChange} aria-label="Integration settings">
                <Tab label="Settings" {...tabProps(0)} />
                {extension?.mappingRequired && (
                  <Tab
                    label="Tenant Mapping"
                    {...tabProps(1)}
                    disabled={
                      extension?.SettingOptions?.find(
                        (setting) => setting?.name === `${extension.id}.Enabled`
                      ) && integrations?.data?.[extension.id]?.Enabled !== true
                    }
                  />
                )}
                {extension?.fieldMapping && (
                  <Tab
                    label="Field Mapping"
                    {...tabProps(2)}
                    disabled={
                      extension?.SettingOptions?.find(
                        (setting) => setting.name === `${extension.id}.Enabled`
                      ) && integrations?.data?.[extension.id]?.Enabled !== true
                    }
                  />
                )}
              </Tabs>
            </Box>
            <CippCardTabPanel value={value} index={0}>
              {extension?.id === "cippapi" ? (
                <CippApiClientManagement />
              ) : (
                <>
                  <CippIntegrationSettings />
                  {extension?.id === "NinjaOne" && <NinjaCveSyncCard />}
                </>
              )}
            </CippCardTabPanel>

            {extension?.mappingRequired && (
              <CippCardTabPanel value={value} index={1}>
                <CippIntegrationTenantMapping />
              </CippCardTabPanel>
            )}
            {extension?.fieldMapping && (
              <CippCardTabPanel value={value} index={2}>
                <CippIntegrationFieldMapping />
              </CippCardTabPanel>
            )}
          </Box>
        </CippPageCard>
      )}

      <CippApiDialog
        createDialog={runAllNowDialog}
        title="Run CVE Sync Now"
        api={{
          type: "POST",
          url: "/api/AddScheduledItem",
          data: ninjaTasks.length > 0 ? { RowKey: ninjaTasks[0].RowKey, RunNow: true } : {},
          confirmText: "Are you sure you want to run the NinjaOne CVE sync now for all mapped tenants?",
        }}
        relatedQueryKeys={["NinjaCveSyncTasks"]}
        onSuccess={() => setTimeout(() => ninjaCveSyncTasks.refetch(), 2000)}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
