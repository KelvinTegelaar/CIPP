import React, { useState, useEffect } from "react";
import { Button, Typography, Divider, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch, useFormState } from "react-hook-form";
import { EventAvailable } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { CippFormUserSelector } from "./CippFormUserSelector";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { ApiPostCall } from "../../api/ApiCall";

export const CippAddVacationModeDrawer = ({
  buttonText = "Add Vacation Schedule",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      vacation: true,
      tenantFilter: null,
      Users: [],
      PolicyId: null,
      startDate: null,
      endDate: null,
    },
  });

  const { isValid } = useFormState({ control: formControl.control });

  // Watch the selected tenant to update dependent fields
  const selectedTenant = useWatch({ control: formControl.control, name: "tenantFilter" });
  const tenantDomain = selectedTenant?.value || selectedTenant;

  const addVacationMode = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["VacationMode"],
  });

  // Reset form fields on successful creation
  useEffect(() => {
    if (addVacationMode.isSuccess) {
      formControl.reset({
        vacation: true,
        tenantFilter: null,
        Users: [],
        PolicyId: null,
        startDate: null,
        endDate: null,
      });
    }
  }, [addVacationMode.isSuccess, formControl]);

  const handleSubmit = () => {
    formControl.trigger();
    // Check if the form is valid before proceeding
    if (!isValid) {
      return;
    }

    const formData = formControl.getValues();
    const shippedValues = {
      tenantFilter: formData.tenantFilter?.value || formData.tenantFilter,
      Users: formData.Users,
      PolicyId: formData.PolicyId?.value,
      StartDate: formData.startDate,
      EndDate: formData.endDate,
      vacation: true,
    };

    addVacationMode.mutate({
      url: "/api/ExecCAExclusion",
      data: shippedValues,
      relatedQueryKeys: ["VacationMode"],
    });
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    formControl.reset({
      vacation: true,
      tenantFilter: null,
      Users: [],
      PolicyId: null,
      startDate: null,
      endDate: null,
    });
  };

  return (
    <>
      <PermissionButton
        requiredPermissions={requiredPermissions}
        onClick={() => setDrawerVisible(true)}
        startIcon={<EventAvailable />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Add Vacation Mode"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={addVacationMode.isLoading || !isValid}
            >
              {addVacationMode.isLoading
                ? "Creating..."
                : addVacationMode.isSuccess
                ? "Create Another"
                : "Create Vacation Schedule"}
            </Button>
            <Button variant="outlined" onClick={handleCloseDrawer}>
              Close
            </Button>
          </div>
        }
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
                allTenants={false}
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

          <CippApiResults apiObject={addVacationMode} />
        </Stack>
      </CippOffCanvas>
    </>
  );
};
