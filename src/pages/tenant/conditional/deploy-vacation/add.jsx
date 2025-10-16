import React from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { CippFormUserSelector } from "/src/components/CippComponents/CippFormUserSelector";
import { CippFormTenantSelector } from "/src/components/CippComponents/CippFormTenantSelector";

const Page = () => {
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      vacation: true,
    },
  });

  // Watch the selected tenant to update dependent fields
  const selectedTenant = useWatch({ control: formControl.control, name: "tenantFilter" });
  const tenantDomain = selectedTenant?.value || selectedTenant;

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
            tenantFilter: values.tenantFilter?.value || values.tenantFilter,
            Users: values.Users,
            PolicyId: values.PolicyId?.value,
            StartDate: values.startDate,
            EndDate: values.endDate,
            vacation: true,
          };
          return shippedValues;
        }}
      >
        <Stack spacing={3} sx={{ my: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Vacation mode adds scheduled tasks to add and remove users from Conditional Access (CA)
            exclusions for a specific period of time. Select the CA policy and the date range.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <CippFormTenantSelector
                label="Select Tenant"
                formControl={formControl}
                type="single"
                allTenants={true}
                required={true}
                preselectedEnabled={true}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* User Selector */}
            <Grid size={{ xs: 12 }}>
              <CippFormUserSelector
                label={tenantDomain ? `Users in ${tenantDomain}` : "Select a tenant first"}
                formControl={formControl}
                name="Users"
                multiple={true}
                addedField={{
                  userPrincipalName: "userPrincipalName",
                  displayName: "displayName",
                }}
                validators={{ required: "Picking a user is required" }}
                required={true}
                disabled={!tenantDomain}
                showRefresh={true}
              />
            </Grid>

            {/* Conditional Access Policy Selector */}
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label={
                  tenantDomain
                    ? `Conditional Access Policies in ${tenantDomain}`
                    : "Select a tenant first"
                }
                name="PolicyId"
                api={
                  tenantDomain
                    ? {
                        queryKey: `ListConditionalAccessPolicies-${tenantDomain}`,
                        url: "/api/ListConditionalAccessPolicies",
                        data: { tenantFilter: tenantDomain },
                        dataKey: "Results",
                        labelField: (option) => `${option.displayName}`,
                        valueField: "id",
                        showRefresh: true,
                      }
                    : null
                }
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
                disabled={!tenantDomain}
              />
            </Grid>

            {/* Start Date Picker */}
            <Grid size={{ md: 6, xs: 12 }}>
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
            <Grid size={{ md: 6, xs: 12 }}>
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
        </Stack>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
