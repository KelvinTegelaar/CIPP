import { useState } from "react";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { Mail, Fingerprint, Launch } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import ReactTimeAgo from "react-time-ago";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack, Typography, Button } from "@mui/material";
import { Grid } from "@mui/system";
import CippFormComponent from "/src/components/CippComponents/CippFormComponent";
import countryList from "/src/data/countryList";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import { useForm } from "react-hook-form";
import CippButtonCard from "../../../../../components/CippCards/CippButtonCard";
import { ApiGetCall, ApiPostCall } from "../../../../../api/ApiCall";
import { CippApiResults } from "../../../../../components/CippComponents/CippApiResults";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;

  const tenant = userSettingsDefaults.currentTenant;
  const [formParams, setFormParams] = useState(false);

  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${tenant}`,
    queryKey: `ListUsers-${userId}`,
  });

  // Set the title and subtitle for the layout
  const title = userRequest.isSuccess ? userRequest.data?.[0]?.displayName : "Loading...";

  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.userPrincipalName} />,
        },
        {
          icon: <Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.id} />,
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created: <ReactTimeAgo date={new Date(userRequest.data?.[0]?.createdDateTime)} />
            </>
          ),
        },
        {
          icon: <Launch style={{ color: "#667085" }} />,
          text: (
            <Button
              color="muted"
              style={{ paddingLeft: 0 }}
              size="small"
              href={`https://entra.microsoft.com/${userSettingsDefaults.currentTenant}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View in Entra
            </Button>
          ),
        },
      ]
    : [];

  // Initialize React Hook Form
  const formControl = useForm();

  const postRequest = ApiPostCall({
    url: "/api/ExecCACheck",
    relatedQueryKeys: `ExecCACheck-${tenant}-${userId}-${JSON.stringify(formParams)}`,
  });
  const onSubmit = (data) => {
    //add userId and tenantFilter to the object
    data.userId = {};
    data.userId["value"] = userId;
    data.tenantFilter = tenant;
    setFormParams(data);
    postRequest.mutate({
      url: "/api/ExecCACheck",
      data: data,
      queryKey: `ExecCACheck-${tenant}-${userId}-${JSON.stringify(formParams)}`,
    });
  };

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      isFetching={userRequest.isLoading}
    >
      {userRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {userRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 1,
          }}
        >
          <Grid container spacing={2}>
            {/* Form Section */}
            <Grid size={{ md: 4, xs: 12 }}>
              <CippButtonCard
                title={"Test Conditional Access Policy"}
                CardButton={
                  <Button type="submit" variant="contained" form="ca-test-form">
                    Test policies
                  </Button>
                }
              >
                {/* Form Starts Here */}
                <form id="ca-test-form" onSubmit={formControl.handleSubmit(onSubmit)}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Test your conditional access policies before putting them in production. The
                    returned results will show you if the user is allowed or denied access based on
                    the policy.
                  </Typography>

                  <Stack spacing={2}>
                    {/* Mandatory Parameters */}
                    <Typography variant="subtitle1">Mandatory Parameters:</Typography>
                    <CippFormComponent
                      type="autoComplete"
                      label="Select the application to test"
                      name="includeApplications"
                      multiple={false}
                      api={{
                        tenantFilter: tenant,
                        url: "/api/ListGraphRequest",
                        dataKey: "Results",
                        labelField: (option) => `${option.displayName}`,
                        valueField: "id",
                        queryKey: `ServicePrincipals-${tenant}`,
                        data: {
                          Endpoint: "ServicePrincipals",
                          manualPagination: true,
                          $select: "id,displayName",
                          $count: true,
                          $orderby: "displayName",
                          $top: 999,
                        },
                      }}
                      formControl={formControl}
                    />

                    {/* Optional Parameters */}
                    <Typography variant="subtitle1">Optional Parameters:</Typography>

                    {/* Test from this country */}
                    <CippFormComponent
                      type="autoComplete"
                      label="Test from this country"
                      name="country"
                      options={countryList.map(({ Code, Name }) => ({
                        value: Code,
                        label: Name,
                      }))}
                      formControl={formControl}
                    />

                    {/* Test from this IP */}
                    <CippFormComponent
                      type="textField"
                      label="Test from this IP"
                      name="IpAddress"
                      placeholder="8.8.8.8"
                      formControl={formControl}
                    />

                    {/* Device Platform */}
                    <CippFormComponent
                      type="autoComplete"
                      label="Select the device platform to test"
                      name="devicePlatform"
                      options={[
                        { value: "Windows", label: "Windows" },
                        { value: "iOS", label: "iOS" },
                        { value: "Android", label: "Android" },
                        { value: "MacOS", label: "MacOS" },
                        { value: "Linux", label: "Linux" },
                      ]}
                      formControl={formControl}
                    />

                    {/* Client Application Type */}
                    <CippFormComponent
                      type="autoComplete"
                      label="Select the client application type to test"
                      name="clientAppType"
                      options={[
                        { value: "all", label: "All" },
                        { value: "Browser", label: "Browser" },
                        {
                          value: "mobileAppsAndDesktopClients",
                          label: "Mobile apps and desktop clients",
                        },
                        { value: "exchangeActiveSync", label: "Exchange ActiveSync" },
                        { value: "easSupported", label: "EAS supported" },
                        { value: "other", label: "Other clients" },
                      ]}
                      formControl={formControl}
                    />

                    {/* Sign-in risk level */}
                    <CippFormComponent
                      type="autoComplete"
                      label="Select the sign-in risk level of the user signing in"
                      name="SignInRiskLevel"
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                        { value: "none", label: "None" },
                      ]}
                      formControl={formControl}
                    />

                    {/* User risk level */}
                    <CippFormComponent
                      type="autoComplete"
                      label="Select the user risk level of the user signing in"
                      name="userRiskLevel"
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                        { value: "none", label: "None" },
                      ]}
                      formControl={formControl}
                    />
                    <CippApiResults apiObject={postRequest} errorsOnly={true} />
                  </Stack>
                </form>
              </CippButtonCard>
            </Grid>
            <Grid size={{ md: 8, xs: 12 }}>
              <CippDataTable
                queryKey={`ExecCACheck-${tenant}-${userId}-${JSON.stringify(formParams)}`}
                title={"CA Test Results"}
                simple={true}
                simpleColumns={["displayName", "state", "policyApplies", "reasons"]}
                data={postRequest.data?.data?.Results?.value || []}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
