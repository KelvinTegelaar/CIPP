import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import { Alert, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../../api/ApiCall";
import { useEffect, useMemo } from "react";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { useTimezones } from "/src/hooks/use-timezones";
import tabOptions from "./tabOptions";

const Page = () => {
  const pageTitle = "Time Settings";

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      Timezone: { label: "UTC", value: "UTC" },
      BusinessHoursStart: { label: "09:00", value: "09:00" },
    },
  });

  // Get timezone and backend info
  const backendInfo = ApiGetCall({
    url: "/api/ExecBackendURLs",
    queryKey: "backendInfo",
  });

  const { timezones, loading: timezonesLoading } = useTimezones();
  const isFlexConsumption = backendInfo.data?.Results?.SKU === "FlexConsumption";

  // Generate business hours options (00:00 to 23:00 in hourly increments)
  const businessHoursOptions = useMemo(() => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0");
      hours.push({
        label: `${hour}:00`,
        value: `${hour}:00`,
      });
    }
    return hours;
  }, []);

  useEffect(() => {
    if (backendInfo.isSuccess && backendInfo.data) {
      const tzStr = backendInfo.data?.Results?.Timezone || "UTC";
      const tzOption = (timezones || []).find(
        (o) => o?.value === tzStr || o?.alternativeName === tzStr
      ) || {
        label: tzStr,
        value: tzStr,
      };

      const startStr = backendInfo.data?.Results?.BusinessHoursStart || "09:00";
      const startOption = businessHoursOptions.find((o) => o.value === startStr) || {
        label: startStr,
        value: startStr,
      };

      formControl.reset({
        Timezone: tzOption,
        BusinessHoursStart: startOption,
      });
    }
  }, [backendInfo.isSuccess, backendInfo.data, timezones, businessHoursOptions]);

  return (
    <CippFormPage
      title={pageTitle}
      hideBackButton={true}
      hidePageType={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecTimeSettings"
      queryKey="backendInfo"
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={12}>
          <Typography variant="body1">
            Configure the timezone for CIPP operations and scheduling. If you are using a Flex
            Consumption App Service Plan, you can also configure business hours to optimize
            performance and cost.
          </Typography>
        </Grid>

        {!backendInfo.isSuccess && (
          <Grid size={12}>
            <Alert severity="info">Loading backend information...</Alert>
          </Grid>
        )}

        {timezonesLoading && (
          <Grid size={12}>
            <Alert severity="info">Loading timezones...</Alert>
          </Grid>
        )}

        {backendInfo.isSuccess && (
          <>
            <Grid size={12}>
              <CippFormComponent
                type="autoComplete"
                name="Timezone"
                label="Timezone"
                multiple={false}
                formControl={formControl}
                options={timezones?.length ? timezones : [{ label: "UTC", value: "UTC" }]}
                creatable={false}
                validators={{ required: "Please select a timezone" }}
              />
            </Grid>

            {isFlexConsumption && (
              <>
                <Grid size={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Flex Consumption Business Hours
                    </Typography>
                    Business hours are used to optimize Flex Consumption instance scheduling. Set
                    the start time for your business hours. CIPP will maintain higher instance
                    availability during a 10-hour window from the start time for better performance.
                    Outside of this window, instances may scale down to reduce costs.
                  </Alert>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <CippFormComponent
                    type="autoComplete"
                    name="BusinessHoursStart"
                    label="Business Hours Start Time (10-hour window)"
                    formControl={formControl}
                    options={businessHoursOptions}
                    validators={{ required: "Please select business hours start time" }}
                    multiple={false}
                    creatable={false}
                  />
                </Grid>
              </>
            )}

            {!isFlexConsumption && (
              <Grid size={12}>
                <Alert severity="info">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    App Service Plan: {backendInfo.data?.SKU || "Unknown"}
                  </Typography>
                  Business hours configuration is only available for Flex Consumption App Service
                  Plans.
                </Alert>
              </Grid>
            )}
          </>
        )}
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
