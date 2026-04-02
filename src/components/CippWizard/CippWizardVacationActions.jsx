import { useEffect } from "react";
import { Alert, Skeleton, Stack, Typography, Card, CardContent, CardHeader, Divider } from "@mui/material";
import { Grid } from "@mui/system";
import CippWizardStepButtons from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippFormCondition } from "../CippComponents/CippFormCondition";
import { CippFormUserSelector } from "../CippComponents/CippFormUserSelector";
import { useWatch } from "react-hook-form";
import { ApiGetCall } from "../../api/ApiCall";

export const CippWizardVacationActions = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep, lastStep } = props;

  const currentTenant = useWatch({ control: formControl.control, name: "tenantFilter" });
  const tenantDomain = currentTenant?.value || currentTenant;

  const enableCA = useWatch({ control: formControl.control, name: "enableCAExclusion" });
  const enableMailbox = useWatch({ control: formControl.control, name: "enableMailboxPermissions" });
  const enableOOO = useWatch({ control: formControl.control, name: "enableOOO" });
  const atLeastOneEnabled = enableCA || enableMailbox || enableOOO;

  const users = useWatch({ control: formControl.control, name: "Users" });
  const firstUser = Array.isArray(users) && users.length > 0 ? users[0] : null;
  const firstUserUpn = firstUser?.addedFields?.userPrincipalName || firstUser?.value || null;

  const oooData = ApiGetCall({
    url: "/api/ListOoO",
    data: { UserId: firstUserUpn, tenantFilter: tenantDomain },
    queryKey: `OOO-${firstUserUpn}-${tenantDomain}`,
    waiting: !!(enableOOO && firstUserUpn && tenantDomain),
  });

  const isFetchingOOO = oooData.isFetching;

  useEffect(() => {
    if (oooData.isSuccess && oooData.data) {
      const currentInternal = formControl.getValues("oooInternalMessage");
      const currentExternal = formControl.getValues("oooExternalMessage");
      if (!currentInternal) {
        formControl.setValue("oooInternalMessage", oooData.data.InternalMessage || "");
      }
      if (!currentExternal) {
        formControl.setValue("oooExternalMessage", oooData.data.ExternalMessage || "");
      }
    }
  }, [oooData.isSuccess, oooData.data]);

  return (
    <Stack spacing={4}>

      {/* CA Policy Exclusion Section */}
      <Card variant="outlined">
        <CardHeader
          title="Conditional Access Policy Exclusion"
          subheader="Temporarily exclude users from a CA policy during their vacation"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="switch"
              name="enableCAExclusion"
              label="Enable CA Policy Exclusion"
              formControl={formControl}
            />

            <CippFormCondition
              formControl={formControl}
              field="enableCAExclusion"
              compareType="is"
              compareValue={true}
              clearOnHide={false}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Vacation mode uses group-based exclusions for reliability. The exclusion group
                    follows the format: &apos;Vacation Exclusion - $Policy.displayName&apos;
                  </Alert>
                </Grid>
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
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Exclude from location-based audit log alerts"
                    name="excludeLocationAuditAlerts"
                    formControl={formControl}
                  />
                </Grid>
              </Grid>
            </CippFormCondition>
          </Stack>
        </CardContent>
      </Card>

      {/* Mailbox Permissions Section */}
      <Card variant="outlined">
        <CardHeader
          title="Mailbox Permissions"
          subheader="Grant temporary mailbox and calendar access to delegates"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="switch"
              name="enableMailboxPermissions"
              label="Enable Mailbox Permissions"
              formControl={formControl}
            />

            <CippFormCondition
              formControl={formControl}
              field="enableMailboxPermissions"
              compareType="is"
              compareValue={true}
              clearOnHide={false}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Grant temporary mailbox permissions (Full Access, Send As, Send On Behalf) and
                    optional calendar access to delegates. Permissions are automatically added at the
                    start date and removed at the end date.
                  </Alert>
                </Grid>

                {/* Delegate(s) */}
                <Grid size={{ xs: 12 }}>
                  <CippFormUserSelector
                    label={
                      tenantDomain ? `Delegate(s) in ${tenantDomain}` : "Select a tenant first"
                    }
                    formControl={formControl}
                    name="delegates"
                    multiple={true}
                    addedField={{
                      userPrincipalName: "userPrincipalName",
                    }}
                    validators={{ required: "At least one delegate is required" }}
                    required={true}
                    disabled={!tenantDomain}
                    showRefresh={true}
                  />
                </Grid>

                {/* Permission Types */}
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="autoComplete"
                    label="Permission Types"
                    name="permissionTypes"
                    formControl={formControl}
                    multiple={true}
                    creatable={false}
                    options={[
                      { label: "Full Access", value: "FullAccess" },
                      { label: "Send As", value: "SendAs" },
                      { label: "Send On Behalf", value: "SendOnBehalf" },
                    ]}
                    validators={{ required: "At least one permission type is required" }}
                    required={true}
                  />
                </Grid>

                {/* AutoMap (visible when FullAccess is selected) */}
                <CippFormCondition
                  formControl={formControl}
                  field="permissionTypes"
                  compareType="valueEq"
                  compareValue="FullAccess"
                  clearOnHide={false}
                >
                  <Grid size={{ xs: 12 }}>
                    <CippFormComponent
                      type="switch"
                      label="Auto-Map Mailbox (Outlook auto-adds the mailbox)"
                      name="autoMap"
                      formControl={formControl}
                    />
                  </Grid>
                </CippFormCondition>

                {/* Include Calendar Permissions */}
                <Grid size={{ xs: 12 }}>
                  <CippFormComponent
                    type="switch"
                    label="Include Calendar Permissions"
                    name="includeCalendar"
                    formControl={formControl}
                  />
                </Grid>

                {/* Calendar permission details */}
                <CippFormCondition
                  formControl={formControl}
                  field="includeCalendar"
                  compareType="is"
                  compareValue={true}
                >
                  <Grid size={{ md: 6, xs: 12 }}>
                    <CippFormComponent
                      type="autoComplete"
                      label="Calendar Permission Level"
                      name="calendarPermission"
                      formControl={formControl}
                      multiple={false}
                      creatable={false}
                      options={[
                        { label: "Author", value: "Author" },
                        { label: "Contributor", value: "Contributor" },
                        { label: "Editor", value: "Editor" },
                        { label: "Non Editing Author", value: "NonEditingAuthor" },
                        { label: "Owner", value: "Owner" },
                        { label: "Publishing Author", value: "PublishingAuthor" },
                        { label: "Publishing Editor", value: "PublishingEditor" },
                        { label: "Reviewer", value: "Reviewer" },
                        { label: "Available Only", value: "AvailabilityOnly" },
                        { label: "Limited Details", value: "LimitedDetails" },
                      ]}
                      validators={{
                        validate: (option) => {
                          if (!option?.value) {
                            return "Calendar permission level is required";
                          }
                          return true;
                        },
                      }}
                      required={true}
                    />
                  </Grid>
                  <CippFormCondition
                    formControl={formControl}
                    field="calendarPermission"
                    compareType="valueEq"
                    compareValue="Editor"
                  >
                    <Grid size={{ md: 6, xs: 12 }}>
                      <CippFormComponent
                        type="switch"
                        label="Can View Private Items"
                        name="canViewPrivateItems"
                        formControl={formControl}
                      />
                    </Grid>
                  </CippFormCondition>
                </CippFormCondition>
              </Grid>
            </CippFormCondition>
          </Stack>
        </CardContent>
      </Card>

      {/* Out of Office Section */}
      <Card variant="outlined">
        <CardHeader
          title="Out of Office"
          subheader="Automatically enable and disable auto-reply messages during vacation"
        />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
            <CippFormComponent
              type="switch"
              name="enableOOO"
              label="Enable Out of Office"
              formControl={formControl}
            />

            <CippFormCondition
              formControl={formControl}
              field="enableOOO"
              compareType="is"
              compareValue={true}
              clearOnHide={false}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Out of office will be enabled with the messages below at the start date and
                    automatically disabled at the end date. The disable task preserves any message
                    updates the user may have made during their vacation.
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  {isFetchingOOO ? (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Internal Message
                      </Typography>
                      <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
                    </>
                  ) : (
                    <CippFormComponent
                      type="richText"
                      name="oooInternalMessage"
                      label="Internal Message"
                      formControl={formControl}
                      multiline
                      rows={4}
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 12 }}>
                  {isFetchingOOO ? (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        External Message (optional)
                      </Typography>
                      <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
                    </>
                  ) : (
                    <CippFormComponent
                      type="richText"
                      name="oooExternalMessage"
                      label="External Message (optional)"
                      formControl={formControl}
                      multiline
                      rows={4}
                    />
                  )}
                </Grid>
              </Grid>
            </CippFormCondition>
          </Stack>
        </CardContent>
      </Card>

      <CippWizardStepButtons
        currentStep={currentStep}
        lastStep={lastStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
        nextButtonDisabled={!atLeastOneEnabled}
      />
    </Stack>
  );
};
