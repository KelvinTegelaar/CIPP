import {
  Alert,
  Box,
  Button,
  CardContent,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CippIntegrationSettings from "/src/components/CippIntegrations/CippIntegrationSettings";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import extensions from "/src/data/Extensions.json";
import { useEffect } from "react";
import { ArrowPathIcon, ArrowTopRightOnSquareIcon, BeakerIcon } from "@heroicons/react/24/outline";
import { SvgIcon } from "@mui/material";
import { useState } from "react";
import { CippApiResults } from "/src/components/CippComponents/CippApiResults";
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
                    disabled={actionTestResults?.isLoading}
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
                    disabled={actionSyncResults.isLoading}
                  >
                    <SvgIcon fontSize="small" style={{ marginRight: "8" }}>
                      <ArrowPathIcon />
                    </SvgIcon>
                    Force Sync
                  </Button>
                </Box>
              )}
              {extension?.links && (
                <>
                  {extension.links.map((link, index) => (
                    <Box>
                      <Button
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        color="inherit"
                        key={index}
                      >
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
                <CippIntegrationSettings />
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
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
