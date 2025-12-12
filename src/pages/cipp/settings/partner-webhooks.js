import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippFormPage from "/src/components/CippFormPages/CippFormPage";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Typography,
  Link,
  CardHeader,
  CardContent,
  IconButton,
  SvgIcon,
} from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import { ApiGetCall, ApiPostCall } from "../../../api/ApiCall";
import { useEffect } from "react";
import { CippPropertyList } from "../../../components/CippComponents/CippPropertyList";
import { CippCodeBlock } from "../../../components/CippComponents/CippCodeBlock";
import { CippTimeAgo } from "../../../components/CippComponents/CippTimeAgo";
import { useState } from "react";
import { Close } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Automated onboarding";
  const [testRunning, setTestRunning] = useState(false);
  const [correlationId, setCorrelationId] = useState(null);
  const [validateRunning, setValidateRunning] = useState(false);

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

  const sendTest = ApiPostCall({
    urlFromData: true,
  });

  const validateTest = ApiGetCall({
    url: `/api/ExecPartnerWebhook`,
    data: { Action: "ValidateTest", CorrelationId: correlationId },
    waiting: validateRunning,
  });

  const handleStartTest = () => {
    setTestRunning(true);
    sendTest.mutate(
      {
        url: "/api/ExecPartnerWebhook?Action=SendTest",
        data: {},
      },
      {
        onSuccess: (data) => {
          if (data?.data?.Results?.correlationId) {
            setTimeout(() => {
              setCorrelationId(data?.data?.Results?.correlationId);
              setValidateRunning(true);
              validateTest.refetch();
            }, 1000);
          }
        },
      }
    );
  };

  useEffect(() => {
    if (
      correlationId &&
      validateRunning &&
      validateTest.isSuccess &&
      validateTest?.data?.Results?.status === "Submitted"
    ) {
      setTimeout(() => {
        validateTest.refetch();
      }, 1000);
    } else if (
      validateTest.isSuccess &&
      (validateTest?.data?.Results?.status === "completed" ||
        validateTest?.data?.Results?.status === "failed")
    ) {
      setValidateRunning(false);
      setCorrelationId(null);
    } else {
      setTimeout(() => {
        validateTest.refetch();
      }, 1000);
    }
  }, [validateTest.isSuccess, validateTest?.data?.Results, validateRunning]);

  useEffect(() => {
    if (listSubscription.isSuccess && listEventTypes.isSuccess) {
      formControl.reset({
        EventType: listSubscription?.data?.Results?.webhookEvents?.map((eventType) => {
          var event = listEventTypes?.data?.Results?.find((event) => event === eventType);
          return { label: event, value: event };
        }),
        standardsExcludeAllTenants: listSubscription?.data?.Results?.standardsExcludeAllTenants,
      });
    }
  }, [listSubscription.isSuccess, listEventTypes.isSuccess]);

  return (
    <CippFormPage
      title={pageTitle}
      hideBackButton={true}
      hidePageType={true}
      allowResubmit={true}
      formControl={formControl}
      resetForm={false}
      postUrl="/api/ExecPartnerWebhook?Action=CreateSubscription"
      queryKey={["listSubscription", "listEventTypes"]}
      addedButtons={
        <Button variant="outlined" onClick={handleStartTest}>
          Test Webhook
        </Button>
      }
    >
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ md: 12, xs: 12 }}>
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
        <Grid size={{ md: 12, xs: 12 }}>
          <CippPropertyList
            sx={{ mb: 3, mx: 0, p: 0 }}
            isFetching={listSubscription.isFetching}
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
        <Grid size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="autoComplete"
            fullWidth
            label="Event Types"
            name="EventType"
            isFetching={listEventTypes.isFetching}
            options={listEventTypes?.data?.Results?.map((eventType) => {
              return { label: eventType, value: eventType };
            })}
            formControl={formControl}
          />
        </Grid>
        <Grid size={{ md: 12, xs: 12 }}>
          <CippFormComponent
            type="switch"
            label="Exclude onboarded tenants from top-level standards"
            name="standardsExcludeAllTenants"
            formControl={formControl}
          />
        </Grid>
        {testRunning && (
          <Grid size={{ md: 12, xs: 12 }} sx={{ mt: 2 }}>
            <Card variant="outlined">
              <CardHeader
                title={
                  <Stack
                    direction="row"
                    sx={{ display: "flex" }}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>Test Results</Box>
                    <IconButton variant="outlined" onClick={() => setTestRunning(false)}>
                      <SvgIcon fontSize="small">
                        <Close />
                      </SvgIcon>
                    </IconButton>
                  </Stack>
                }
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ p: 0 }}>
                <CippPropertyList
                  sx={{ my: 0, mx: 0, p: 0 }}
                  isFetching={validateTest.isFetching}
                  propertyItems={[
                    {
                      label: "Response Code",
                      value: (
                        <Chip
                          color={
                            !validateTest?.data?.Results?.results?.[0].responseCode
                              ? "info"
                              : validateTest?.data?.Results?.results?.[0].responseCode === "200"
                              ? "success"
                              : "error"
                          }
                          label={validateTest?.data?.Results?.results?.[0]?.responseCode}
                        />
                      ),
                    },
                    {
                      label: "Status",
                      value: validateTest?.data?.Results?.status,
                    },
                    {
                      label: "Response Message",
                      value: validateTest?.data?.Results?.results?.[0]?.responseMessage,
                    },

                    {
                      label: "Last Run",
                      value: (
                        <CippTimeAgo
                          data={validateTest?.data?.Results?.results?.[0]?.dateTimeUtc + "Z"}
                        />
                      ),
                    },
                  ]}
                  layout="double"
                  showDivider={false}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
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
