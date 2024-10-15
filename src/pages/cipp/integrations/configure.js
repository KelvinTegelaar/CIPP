import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
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

const Page = () => {
  const router = useRouter();
  const settings = useSettings();
  const preferredTheme = settings.currentTheme?.value;

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
  });

  const [testQuery, setTestQuery] = useState({ url: "", waiting: false, queryKey: "" });
  const actionTestResults = ApiGetCall({
    ...testQuery,
  });
  const handleIntegrationTest = () => {
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

  const extension = extensions.find((extension) => extension.id === router.query.id);

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
      {integrations.isSuccess && extension ? (
        <CippFormPage
          queryKey={"Integrations"}
          formControl={formControl}
          formPageType="Integration"
          title={extension.name}
          backButtonTitle="Integrations"
          postUrl="/api/ExecExtensionsConfig"
        >
          <Box component="img" src={logo} sx={{ mx: "auto", display: "block", width: "50%" }} />
          <Typography variant="body2" paragraph style={{ marginTop: "1em" }}>
            {extension.helpText}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            {extension?.hideTestButton !== true && (
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
            )}
            {extension?.forceSyncButton && (
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
            )}
            {extension?.links && (
              <>
                {extension.links.map((link, index) => (
                  <Button href={link.url} target="_blank" rel="noreferrer" color="inherit">
                    <SvgIcon fontSize="small" style={{ marginRight: "8" }}>
                      <ArrowTopRightOnSquareIcon />
                    </SvgIcon>
                    {link.name}
                  </Button>
                ))}
              </>
            )}
          </Stack>
          <Stack direction="column" spacing={0.5}>
            <CippApiResults apiObject={actionTestResults} />
            <CippApiResults apiObject={actionSyncResults} />
          </Stack>
          <Box sx={{ my: 2 }}>
            {extension.SettingOptions.map((setting, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <CippFormComponent
                  name={setting.name}
                  type={setting.type}
                  label={setting.label}
                  options={setting.options}
                  formControl={formControl}
                  placeholder={setting?.placeholder}
                />
              </Box>
            ))}
          </Box>
        </CippFormPage>
      ) : (
        <>
          {integrations.isLoading && <Box>Loading...</Box>}
          {integrations.isSuccess && !extension && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ textAlign: "center" }}>Extension not found</Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
