import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { useForm } from "react-hook-form";
import { Button, Grid, Typography, Link } from "@mui/material";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall } from "../../../api/ApiCall";
import { useEffect } from "react";
import { CippPropertyList } from "../../../components/CippComponents/CippPropertyList";
import { CippCodeBlock } from "../../../components/CippComponents/CippCodeBlock";
import { CippTimeAgo } from "../../../components/CippComponents/CippTimeAgo";

const Page = () => {
  const pageTitle = "Partner Webhooks";

  const formControl = useForm({
    mode: "onChange",
  });

  const listSubscription = ApiGetCall({
    url: "/api/ExecPartnerWebhook",
    data: { Action: "ListSubscription" },
    queryKey: "listSubscription",
  });

  const listEventTypes = ApiGetCall({
    url: "/api/ExecPartnerWebhook",
    data: { Action: "ListEventTypes" },
    queryKey: "listEventTypes",
  });

  useEffect(() => {
    if (listSubscription.isSuccess && listEventTypes.isSuccess) {
      formControl.reset({
        EventType: listSubscription?.data?.Results?.webhookEvents?.map((eventType) => {
          var event = listEventTypes?.data?.Results?.find((event) => event === eventType);
          return { label: event, value: event };
        }),
      });
    }
  }, [listSubscription.isSuccess, listEventTypes.isSuccess]);

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
        <Button variant="outlined" onClick={() => console.log("test")}>
          Test Webhook
        </Button>
      }
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Subscribe to Microsoft Partner center webhooks to enable automatic tenant onboarding and
            alerting. Updating the settings will replace any existing webhook subscription with one
            pointing to CIPP. Refer to the{" "}
            <Link
              href="https://learn.microsoft.com/en-us/partner-center/developer/partner-center-webhooks"
              target="_blank"
              rel="noreferrer"
            >
              Microsoft Partner Center documentation
            </Link>{" "}
            for more information on the webhook types.
          </Typography>
        </Grid>
        <Grid item xs={12} md={12}>
          <CippPropertyList
            sx={{ mb: 3, mx: 0, p: 0 }}
            propertyItems={[
              {
                label: "Webhook URL",
                value: <CippCodeBlock code={listSubscription?.data?.Results?.webhookUrl} />,
                sx: { pl: 0 },
              },
              {
                label: "Last Updated",
                value: (
                  <CippTimeAgo data={listSubscription?.data?.Results?.lastModifiedTimestamp} />
                ),
              },
            ]}
            layout="double"
            showDivider={false}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <CippFormComponent
            type="autoComplete"
            fullWidth
            label="Event Types"
            name="EventType"
            options={listSubscription?.data?.Results?.webhookEvents.map((eventType) => {
              return { label: eventType, value: eventType };
            })}
            formControl={formControl}
          />
        </Grid>
      </Grid>
    </CippFormPage>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
