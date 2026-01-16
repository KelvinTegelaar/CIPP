import { Box, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormPage from "../../../../components/CippFormPages/CippFormPage";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippFormTenantSelector } from "../../../../components/CippComponents/CippFormTenantSelector";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "../../../../components/CippComponents/CippFormComponent";
import { CippFormCondition } from "../../../../components/CippComponents/CippFormCondition";
import gdaproles from "/src/data/GDAPRoles.json";
import { CippFormDomainSelector } from "../../../../components/CippComponents/CippFormDomainSelector";
import { CippFormUserSelector } from "../../../../components/CippComponents/CippFormUserSelector";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useEffect, useState } from "react";

const Page = () => {
  const formControl = useForm({ mode: "onChange" });
  const selectedTenant = useWatch({ control: formControl.control, name: "tenantFilter" });
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const jitAdminTemplates = ApiGetCall({
    url: selectedTenant
      ? `/api/ListJITAdminTemplates?TenantFilter=${selectedTenant.value}`
      : undefined,
    queryKey: selectedTenant ? `JITAdminTemplates-${selectedTenant.value}` : "JITAdminTemplates",
    refetchOnMount: false,
    refetchOnReconnect: false,
    waiting: !!selectedTenant,
  });

  const watcher = useWatch({ control: formControl.control });

  // Simple duration parser for basic ISO 8601 durations
  const parseDuration = (duration) => {
    if (!duration) return null;
    const matches = duration.match(
      /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/
    );
    if (!matches) return null;
    return {
      years: parseInt(matches[1] || 0),
      months: parseInt(matches[2] || 0),
      weeks: parseInt(matches[3] || 0),
      days: parseInt(matches[4] || 0),
      hours: parseInt(matches[5] || 0),
      minutes: parseInt(matches[6] || 0),
      seconds: parseInt(matches[7] || 0),
    };
  };

  const addDurationToDate = (date, duration) => {
    if (!date || !duration) return null;
    const parsed = parseDuration(duration);
    if (!parsed) return null;

    const result = new Date(date);
    result.setFullYear(result.getFullYear() + parsed.years);
    result.setMonth(result.getMonth() + parsed.months);
    result.setDate(result.getDate() + parsed.weeks * 7);
    result.setDate(result.getDate() + parsed.days);
    result.setHours(result.getHours() + parsed.hours);
    result.setMinutes(result.getMinutes() + parsed.minutes);
    result.setSeconds(result.getSeconds() + parsed.seconds);
    return result;
  };

  // Auto-select default template for tenant
  // Priority: tenant-specific default > AllTenants default
  useEffect(() => {
    if (jitAdminTemplates.isSuccess && !watcher.jitAdminTemplate) {
      const templates = jitAdminTemplates.data || [];

      // First, try to find a tenant-specific default template
      let defaultTemplate = templates.find(
        (template) =>
          template.defaultForTenant === true &&
          template.tenantFilter !== "AllTenants" &&
          template.tenantFilter === selectedTenant?.value
      );

      // If not found, fall back to AllTenants default template
      if (!defaultTemplate) {
        defaultTemplate = templates.find(
          (template) => template.defaultForTenant === true && template.tenantFilter === "AllTenants"
        );
      }

      if (defaultTemplate) {
        formControl.setValue("jitAdminTemplate", {
          label: defaultTemplate.templateName,
          value: defaultTemplate.GUID,
          addedFields: defaultTemplate,
        });
        setSelectedTemplate(defaultTemplate);
      }
    }
  }, [jitAdminTemplates.isSuccess, selectedTenant]);

  // Only set template-driven fields when the template actually changes
  const [lastTemplate, setLastTemplate] = useState(null);
  useEffect(() => {
    const template = watcher.jitAdminTemplate?.addedFields;
    if (!template || template.GUID === lastTemplate) return;
    setSelectedTemplate(template);
    setLastTemplate(template.GUID);

    // Helpers
    const roundDown15 = (date) => {
      const d = new Date(date);
      d.setMilliseconds(0);
      d.setSeconds(0);
      d.setMinutes(Math.floor(d.getMinutes() / 15) * 15);
      return d;
    };
    const roundUp15 = (date) => {
      const d = new Date(date);
      d.setMilliseconds(0);
      d.setSeconds(0);
      let min = d.getMinutes();
      d.setMinutes(min % 15 === 0 ? min : Math.ceil(min / 15) * 15);
      if (d.getMinutes() === 60) {
        d.setHours(d.getHours() + 1);
        d.setMinutes(0);
      }
      return d;
    };

    // Set all template-driven fields
    formControl.setValue("adminRoles", template.defaultRoles || [], { shouldDirty: true });
    formControl.setValue("expireAction", template.defaultExpireAction || null, {
      shouldDirty: true,
    });
    formControl.setValue("postExecution", template.defaultNotificationActions || [], {
      shouldDirty: true,
    });
    formControl.setValue("UseTAP", template.generateTAPByDefault ?? false, { shouldDirty: true });
    formControl.setValue("reason", template.reasonTemplate || "", { shouldDirty: true });

    // User action and user details
    if (template.defaultUserAction) {
      formControl.setValue("userAction", template.defaultUserAction, { shouldDirty: true });
    }
    if (template.defaultFirstName) {
      formControl.setValue("firstName", template.defaultFirstName, { shouldDirty: true });
    }
    if (template.defaultLastName) {
      formControl.setValue("lastName", template.defaultLastName, { shouldDirty: true });
    }
    if (template.defaultUserName) {
      formControl.setValue("userName", template.defaultUserName, { shouldDirty: true });
    }
    if (template.defaultDomain) {
      formControl.setValue("domain", template.defaultDomain, { shouldDirty: true });
    }
    if (template.defaultExistingUser) {
      formControl.setValue("existingUser", template.defaultExistingUser, { shouldDirty: true });
    }

    // Dates
    if (template.defaultDuration) {
      const duration =
        typeof template.defaultDuration === "object" && template.defaultDuration !== null
          ? template.defaultDuration.value
          : template.defaultDuration;
      const start = roundDown15(new Date());
      const unixStart = Math.floor(start.getTime() / 1000);
      formControl.setValue("startDate", unixStart, { shouldDirty: true });
      const end = roundUp15(addDurationToDate(start, duration));
      const unixEnd = Math.floor(end.getTime() / 1000);
      formControl.setValue("endDate", unixEnd, { shouldDirty: true });
    }
  }, [watcher.jitAdminTemplate, lastTemplate]);

  // Recalculate end date when start date changes and template has default duration
  useEffect(() => {
    if (watcher.startDate && selectedTemplate?.defaultDuration) {
      const durationValue =
        typeof selectedTemplate.defaultDuration === "object" &&
        selectedTemplate.defaultDuration !== null
          ? selectedTemplate.defaultDuration.value
          : selectedTemplate.defaultDuration;
      const startDateDate = new Date(watcher.startDate * 1000);
      const endDateObj = addDurationToDate(startDateDate, durationValue);
      if (endDateObj) {
        const unixEnd = Math.floor(endDateObj.getTime() / 1000);
        formControl.setValue("endDate", unixEnd);
      }
    }
  }, [watcher.startDate]);

  return (
    <>
      <CippFormPage
        queryKey={"JIT Admin Table"}
        formControl={formControl}
        title="JIT Admin"
        backButtonTitle="JIT Admin"
        postUrl="/api/ExecJitAdmin"
      >
        <Box sx={{ my: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippFormTenantSelector
                label={"Select a tenant to create the JIT Admin in"}
                formControl={formControl}
                type="single"
                allTenants={false}
                preselectedEnabled={true}
                validators={{ required: "A tenant must be selected" }}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                label="JIT Admin Template (optional)"
                name="jitAdminTemplate"
                multiple={false}
                creatable={false}
                options={
                  jitAdminTemplates.isSuccess && Array.isArray(jitAdminTemplates.data)
                    ? jitAdminTemplates.data?.map((template) => ({
                        label: template.templateName,
                        value: template.GUID,
                        addedFields: template,
                      }))
                    : []
                }
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <Divider sx={{ mb: 2 }} />
              <CippFormComponent
                type="radio"
                label="Would you like to create a new user or assign permissions to an existing user?"
                name="userAction"
                row
                formControl={formControl}
                options={[
                  { label: "New User", value: "create" },
                  { label: "Existing User", value: "select" },
                ]}
                required={true}
                validators={{ required: "You must select an option" }}
              />
              <Divider sx={{ my: 2 }} />
            </Grid>
            <CippFormCondition
              formControl={formControl}
              field="userAction"
              compareType="is"
              compareValue="create"
            >
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="First Name"
                  name="firstName"
                  formControl={formControl}
                  required={true}
                  validators={{ required: "First Name is required" }}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  formControl={formControl}
                  required={true}
                  validators={{ required: "Last Name is required" }}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormComponent
                  type="textField"
                  fullWidth
                  label="Username"
                  name="userName"
                  formControl={formControl}
                  required={true}
                  validators={{ required: "Username is required" }}
                />
              </Grid>
              <Grid size={{ md: 6, xs: 12 }}>
                <CippFormDomainSelector
                  formControl={formControl}
                  name="domain"
                  label="Domain Name"
                  required={true}
                  validators={{ required: "Domain is required" }}
                />
              </Grid>
              <Grid size={{ md: 12, xs: 12 }}>
                <Divider sx={{ me: 2 }} />
              </Grid>
            </CippFormCondition>
            <CippFormCondition
              formControl={formControl}
              field="userAction"
              compareType="is"
              compareValue="select"
            >
              <Grid size={{ md: 12, xs: 12 }}>
                <Grid size={{ md: 12, xs: 12 }}>
                  <CippFormUserSelector
                    formControl={formControl}
                    multiple={false}
                    name="existingUser"
                    label="User"
                    required={true}
                    validators={{ required: "User is required" }}
                  />
                </Grid>
              </Grid>
            </CippFormCondition>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="datePicker"
                fullWidth
                label="Start Date"
                name="startDate"
                formControl={formControl}
                required={true}
                validators={{ required: "Start date is required" }}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="datePicker"
                fullWidth
                label="End Date"
                name="endDate"
                formControl={formControl}
                required={true}
                validators={{
                  required: "End date is required",
                  validate: (value) => {
                    const startDate = formControl.getValues("startDate");
                    if (value && startDate && new Date(value) < new Date(startDate)) {
                      return "End date must be after start date";
                    }
                    return true;
                  },
                }}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Roles"
                name="adminRoles"
                options={gdaproles.map((role) => ({ label: role.Name, value: role.ObjectId }))}
                formControl={formControl}
                required={true}
                validators={{
                  required: "At least one role is required",
                  validate: (options) => {
                    if (!options?.length) {
                      return "At least one role is required";
                    }
                    return true;
                  },
                }}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippFormComponent
                type="textField"
                label="Reason"
                name="reason"
                placeholder="Enter the reason for adding this JIT Admin"
                multiline
                rows={3}
                formControl={formControl}
                required={true}
                validators={{ required: "A reason is required" }}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippFormComponent
                type="switch"
                label="Generate TAP"
                name="UseTAP"
                formControl={formControl}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Expiration Action"
                name="expireAction"
                multiple={false}
                creatable={false}
                required={true}
                options={[
                  { label: "Delete User", value: "DeleteUser" },
                  { label: "Disable User", value: "DisableUser" },
                  { label: "Remove Roles", value: "RemoveRoles" },
                ]}
                formControl={formControl}
                validators={{ required: "Expiration action is required" }}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <CippFormComponent
                type="autoComplete"
                fullWidth
                label="Notification Action"
                name="postExecution"
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
          </Grid>
        </Box>
      </CippFormPage>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
