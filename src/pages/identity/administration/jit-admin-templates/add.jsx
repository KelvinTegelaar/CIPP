import { Box, Divider, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { CippFormCondition } from "../../../../components/CippComponents/CippFormCondition";
import { CippFormDomainSelector } from "../../../../components/CippComponents/CippFormDomainSelector";
import { CippFormUserSelector } from "../../../../components/CippComponents/CippFormUserSelector";
import { CippFormGroupSelector } from "../../../../components/CippComponents/CippFormGroupSelector";
import gdaproles from "../../../../data/GDAPRoles.json";
import { useSettings } from "../../../../hooks/use-settings";
import { useEffect } from "react";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });

  const watchedTenant = useWatch({ control: formControl.control, name: "tenantFilter" });
  const isAllTenants = watchedTenant?.value === "AllTenants" || watchedTenant === "AllTenants";
  const useRoles = useWatch({ control: formControl.control, name: "defaultUseRoles" });
  const useGroups = useWatch({ control: formControl.control, name: "defaultUseGroups" });

  // Clear fields when switches are toggled off
  useEffect(() => {
    if (!useRoles) {
      formControl.setValue("defaultRoles", []);
    }
  }, [useRoles]);

  useEffect(() => {
    if (!useGroups) {
      formControl.setValue("defaultGroups", []);
    }
  }, [useGroups]);

  // Reset expiration action when switches change
  useEffect(() => {
    const currentAction = formControl.getValues("defaultExpireAction");
    if (!currentAction?.value) return;

    if (!useRoles && currentAction.value === "RemoveRoles") {
      formControl.setValue("defaultExpireAction", null);
    } else if (!useGroups && currentAction.value === "RemoveGroups") {
      formControl.setValue("defaultExpireAction", null);
    } else if ((!useRoles || !useGroups) && currentAction.value === "RemoveRolesAndGroups") {
      formControl.setValue("defaultExpireAction", null);
    } else if (useRoles && useGroups && currentAction.value === "RemoveRoles") {
      formControl.setValue("defaultExpireAction", null);
    } else if (useRoles && useGroups && currentAction.value === "RemoveGroups") {
      formControl.setValue("defaultExpireAction", null);
    }
  }, [useRoles, useGroups]);

  return (
    <>
      <CippFormPage
        resetForm={false}
        queryKey="*JITAdminTemplate*"
        formControl={formControl}
        title="JIT Admin Template"
        backButtonTitle="JIT Admin Templates"
        postUrl="/api/AddJITAdminTemplate"
      >
        <Box sx={{ my: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6">Template Information</Typography>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="textField"
                fullWidth
                label="Template Name"
                name="templateName"
                formControl={formControl}
                required={true}
                validators={{ required: "Template name is required" }}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Default for Tenant"
                name="defaultForTenant"
                formControl={formControl}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">Default JIT Admin Settings</Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Admin Roles"
                name="defaultUseRoles"
                formControl={formControl}
              />
              {!isAllTenants && (
                <CippFormComponent
                  type="switch"
                  label="Group Membership"
                  name="defaultUseGroups"
                  formControl={formControl}
                />
              )}
              {!useRoles && !useGroups && (
                <Box sx={{ color: "error.main", fontSize: "0.875rem" }}>
                  Please select at least &quot;Admin Roles&quot; or &quot;Group Membership&quot;
                </Box>
              )}
            </Grid>

            <CippFormCondition
              formControl={formControl}
              field="defaultUseRoles"
              compareType="is"
              compareValue={true}
            >
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  type="autoComplete"
                  fullWidth
                  label="Default Roles"
                  name="defaultRoles"
                  creatable={false}
                  options={gdaproles.map((role) => ({ label: role.Name, value: role.ObjectId }))}
                  formControl={formControl}
                  required={true}
                  validators={{
                    required: "At least one default role is required",
                    validate: (options) => {
                      if (!options?.length) {
                        return "At least one default role is required";
                      }
                      return true;
                    },
                  }}
                />
              </Grid>
            </CippFormCondition>

            {!isAllTenants && (
              <CippFormCondition
                formControl={formControl}
                field="defaultUseGroups"
                compareType="is"
                compareValue={true}
              >
                <Grid size={{ xs: 12 }}>
                  <CippFormGroupSelector
                    formControl={formControl}
                    name="defaultGroups"
                    label="Default Groups"
                    multiple={true}
                    required={true}
                    validators={{
                      required: "At least one group is required",
                      validate: (options) => {
                        if (!options?.length) {
                          return "At least one group is required";
                        }
                        return true;
                      },
                    }}
                  />
                </Grid>
              </CippFormCondition>
            )}

            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Default Duration"
                name="defaultDuration"
                multiple={false}
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
                formControl={formControl}
                helperText="ISO 8601 format: PT1H (1 hour), P1D (1 day), PT2H30M (2.5 hours)"
                validators={{
                  validate: (value) => {
                    if (!value) return true; // Optional field
                    const durationValue = typeof value === "object" && value.value ? value.value : value;
                    const iso8601Regex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
                    if (!iso8601Regex.test(durationValue)) {
                      return "Invalid format. Use PT1H, P1D, PT2H30M, etc.";
                    }
                    return true;
                  },
                }}
              />
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Default Expiration Action"
                name="defaultExpireAction"
                multiple={false}
                creatable={false}
                options={(() => {
                  const opts = [
                    { label: "Delete User", value: "DeleteUser" },
                    { label: "Disable User", value: "DisableUser" },
                  ];
                  if (useRoles && useGroups) {
                    opts.push({ label: "Remove Roles and Groups", value: "RemoveRolesAndGroups" });
                  } else if (useRoles) {
                    opts.push({ label: "Remove Roles", value: "RemoveRoles" });
                  } else if (useGroups) {
                    opts.push({ label: "Remove Groups", value: "RemoveGroups" });
                  }
                  return opts;
                })()}
                formControl={formControl}
                required={true}
                validators={{ required: "Expiration action is required" }}
              />
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Default Notification Actions"
                name="defaultNotificationActions"
                multiple={true}
                creatable={false}
                options={[
                  { label: "Webhook", value: "Webhook" },
                  { label: "Email", value: "email" },
                  { label: "PSA", value: "PSA" },
                ]}
                formControl={formControl}
              />
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Generate TAP by Default"
                name="generateTAPByDefault"
                formControl={formControl}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Reason Template"
                name="reasonTemplate"
                placeholder="Enter a default reason template for JIT Admin requests"
                multiline
                rows={3}
                formControl={formControl}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6">User Creation Settings</Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {isAllTenants
                    ? "AllTenants templates can only use 'New User' option (no further options are configurable)"
                    : "Choose whether this template creates a new user or assigns to existing user"}
                </Typography>
                <CippFormComponent
                  type="radio"
                  label="Default User Action"
                  name="defaultUserAction"
                  row
                  formControl={formControl}
                  options={
                    isAllTenants
                      ? [{ label: "New User", value: "create" }]
                      : [
                          { label: "New User", value: "create" },
                          { label: "Existing User", value: "select" },
                        ]
                  }
                />
            </Grid>

            <CippFormCondition
              formControl={formControl}
              field="defaultUserAction"
              compareType="is"
              compareValue="create"
            >
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                  {isAllTenants
                    ? "Pre-fill user details (optional, for AllTenants templates)"
                    : "Pre-fill user details (optional, only for specific tenant templates)"}
                </Typography>
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Default First Name"
                  name="defaultFirstName"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Default Last Name"
                  name="defaultLastName"
                  formControl={formControl}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Default Username"
                  name="defaultUserName"
                  formControl={formControl}
                />
              </Grid>
              {!isAllTenants && (
                <Grid size={{ md: 6, xs: 12 }}>
                  <CippFormDomainSelector
                    formControl={formControl}
                    name="defaultDomain"
                    label="Default Domain"
                  />
                </Grid>
              )}
            </CippFormCondition>

            <CippFormCondition
              formControl={formControl}
              field="defaultUserAction"
              compareType="is"
              compareValue="select"
            >
              {!isAllTenants && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                      Select default user (optional, only for specific tenant templates)
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <CippFormUserSelector
                      formControl={formControl}
                      multiple={false}
                      name="defaultExistingUser"
                      label="Default User"
                    />
                  </Grid>
                </>
              )}
            </CippFormCondition>
          </Grid>
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
