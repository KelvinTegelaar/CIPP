import { Box, Grid, TextField, Checkbox, FormControlLabel, Select, MenuItem } from "@mui/material";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import extensions from "/src/data/Extensions.json";
import { useEffect } from "react";

const Page = () => {
  const router = useRouter();
  const settings = useSettings();
  const preferredTheme = settings.currentTheme?.value;
  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
  });

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
