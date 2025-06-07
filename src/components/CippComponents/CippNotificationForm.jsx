import { useEffect } from "react";
import { Button, Box } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "./CippFormComponent";
import { ApiGetCall } from "../../api/ApiCall";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "./CippApiDialog";

export const CippNotificationForm = ({
  formControl,
  showTestButton = true,
  hideButtons = false,
}) => {
  const notificationDialog = useDialog();

  // API call to get notification configuration
  const listNotificationConfig = ApiGetCall({
    url: "/api/ListNotificationConfig",
    queryKey: "ListNotificationConfig",
  });

  // Define log types and severity types
  const logTypes = [
    { label: "Updates Status", value: "Updates" },
    { label: "All Standards", value: "Standards" },
    { label: "Token Events", value: "TokensUpdater" },
    { label: "Changing DNS Settings", value: "ExecDnsConfig" },
    { label: "Adding excluded licenses", value: "ExecExcludeLicenses" },
    { label: "Adding excluded tenants", value: "ExecExcludeTenant" },
    { label: "Editing a user", value: "EditUser" },
    { label: "Adding or deploying applications", value: "ChocoApp" },
    { label: "Adding autopilot devices", value: "AddAPDevice" },
    { label: "Editing a tenant", value: "EditTenant" },
    { label: "Adding an MSP app", value: "AddMSPApp" },
    { label: "Adding a user", value: "AddUser" },
    { label: "Adding a group", value: "AddGroup" },
    { label: "Adding a tenant", value: "NewTenant" },
    { label: "Executing the offboard wizard", value: "ExecOffboardUser" },
  ];

  const severityTypes = [
    { label: "Alert", value: "Alert" },
    { label: "Error", value: "Error" },
    { label: "Info", value: "Info" },
    { label: "Warning", value: "Warning" },
    { label: "Critical", value: "Critical" },
  ];

  // Load notification config data into form
  useEffect(() => {
    if (listNotificationConfig.isSuccess) {
      const logsToInclude = listNotificationConfig.data?.logsToInclude
        ?.map((log) => logTypes.find((logType) => logType.value === log))
        .filter(Boolean);

      const Severity = listNotificationConfig.data?.Severity?.map((sev) =>
        severityTypes.find((stype) => stype.value === sev)
      ).filter(Boolean);

      formControl.reset({
        ...formControl.getValues(),
        email: listNotificationConfig.data?.email,
        webhook: listNotificationConfig.data?.webhook,
        logsToInclude,
        Severity,
        onePerTenant: listNotificationConfig.data?.onePerTenant,
        sendtoIntegration: listNotificationConfig.data?.sendtoIntegration,
        includeTenantId: listNotificationConfig.data?.includeTenantId,
      });
    }
  }, [listNotificationConfig.isSuccess]);

  return (
    <>
      <Box sx={{ my: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              disabled={listNotificationConfig.isFetching}
              type="textField"
              fullWidth
              label="Email Addresses (Comma separated)"
              name="email"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              disabled={listNotificationConfig.isFetching}
              type="textField"
              label="Webhook URL"
              name="webhook"
              formControl={formControl}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              disabled={listNotificationConfig.isFetching}
              type="autoComplete"
              label="Choose which logs you would like to receive alerts from"
              name="logsToInclude"
              options={logTypes}
              formControl={formControl}
              multiple
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              disabled={listNotificationConfig.isFetching}
              type="autoComplete"
              label="Choose which severity of alert you want to be notified for"
              name="Severity"
              isFetching={listNotificationConfig.isFetching}
              options={severityTypes}
              formControl={formControl}
              multiple
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="switch"
              disabled={listNotificationConfig.isFetching}
              label="Receive one email per tenant"
              name="onePerTenant"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              disabled={listNotificationConfig.isFetching}
              label="Send to integration - This allows you to send alerts to your PSA."
              name="sendtoIntegration"
              formControl={formControl}
            />
          </Grid>
          {showTestButton && (
            <Grid size={{ xs: 12 }}>
              <Button variant="outlined" onClick={notificationDialog.handleOpen}>
                Send Test Alert
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>
      {showTestButton && (
        <CippApiDialog
          row={formControl.getValues()}
          useDefaultValues
          title="Send Test Alert"
          createDialog={notificationDialog}
          fields={[
            {
              type: "switch",
              name: "writeLog",
              label: "Write Alert to Logbook (Notifications are sent hourly)",
            },
            {
              type: "switch",
              name: "sendEmailNow",
              label: "Send Email Now",
            },
            {
              type: "switch",
              name: "sendWebhookNow",
              label: "Send Webhook Now",
            },
            {
              type: "switch",
              name: "sendPsaNow",
              label: "Send to PSA Now",
            },
          ]}
          api={{
            confirmText:
              "Are you sure you want to send a test alert to the email address(es) and webhook URL configured?",
            url: "/api/ExecAddAlert",
            type: "POST",
            dataFunction: (row) => ({
              ...row,
              text: "This is a test from Notification Settings",
            }),
          }}
        />
      )}
    </>
  );
};

export default CippNotificationForm;
