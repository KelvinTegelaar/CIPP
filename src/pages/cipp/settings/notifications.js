import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { useForm } from "react-hook-form";
import CippFormComponent from "../../../components/CippComponents/CippFormComponent";
import { Box, Button, Grid } from "@mui/material";
import { ApiGetCall } from "../../../api/ApiCall";
import { useEffect } from "react";
import { useDialog } from "../../../hooks/use-dialog";
import { CippApiDialog } from "../../../components/CippComponents/CippApiDialog";

const Page = () => {
  const pageTitle = "Notification Settings";
  const notificationDialog = useDialog();

  const listNotificationConfig = ApiGetCall({
    url: "/api/ListNotificationConfig",
    queryKey: "ListNotificationConfig",
  });

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

  const formControl = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    if (listNotificationConfig.isSuccess) {
      var logsToInclude = [];
      listNotificationConfig.data?.logsToInclude.map((log) => {
        var logType = logTypes.find((logType) => logType.value === log);
        if (logType) {
          logsToInclude.push(logType);
        }
      });

      formControl.reset({
        email: listNotificationConfig.data?.email,
        webhook: listNotificationConfig.data?.webhook,
        logsToInclude: logsToInclude,
        Severity: listNotificationConfig.data?.Severity.map((severity) => {
          return severityTypes.find((severityType) => severityType.value === severity);
        }),
        onePerTenant: listNotificationConfig.data?.onePerTenant,
        sendtoIntegration: listNotificationConfig.data?.sendtoIntegration,
        includeTenantId: listNotificationConfig.data?.includeTenantId,
      });
    }
  }, [listNotificationConfig.isSuccess]);

  return (
    <CippFormPage
      title={pageTitle}
      hideBackButton={true}
      hidePageType={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecNotificationConfig"
      relatedQueryKeys={["ListNotificationConfig"]}
      addedButtons={
        <Button variant="outlined" onClick={notificationDialog.handleOpen}>
          Send Test Alert
        </Button>
      }
    >
      <Box sx={{ my: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <CippFormComponent
              type="textField"
              fullWidth
              label="Email Addresses (Comma separated)"
              name="email"
              formControl={formControl}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <CippFormComponent
              type="textField"
              label="Webhook URL"
              name="webhook"
              formControl={formControl}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <CippFormComponent
              type="autoComplete"
              label="Choose which logs you would like to receive alerts from"
              name="logsToInclude"
              options={logTypes}
              formControl={formControl}
              multiple={true}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <CippFormComponent
              type="autoComplete"
              label="Choose which severity of alert you want to be notified for"
              name="Severity"
              options={severityTypes}
              formControl={formControl}
              multiple={true}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <CippFormComponent
              type="switch"
              label="Receive one email per tenant"
              name="onePerTenant"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Send notifications to configured integration(s)"
              name="sendtoIntegration"
              formControl={formControl}
            />

            <CippFormComponent
              type="switch"
              label="Include Tenant ID in alerts"
              name="includeTenantId"
              formControl={formControl}
            />
          </Grid>
        </Grid>
      </Box>
      <CippApiDialog
        title="Send Test Alert"
        createDialog={notificationDialog}
        fields={[
          {
            type: "switch",
            name: "sendEmailNow",
            label: "Send Email Now",
          },
        ]}
        api={{
          confirmText:
            "Are you sure you want to send a test alert to the email address(es) and webhook URL configured?",
          url: "/api/ExecAddAlert",
          type: "POST",
          data: {},
        }}
      />
    </CippFormPage>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
