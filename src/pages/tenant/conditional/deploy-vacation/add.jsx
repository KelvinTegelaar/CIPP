import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { useSettings } from "/src/hooks/use-settings";
import { CippFormUserSelector } from "/src/components/CippComponents/CippFormUserSelector";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const tenantDomain = userSettingsDefaults?.currentTenant;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: tenantDomain,
      vacation: true,
    },
  });

  return (
    <>
      <CippFormPage
        queryKey={"CippFormPage"}
        formControl={formControl}
        title="Add Vacation Mode"
        backButtonTitle="Vacation Modes"
        postUrl="/api/ExecCAExclusion"
        customDataformatter={(values) => {
          const shippedValues = {
            tenantFilter: tenantDomain,
            UserId: values.UserId?.value,
            PolicyId: values.PolicyId?.value,
            StartDate: values.startDate,
            EndDate: values.endDate,
            vacation: true,
          };
          return shippedValues;
        }}
      >
        <Box sx={{ my: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Vacation mode adds scheduled tasks to add and remove users from Conditional Access (CA)
            exclusions for a specific period of time. Select the CA policy and the date range.
          </Typography>
          <Grid container spacing={2}>
            <Grid item size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* User Selector */}
            <Grid item size={{ xs: 12 }}>
              <CippFormUserSelector
                label={`Users in ${tenantDomain}`}
                formControl={formControl}
                name="UserId"
                multiple={false}
                validators={{ required: "Picking a user is required" }}
                required={true}
              />
            </Grid>

            {/* Conditional Access Policy Selector */}
            <Grid item size={{ xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label={`Conditional Access Policies in ${tenantDomain}`}
                name="PolicyId"
                api={{
                  queryKey: `ListConditionalAccessPolicies-${tenantDomain}`,
                  url: "/api/ListConditionalAccessPolicies",
                  labelField: (option) => `${option.displayName}`,
                  valueField: "id",
                }}
                multiple={false}
                formControl={formControl}
                validators={{
                  validate: (option) => {
                    if (!option?.value) {
                      return "Picking a policy is required";
                    }
                    return true;
                  },
                }}
                required={true}
              />
            </Grid>

            {/* Start Date Picker */}
            <Grid item size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="datePicker"
                label="Scheduled Start Date"
                name="startDate"
                dateTimeType="dateTime"
                formControl={formControl}
                required={true}
                validators={{
                  validate: (value) => {
                    if (!value) {
                      return "Start date is required";
                    }
                    return true;
                  },
                }}
              />
            </Grid>

            {/* End Date Picker */}
            <Grid item size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="datePicker"
                label="Scheduled End Date"
                name="endDate"
                dateTimeType="dateTime"
                formControl={formControl}
                required={true}
                validators={{
                  validate: (value) => {
                    const startDate = formControl.getValues("startDate");
                    if (!value) {
                      return "End date is required";
                    }
                    if (startDate && value && new Date(value * 1000) < new Date(startDate * 1000)) {
                      return "End date must be after start date";
                    }
                    return true;
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
