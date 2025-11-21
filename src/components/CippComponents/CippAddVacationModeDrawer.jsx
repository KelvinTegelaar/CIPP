import { useState, useEffect } from "react";
import { Alert, Button, Typography, Divider, Stack } from "@mui/material";
import { Grid } from "@mui/system";
import { useForm, useWatch, useFormState } from "react-hook-form";
import { EventAvailable } from "@mui/icons-material";
import { CippOffCanvas } from "./CippOffCanvas";
import CippFormComponent from "./CippFormComponent";
import { CippApiResults } from "./CippApiResults";
import { CippFormUserSelector } from "./CippFormUserSelector";
import { CippFormTenantSelector } from "./CippFormTenantSelector";
import { ApiPostCall, ApiGetCallWithPagination } from "../../api/ApiCall";
import CippJsonView from "/src/components/CippFormPages/CippJSONView";

export const CippAddVacationModeDrawer = ({
  buttonText = "Add Vacation Schedule",
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [caPoliciesWaiting, setCaPoliciesWaiting] = useState(false);

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      vacation: true,
      tenantFilter: null,
      Users: [],
      PolicyId: null,
      startDate: null,
      endDate: null,
      excludeLocationAuditAlerts: false,
    },
  });

  const { isValid } = useFormState({ control: formControl.control });

  // Watch the selected tenant to update dependent fields
  const selectedTenant = useWatch({ control: formControl.control, name: "tenantFilter" });
  const selectedPolicy = useWatch({ control: formControl.control, name: "PolicyId" });
  const tenantDomain = selectedTenant?.value || selectedTenant;

  const addVacationMode = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["VacationMode"],
  });

  const caPolicies = ApiGetCallWithPagination({
    url: "/api/ListGraphRequest",
    data: {
      tenantFilter: tenantDomain,
      Endpoint: "conditionalAccess/policies",
    },
    queryKey: `ListConditionalAccessPolicies-${tenantDomain}`,
    waiting: caPoliciesWaiting,
  });

  // Selected policy object & whether it targets locations (include or exclude)
  const selectedPolicyObject = (caPolicies?.data?.pages || [])
    .flatMap((page) => page?.Results || [])
    .find((p) => p.id === selectedPolicy?.value);
  const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const locationSets = selectedPolicyObject?.conditions?.locations;
  const allLocationIds = [
    ...(locationSets?.includeLocations || []),
    ...(locationSets?.excludeLocations || []),
  ];
  const policyHasLocationTarget = allLocationIds.some((loc) => guidRegex.test(loc));

  useEffect(() => {
    // monitor changes to selectedTenant, if null change waiting to false on caPolicies
    if (!selectedTenant?.value === null || selectedTenant?.value === undefined) {
      setCaPoliciesWaiting(false);
    } else {
      setCaPoliciesWaiting(true);
    }
  }, [selectedTenant]);

  // Reset form fields on successful creation
  useEffect(() => {
    if (addVacationMode.isSuccess) {
      formControl.reset({
        vacation: true,
        tenantFilter: tenantDomain,
        Users: [],
        PolicyId: null,
        startDate: null,
        endDate: null,
        excludeLocationAuditAlerts: false,
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
      excludeLocationAuditAlerts: formData.excludeLocationAuditAlerts || false,
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
          <Stack spacing={2}>
            <CippApiResults apiObject={addVacationMode} />
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
          </Stack>
        }
      >
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Alert severity="info">
            Vacation mode adds scheduled tasks to add and remove users from Conditional Access (CA)
            exclusions for a specific period of time. Select the CA policy and the date range. If
            the CA policy targets a named location, you now have the ability to exclude the targeted
            users from location-based audit log alerts.
          </Alert>
          <Alert severity="warning">
            Note: Vacation mode has recently been updated to use Group based exclusions for better
            reliability. Existing vacation mode entries will continue to function as before, but it
            is recommended to recreate them to take advantage of the new functionality. The
            exclusion group follows the format: 'Vacation Exclusion - $Policy.displayName'
          </Alert>
          <Grid container spacing={2} sx={{ mt: 2 }}>
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
                        url: "/api/ListGraphRequest",
                        data: {
                          tenantFilter: tenantDomain,
                          Endpoint: "conditionalAccess/policies",
                          AsApp: true,
                        },
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
            {policyHasLocationTarget && (
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="checkbox"
                  label="Exclude from location-based audit log alerts"
                  name="excludeLocationAuditAlerts"
                  formControl={formControl}
                  helperText="If enabled, hidden scheduled tasks will manage AuditLogUserExclusions for this period."
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <CippJsonView
                object={
                  caPolicies?.data?.pages[0]?.Results?.filter(
                    (policy) => policy.id === selectedPolicy?.value
                  )[0] || {}
                }
                title="Selected Policy JSON"
              />
            </Grid>
          </Grid>
        </Stack>
      </CippOffCanvas>
    </>
  );
};
