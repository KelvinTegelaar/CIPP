import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index.js";
import tabOptions from "./tabOptions";
import CippFormPage from "../../../components/CippFormPages/CippFormPage";
import { useForm } from "react-hook-form";
import { Typography, Alert } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../../api/ApiCall";
import { useEffect } from "react";

const Page = () => {
  const pageTitle = "JIT Admin Settings";

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      MaxDuration: "",
    },
  });

  const jitSettings = ApiGetCall({
    url: "/api/ExecJITAdminSettings?Action=Get",
    queryKey: "jitAdminSettings",
  });

  useEffect(() => {
    if (jitSettings.isSuccess && jitSettings.data) {
      formControl.reset({
        MaxDuration: jitSettings.data?.MaxDuration || [],
      });
    }
  }, [jitSettings.isSuccess, jitSettings.data]);

  return (
    <CippFormPage
      title={pageTitle}
      hideBackButton={true}
      hidePageType={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecJITAdminSettings"
      queryKey={["jitAdminSettings"]}
      customDataformatter={(values) => ({
        Action: "Set",
        MaxDuration: values.MaxDuration || null,
      })}
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ md: 12, xs: 12 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Configure maximum allowed duration for Just-In-Time (JIT) admin accounts. This setting
            helps enforce security policies by preventing technicians from creating JIT admin
            accounts with excessively long lifespans. Validation is performed on the backend when
            creating JIT admin accounts.
          </Typography>
        </Grid>

        <Grid size={{ md: 12, xs: 12 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Set the maximum duration in ISO 8601 format, or leave empty for no limit (default). The
            backend will validate that the difference between the start and end dates of any JIT
            admin account does not exceed the configured maximum duration.
          </Alert>
        </Grid>

        <Grid size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            name="MaxDuration"
            label="Maximum Duration (ISO 8601)"
            placeholder="Leave empty for no limit, or enter duration (e.g., P28D for 4 weeks)"
            options={[
              { label: "1 Hour", value: "PT1H" },
              { label: "4 Hours", value: "PT4H" },
              { label: "8 Hours", value: "PT8H" },
              { label: "1 Day", value: "P1D" },
              { label: "3 Days", value: "P3D" },
              { label: "7 Days", value: "P7D" },
              { label: "14 Days", value: "P14D" },
              { label: "30 Days", value: "P30D" },
            ]}
            creatable={true}
            multiple={false}
            validators={{
              validate: {
                iso8601duration: (value) => {
                  // Allow empty value (no limit)
                  if (typeof value !== "string" || value.trim() === "") {
                    return true;
                  }
                  const iso8601Regex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
                  if (!iso8601Regex.test(value)) {
                    return "Invalid format. Use PT1H, P1D, P7D, P28D, etc.";
                  }
                  return true;
                },
              },
            }}
            formControl={formControl}
            helperText="ISO 8601 format: PT1H (1 hour), P1D (1 day), P7D (1 week), P28D (4 weeks). Leave empty for no limit."
          />
        </Grid>

        <Grid size={{ md: 12, xs: 12 }}>
          <Alert severity="warning">
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              Important Notes:
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li>Leave empty for no limit on JIT admin account duration (default behavior)</li>
                <li>
                  The duration is calculated from the start date to the expiration date of the JIT
                  admin
                </li>
                <li>
                  If a technician attempts to exceed this limit, the backend will reject the
                  request with an error message
                </li>
                <li>This setting applies globally to all tenants and all JIT admin creations</li>
              </ul>
            </Typography>
          </Alert>
        </Grid>

        <Grid size={{ md: 12, xs: 12 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            <strong>Example:</strong> If maximum duration is set to P28D (4 weeks), and a
            technician tries to create a JIT admin account lasting 1.5 months, the backend will
            reject the request with an error: "Requested JIT Admin duration (56 days) exceeds the
            maximum allowed duration of P28D (28 days)".
          </Typography>
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
