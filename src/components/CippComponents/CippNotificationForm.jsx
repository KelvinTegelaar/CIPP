import { useEffect } from "react";
import { Button, Box } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "./CippFormComponent";
import { CippFormCondition } from "./CippFormCondition";
import { ApiGetCall } from "../../api/ApiCall";
import { useDialog } from "../../hooks/use-dialog";
import { CippApiDialog } from "./CippApiDialog";
import { useFormState } from "react-hook-form";
import { useSettings } from "../../hooks/use-settings";

export const CippNotificationForm = ({
  formControl,
  showTestButton = true,
}) => {
  const notificationDialog = useDialog();
  const settings = useSettings();
  const currentTenant = settings.currentTenant;

  // API call to get notification configuration
  const listNotificationConfig = ApiGetCall({
    url: "/api/ListNotificationConfig",
    queryKey: "ListNotificationConfig",
  });

  const formState = useFormState({ control: formControl.control });

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

  const webhookAuthTypes = [
    { label: "None", value: "None" },
    { label: "Bearer Token", value: "Bearer" },
    { label: "Basic Auth", value: "Basic" },
    { label: "API Key Header", value: "ApiKey" },
    { label: "Custom Headers (JSON)", value: "CustomHeaders" },
  ];

  // Load notification config data into form
  useEffect(() => {
    if (listNotificationConfig.isSuccess) {
      const logsToInclude = listNotificationConfig.data?.logsToInclude
        ?.map((log) => logTypes.find((logType) => logType.value === log))
        .filter(Boolean);

      const Severity = listNotificationConfig.data?.Severity?.map((sev) =>
        severityTypes.find((stype) => stype.value === sev),
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
        UseStandardizedSchema: listNotificationConfig.data?.UseStandardizedSchema || false,
        webhookAuthType: webhookAuthTypes.find(
          (type) => type.value === listNotificationConfig.data?.webhookAuthType,
        ) || webhookAuthTypes[0],
        webhookAuthToken: listNotificationConfig.data?.webhookAuthToken,
        webhookAuthUsername: listNotificationConfig.data?.webhookAuthUsername,
        webhookAuthPassword: listNotificationConfig.data?.webhookAuthPassword,
        webhookAuthHeaderName: listNotificationConfig.data?.webhookAuthHeaderName,
        webhookAuthHeaderValue: listNotificationConfig.data?.webhookAuthHeaderValue,
        webhookAuthHeaders: listNotificationConfig.data?.webhookAuthHeaders,
      });
    }
  }, [listNotificationConfig.isSuccess, listNotificationConfig.dataUpdatedAt]);

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
              helperText="Enter one or more email addresses to receive notifications."
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              disabled={listNotificationConfig.isFetching}
              type="textField"
              label="Webhook URL"
              name="webhook"
              formControl={formControl}
              helperText="Enter the webhook URL to send notifications to. The URL should be configured to receive a POST request."
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              disabled={listNotificationConfig.isFetching}
              type="autoComplete"
              label="Webhook Endpoint Authentication"
              name="webhookAuthType"
              creatable={false}
              multiple={false}
              options={webhookAuthTypes}
              formControl={formControl}
            />
          </Grid>
          <CippFormCondition
            field="webhookAuthType"
            compareType="valueEq"
            compareValue="Bearer"
            formControl={formControl}
            clearOnHide={false}
          >
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                disabled={listNotificationConfig.isFetching}
                type="password"
                label="Webhook Bearer Token"
                name="webhookAuthToken"
                formControl={formControl}
                helperText="Used when auth type is Bearer Token."
              />
            </Grid>
          </CippFormCondition>

          <CippFormCondition
            field="webhookAuthType"
            compareType="valueEq"
            compareValue="Basic"
            formControl={formControl}
            clearOnHide={false}
          >
            <>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  disabled={listNotificationConfig.isFetching}
                  type="textField"
                  label="Webhook Basic Username"
                  name="webhookAuthUsername"
                  formControl={formControl}
                  helperText="Used when auth type is Basic Auth."
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  disabled={listNotificationConfig.isFetching}
                  type="password"
                  label="Webhook Basic Password"
                  name="webhookAuthPassword"
                  formControl={formControl}
                  helperText="Used when auth type is Basic Auth."
                />
              </Grid>
            </>
          </CippFormCondition>

          <CippFormCondition
            field="webhookAuthType"
            compareType="valueEq"
            compareValue="ApiKey"
            formControl={formControl}
            clearOnHide={false}
          >
            <>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  disabled={listNotificationConfig.isFetching}
                  type="textField"
                  label="Webhook API Key Header Name"
                  name="webhookAuthHeaderName"
                  formControl={formControl}
                  helperText="Used when auth type is API Key Header (example: x-api-key)."
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <CippFormComponent
                  disabled={listNotificationConfig.isFetching}
                  type="password"
                  label="Webhook API Key Header Value"
                  name="webhookAuthHeaderValue"
                  formControl={formControl}
                  helperText="Used when auth type is API Key Header."
                />
              </Grid>
            </>
          </CippFormCondition>

          <CippFormCondition
            field="webhookAuthType"
            compareType="valueEq"
            compareValue="CustomHeaders"
            formControl={formControl}
            clearOnHide={false}
          >
            <Grid size={{ xs: 12 }}>
              <CippFormComponent
                disabled={listNotificationConfig.isFetching}
                type="password"
                label="Webhook Custom Headers JSON"
                name="webhookAuthHeaders"
                formControl={formControl}
                helperText={'Used when auth type is Custom Headers. Example: {"Authorization":"Bearer token","x-api-key":"value"}'}
              />
            </Grid>
          </CippFormCondition>
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
            <CippFormComponent
              type="switch"
              disabled={listNotificationConfig.isFetching}
              label="Use Standardized Alert Schema"
              name="UseStandardizedSchema"
              formControl={formControl}
              helperText="Enable standardized JSON schema for webhook alerts. This provides a consistent structure across all alert types, making Power Automate and Logic Apps integrations easier. Disabled by default for backward compatibility."
            />
          </Grid>
          {showTestButton && (
            <Grid size={{ xs: 12 }}>
              <Button
                variant="outlined"
                onClick={notificationDialog.handleOpen}
                disabled={formState.isDirty}
              >
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
              tenantFilter: currentTenant,
              text: "This is a test from Notification Settings",
            }),
          }}
          allowResubmit={true}
        />
      )}
    </>
  );
};

export default CippNotificationForm;
