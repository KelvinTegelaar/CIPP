import { Box, Grid } from "@mui/material";
import CippFormSection from "/src/components/CippFormPages/CippFormSection";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useForm } from "react-hook-form";
import { useSettings } from "/src/hooks/use-settings";
import { ApiGetCall } from "/src/api/ApiCall";
import { useRouter } from "next/router";
import extensions from "/src/data/Extensions.json";
import { useEffect } from "react";

const CippIntegrationSettings = ({ children }) => {
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
        <CippFormSection
          queryKey={"Integrations"}
          formControl={formControl}
          formPageType="Integration"
          title={extension.name}
          backButtonTitle="Integrations"
          postUrl="/api/ExecExtensionsConfig"
          resetForm={false}
        >
          {children}

          <Grid container sx={{ alignItems: "center" }}>
            {extension.SettingOptions.map((setting, index) => (
              <Grid item xs={12} md={setting.type == "switch" ? 12 : 6} key={index}>
                <Box sx={{ p: 1 }}>
                  <CippFormComponent
                    name={setting.name}
                    type={setting.type}
                    label={setting.label}
                    options={setting.options}
                    formControl={formControl}
                    placeholder={setting?.placeholder}
                    fullWidth
                    {...setting}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CippFormSection>
      ) : (
        <CardContent>
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
        </CardContent>
      )}
    </>
  );
};

export default CippIntegrationSettings;
