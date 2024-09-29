import { Grid, Stack, Typography } from "@mui/material";
import CippWizardStepButtons from "./CippWizardStepButtons";
import CippFormComponent from "../CippComponents/CippFormComponent";
import { CippFormCondition } from "../CippComponents/CippFormCondition";

export const CippWizardOffboarding = (props) => {
  const { postUrl, formControl, onPreviousStep, onNextStep, currentStep } = props;
  const currentTenant = formControl.watch("tenantFilter");

  return (
    <Stack spacing={3}>
      <>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CippFormComponent
              name="ConvertToShared"
              label="Convert to Shared Mailbox"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="HideFromGAL"
              label="Hide from Global Address List"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="removeCalendarInvites"
              label="Cancel all calendar invites"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="removePermissions"
              label="Remove users mailbox permissions"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="RemoveRules"
              label="Remove all Rules"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="RemoveMobile"
              label="Remove all Mobile Devices"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="RemoveGroups"
              label="Remove from all groups"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="RemoveLicenses"
              label="Remove Licenses"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="RevokeSessions"
              label="Revoke all sessions"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="DisableSignIn"
              label="Disable Sign in"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="ResetPass"
              label="Reset Password"
              type="switch"
              formControl={formControl}
            />
            <CippFormComponent
              name="DeleteUser"
              label="Delete user"
              type="switch"
              formControl={formControl}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CippFormComponent
              name="OOO"
              label="Out of Office"
              type="textField"
              placeholder="leave blank to not set"
              fullWidth
              formControl={formControl}
            />

            <CippFormComponent
              name="AccessNoAutomap"
              label="Give other user full access on mailbox without automapping"
              type="autoComplete"
              placeholder="leave blank to not set"
              formControl={formControl}
              multi
              api={{
                tenantFilter: currentTenant ? currentTenant.value : undefined,
                url: "/api/ListGraphRequest",
                dataKey: "Results",
                labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                valueField: "id",
                data: {
                  Endpoint: "users",
                  manualPagination: true,
                  $select: "id,userPrincipalName,displayName",
                  $count: true,
                  $orderby: "displayName",
                  $top: 999,
                },
              }}
            />

            <CippFormComponent
              name="AccessAutomap"
              label="Give other user full access on mailbox with automapping"
              type="autoComplete"
              placeholder="leave blank to not set"
              formControl={formControl}
              multi
              api={{
                labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                valueField: "id",
                url: "/api/ListGraphRequest",
                dataKey: "Results",
                tenantFilter: currentTenant ? currentTenant.value : undefined,
                data: {
                  Endpoint: "users",
                  manualPagination: true,
                  $select: "id,userPrincipalName,displayName",
                  $count: true,
                  $orderby: "displayName",
                  $top: 999,
                },
              }}
            />

            <CippFormComponent
              name="OnedriveAccess"
              label="Give other user full access on Onedrive"
              type="autoComplete"
              placeholder="leave blank to not give access"
              formControl={formControl}
              multi
              api={{
                tenantFilter: currentTenant ? currentTenant.value : undefined,
                labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                valueField: "id",
                url: "/api/ListGraphRequest",
                dataKey: "Results",
                data: {
                  Endpoint: "users",
                  manualPagination: true,
                  $select: "id,userPrincipalName,displayName",
                  $count: true,
                  $orderby: "displayName",
                  $top: 999,
                },
              }}
            />

            <CippFormComponent
              name="forward"
              label="Forward email to other user"
              type="autoComplete"
              placeholder="leave blank to not forward"
              formControl={formControl}
              multiple={false}
              api={{
                tenantFilter: currentTenant ? currentTenant.value : undefined,
                labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
                valueField: "id",
                url: "/api/ListGraphRequest",
                dataKey: "Results",
                data: {
                  Endpoint: "users",
                  manualPagination: true,
                  $select: "id,userPrincipalName,displayName",
                  $count: true,
                  $orderby: "displayName",
                  $top: 999,
                },
              }}
            />

            <CippFormComponent
              name="keepCopy"
              label="Keep a copy of the forwarded mail in the source mailbox"
              type="switch"
              formControl={formControl}
            />
          </Grid>
        </Grid>

        <hr className="my-4" />

        <Grid container spacing={3}>
          <Grid item>
            <CippFormComponent
              name="Scheduled.enabled"
              label="Schedule this offboarding"
              type="switch"
              formControl={formControl}
            />
          </Grid>

          <CippFormCondition
            formControl={formControl}
            field={"Scheduled.enabled"}
            compareType="is"
            compareValue={true}
          >
            <Grid item>
              <Typography>Scheduled Offboarding Date</Typography>
              <CippFormComponent
                name="Scheduled.date"
                type="datePicker"
                formControl={formControl}
                fullWidth
              />
            </Grid>

            <Grid item>
              <Typography>Send results to</Typography>
              <CippFormComponent
                name="webhook"
                label="Webhook"
                type="switch"
                formControl={formControl}
              />
              <CippFormComponent
                name="email"
                label="E-mail"
                type="switch"
                formControl={formControl}
              />
              <CippFormComponent name="psa" label="PSA" type="switch" formControl={formControl} />
            </Grid>
          </CippFormCondition>
        </Grid>
      </>
      <CippWizardStepButtons
        postUrl={postUrl}
        currentStep={currentStep}
        onPreviousStep={onPreviousStep}
        onNextStep={onNextStep}
        formControl={formControl}
      />
    </Stack>
  );
};
