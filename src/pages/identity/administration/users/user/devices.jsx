import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { Check, Mail, Fingerprint } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import ReactTimeAgo from "react-time-ago";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import { Grid } from "@mui/system";
import { CippUserInfoCard } from "../../../../../components/CippCards/CippUserInfoCard";
import { Typography } from "@mui/material";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;

  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListUsers-${userId}`,
  });

  const MFARequest = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `/users/${userId}/authentication/methods`,
      tenantFilter: userSettingsDefaults.currentTenant,
      noPagination: true,
      $top: 99,
    },
    queryKey: `MFA-${userId}`,
  });

  const signInLogs = ApiGetCall({
    url: `/api/ListUserSigninLogs?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}&top=1`,
    queryKey: `ListSignIns-${userId}`,
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
              Created: <ReactTimeAgo date={new Date(userRequest.data?.[0]?.createdDateTime)} />{" "}
            </>
          ),
        },
      ]
    : [];

  const data = userRequest.data?.[0];

  // Prepare the sign-in log item
  let signInLogItem = null;
  let conditionalAccessPoliciesItems = [];
  let mfaDevicesItems = [];

  if (signInLogs.isSuccess && signInLogs.data && signInLogs.data.length > 0) {
    const signInData = signInLogs.data[0];

    signInLogItem = {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: new Date(signInData.createdDateTime).getDate().toString(),
        cardLabelBoxText: new Date(signInData.createdDateTime).toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
      },
      text: `Login ${signInData.status.errorCode === 0 ? "successful" : "failed"} from ${
        signInData.ipAddress || "unknown location"
      }`,
      subtext: `Logged into application ${signInData.resourceDisplayName || "Unknown Application"}`,
      statusColor: signInData.status.errorCode === 0 ? "success.main" : "error.main",
      statusText: signInData.status.errorCode === 0 ? "Success" : "Failed",
      propertyItems: [
        {
          label: "Client App Used",
          value: signInData.clientAppUsed || "N/A",
        },
        {
          label: "Device Detail",
          value:
            signInData.deviceDetail?.operatingSystem || signInData.deviceDetail?.browser || "N/A",
        },
        {
          label: "MFA Type used",
          value: signInData.mfaDetail?.authMethod || "N/A",
        },
        {
          label: "Additional Details",
          value: signInData.status?.additionalDetails || "N/A",
        },
      ],
    };

    // Prepare the conditional access policies items
    if (
      signInData.appliedConditionalAccessPolicies &&
      Array.isArray(signInData.appliedConditionalAccessPolicies)
    ) {
      // Filter policies where result is "success"
      const appliedPolicies = signInData.appliedConditionalAccessPolicies.filter(
        (policy) => policy.result === "success"
      );

      if (appliedPolicies.length > 0) {
        conditionalAccessPoliciesItems = appliedPolicies.map((policy) => ({
          id: policy.id,
          cardLabelBox: {
            cardLabelBoxHeader: new Date(signInData.createdDateTime).getDate().toString(),
            cardLabelBoxText: new Date(signInData.createdDateTime).toLocaleString("default", {
              month: "short",
              year: "numeric",
            }),
          },
          text: policy.displayName,
          subtext: `Policy applied: ${policy.result}`,
          statusColor: "success.main",
          statusText: "Applied",
          propertyItems: [
            {
              label: "Grant Controls",
              value:
                policy.enforcedGrantControls.length > 0
                  ? policy.enforcedGrantControls.join(", ")
                  : "None",
            },
            {
              label: "Session Controls",
              value:
                policy.enforcedSessionControls.length > 0
                  ? policy.enforcedSessionControls.join(", ")
                  : "None",
            },
            {
              label: "Conditions Satisfied",
              value: policy.conditionsSatisfied || "N/A",
            },
          ],
        }));
      } else {
        // No applied policies
        conditionalAccessPoliciesItems = [
          {
            id: 1,
            cardLabelBox: {
              cardLabelBoxHeader: new Date(signInData.createdDateTime).getDate().toString(),
              cardLabelBoxText: new Date(signInData.createdDateTime).toLocaleString("default", {
                month: "short",
                year: "numeric",
              }),
            },
            text: "No conditional access policies applied",
            subtext: "No conditional access policies were applied during this sign-in.",
            statusColor: "warning.main",
            statusText: "No Policies Applied",
            propertyItems: [],
          },
        ];
      }
    } else {
      // appliedConditionalAccessPolicies is missing or not an array
      conditionalAccessPoliciesItems = [
        {
          id: 1,
          cardLabelBox: {
            cardLabelBoxHeader: new Date(signInData.createdDateTime).getDate().toString(),
            cardLabelBoxText: new Date(signInData.createdDateTime).toLocaleString("default", {
              month: "short",
              year: "numeric",
            }),
          },
          text: "No conditional access policies available",
          subtext: "No conditional access policies data is available for this sign-in.",
          statusColor: "warning.main",
          statusText: "No Data",
          propertyItems: [],
        },
      ];
    }
  } else if (signInLogs.isError) {
    signInLogItem = {
      id: 1,
      cardLabelBox: "!",
      text: "Error loading sign-in logs. Do you have a P1 license?",
      subtext: signInLogs.error.message,
      statusColor: "error.main",
      statusText: "Error",
      propertyItems: [],
    };

    // Handle error for conditional access policies
    conditionalAccessPoliciesItems = [
      {
        id: 1,
        cardLabelBox: "!",
        text: "Error loading conditional access policies. Do you have a P1 license?",
        subtext: signInLogs.error.message,
        statusColor: "error.main",
        statusText: "Error",
        propertyItems: [],
      },
    ];
  } else if (signInLogs.isSuccess && (!signInLogs.data || signInLogs.data.length === 0)) {
    signInLogItem = {
      id: 1,
      cardLabelBox: "-",
      text: "No sign-in logs available",
      subtext:
        "There are no sign-in logs for this user, or you do not have a P1 license to detect this data.",
      statusColor: "warning.main",
      statusText: "No Data",
      propertyItems: [],
    };

    conditionalAccessPoliciesItems = [
      {
        id: 1,
        cardLabelBox: "-",
        text: "No conditional access policies available",
        subtext:
          "There are no conditional access policies for this user, or you do not have a P1 license to detect this data.",
        statusColor: "warning.main",
        statusText: "No Data",
        propertyItems: [],
      },
    ];
  }

  // Prepare MFA devices items
  if (MFARequest.isSuccess && MFARequest.data) {
    const mfaResults = MFARequest.data.Results || [];

    // Exclude password authentication method
    const mfaDevices = mfaResults.filter(
      (method) => method["@odata.type"] !== "#microsoft.graph.passwordAuthenticationMethod"
    );

    if (mfaDevices.length > 0) {
      mfaDevicesItems = mfaDevices.map((device, index) => ({
        id: index,
        cardLabelBox: {
          cardLabelBoxHeader: <Check />,
        },
        text: device.displayName || "MFA Device",
        subtext: device.deviceTag || device.clientAppName || "Unknown device",
        statusColor: "success.main",
        statusText: "Enabled",
        propertyItems: [
          {
            label: "Device Name",
            value: device.displayName || "N/A",
          },
          {
            label: "App Version",
            value: device.phoneAppVersion || "N/A",
          },
          {
            label: "Created Date",
            value: device.createdDateTime
              ? new Date(device.createdDateTime).toLocaleString()
              : "N/A",
          },
          {
            label: "Authentication Method",
            value: device["@odata.type"]?.split(".").pop() || "N/A",
          },
        ],
      }));
    } else {
      // No MFA devices other than password
      mfaDevicesItems = [
        {
          id: 1,
          cardLabelBox: "-",
          text: "No MFA devices available",
          subtext: "The user does not have any MFA devices registered.",
          statusColor: "warning.main",
          statusText: "No Devices",
          propertyItems: [],
        },
      ];
    }
  } else if (MFARequest.isError) {
    // Error fetching MFA devices
    mfaDevicesItems = [
      {
        id: 1,
        cardLabelBox: "!",
        text: "Error loading MFA devices",
        subtext: MFARequest.error.message,
        statusColor: "error.main",
        statusText: "Error",
        propertyItems: [],
      },
    ];
  } else if (MFARequest.isSuccess && (!MFARequest.data || !MFARequest.data.Results)) {
    // No MFA devices data available
    mfaDevicesItems = [
      {
        id: 1,
        cardLabelBox: "-",
        text: "No MFA devices available",
        subtext: "The user does not have any MFA devices registered.",
        statusColor: "warning.main",
        statusText: "No Devices",
        propertyItems: [],
      },
    ];
  }

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
            py: 4,
          }}
        >
          <Grid container spacing={2}>
            <Grid item size={4}>
              <CippUserInfoCard user={data} isFetching={userRequest.isLoading} />
            </Grid>
            <Grid item size={8}>
              <Stack spacing={3}>
                <Typography variant="h6">Latest Logon</Typography>
                <CippBannerListCard
                  isFetching={signInLogs.isLoading}
                  items={signInLogItem ? [signInLogItem] : []}
                  isCollapsible={signInLogItem ? true : false}
                />
                <Typography variant="h6">Applied Conditional Access Policies</Typography>
                <CippBannerListCard
                  isFetching={signInLogs.isLoading}
                  items={conditionalAccessPoliciesItems}
                  isCollapsible={conditionalAccessPoliciesItems.length > 0 ? true : false}
                />
                <Typography variant="h6">Multi-Factor Authentication Devices</Typography>
                <CippBannerListCard
                  isFetching={MFARequest.isLoading}
                  items={mfaDevicesItems}
                  isCollapsible={mfaDevicesItems.length > 0 ? true : false}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
