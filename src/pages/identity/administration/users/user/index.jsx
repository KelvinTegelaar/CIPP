import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall, ApiPostCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { AdminPanelSettings, Check, Group, Mail, Fingerprint, Launch } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import { Grid } from "@mui/system";
import { CippUserInfoCard } from "../../../../../components/CippCards/CippUserInfoCard";
import { SvgIcon, Typography } from "@mui/material";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { useEffect, useState } from "react";
import { useCippUserActions } from "/src/components/CippComponents/CippUserActions";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { CippDataTable } from "/src/components/CippTable/CippDataTable";
import dynamic from "next/dynamic";
const CippMap = dynamic(() => import("/src/components/CippComponents/CippMap"), { ssr: false });

import { Button, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { CippPropertyList } from "../../../../../components/CippComponents/CippPropertyList";
import { CippCodeBlock } from "../../../../../components/CippComponents/CippCodeBlock";

const SignInLogsDialog = ({ open, onClose, userId, tenantFilter }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ py: 2 }}>
        Sign-In Logs
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <CippDataTable
          noCard={true}
          title="Sign-In Logs"
          simpleColumns={[
            "createdDateTime",
            "status",
            "ipAddress",
            "clientAppUsed",
            "resourceDisplayName",
            "status.errorCode",
            "location",
          ]}
          api={{
            url: "/api/ListUserSigninLogs",
            data: {
              UserId: userId,
              tenantFilter: tenantFilter,
              top: 50,
            },
            queryKey: `ListSignIns-${userId}`,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;
  const [waiting, setWaiting] = useState(false);
  const [signInLogsDialogOpen, setSignInLogsDialogOpen] = useState(false);
  const userActions = useCippUserActions();

  useEffect(() => {
    if (userId) {
      setWaiting(true);
    }
  }, [userId]);

  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${
      router.query.tenantFilter ?? userSettingsDefaults.currentTenant
    }`,
    queryKey: `ListUsers-${userId}`,
    waiting: waiting,
  });

  const userBulkRequest = ApiPostCall({
    urlFromData: true,
  });

  useEffect(() => {
    if (userId && userSettingsDefaults.currentTenant && !userBulkRequest.isSuccess) {
      userBulkRequest.mutate({
        url: "/api/ListGraphBulkRequest",
        data: {
          Requests: [
            {
              id: "userMemberOf",
              url: `/users/${userId}/memberOf`,
              method: "GET",
            },
            {
              id: "mfaDevices",
              url: `/users/${userId}/authentication/methods?$top=99`,
              method: "GET",
            },
            {
              id: "signInLogs",
              url: `/auditLogs/signIns?$filter=(userId eq '${userId}')&$top=1`,
              method: "GET",
            },
          ],
          tenantFilter: userSettingsDefaults.currentTenant,
          noPaginateIds: ["signInLogs"],
        },
      });
    }
  }, [userId, userSettingsDefaults.currentTenant, userBulkRequest.isSuccess]);

  const bulkData = userBulkRequest?.data?.data ?? [];
  const signInLogsData = bulkData?.find((item) => item.id === "signInLogs");
  const userMemberOfData = bulkData?.find((item) => item.id === "userMemberOf");
  const mfaDevicesData = bulkData?.find((item) => item.id === "mfaDevices");

  const signInLogs = signInLogsData?.body?.value || [];
  const userMemberOf = userMemberOfData?.body?.value || [];
  const mfaDevices = mfaDevicesData?.body?.value || [];

  // Set the title and subtitle for the layout
  const title = userRequest.isSuccess ? <>{userRequest.data?.[0]?.displayName}</> : "Loading...";

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
              Created: <CippTimeAgo data={userRequest.data?.[0]?.createdDateTime} />
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

  const data = userRequest.data?.[0];

  // Prepare the sign-in log item
  let signInLogItem = null;
  let conditionalAccessPoliciesItems = [];
  let mfaDevicesItems = [];

  if (signInLogs.length > 0) {
    const signInData = signInLogs[0];

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
      actionButton: (
        <Button
          variant="contained"
          size="small"
          onClick={() => setSignInLogsDialogOpen(true)}
          startIcon={
            <SvgIcon fontSize="small">
              <EyeIcon />
            </SvgIcon>
          }
        >
          More Sign-In Logs
        </Button>
      ),
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
      children: (
        <>
          {signInData?.location && (
            <>
              <Typography variant="h6">Location</Typography>
              <Grid container spacing={2}>
                <Grid size={8}>
                  <CippMap
                    markers={[
                      {
                        position: [
                          signInData.location.geoCoordinates.latitude,
                          signInData.location.geoCoordinates.longitude,
                        ],
                        popup: `${signInData.location.city}, ${signInData.location.state}, ${signInData.location.countryOrRegion}`,
                      },
                    ]}
                  />
                </Grid>
                <Grid size={4}>
                  <CippPropertyList
                    propertyItems={[
                      { label: "City", value: signInData.location.city },
                      { label: "State", value: signInData.location.state },
                      { label: "Country/Region", value: signInData.location.countryOrRegion },
                    ]}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </>
      ),
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
  } else if (signInLogsData?.status !== 200) {
    signInLogItem = {
      id: 1,
      cardLabelBox: "!",
      text: "Error loading sign-in logs. Do you have a P1 license?",
      subtext: signInLogsData?.error?.message || "Unknown error",
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
        subtext: signInLogsData?.error?.message || "Unknown error",
        statusColor: "error.main",
        statusText: "Error",
        propertyItems: [],
      },
    ];
  } else if (signInLogs.length === 0) {
    signInLogItem = {
      id: 1,
      cardLabelBox: "-",
      text: "No sign-in logs available",
      subtext:
        "There are no sign-in logs for this user, or you do not have a P1 license to detect this data.",
      statusColor: "warning.main",
      statusText: "No Data",
      propertyItems: [
        {
          label: "Error",
          value: signInLogsData?.error?.message || "Unknown error",
        },
        {
          label: "Inner Error",
          value: (
            <CippCodeBlock
              language="json"
              code={JSON.stringify(signInLogsData?.error?.innerError, null, 2) || "Unknown error"}
            />
          ),
        },
      ],
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
  if (mfaDevices.length > 0) {
    // Exclude password authentication method
    const mfaDevicesFiltered = mfaDevices.filter(
      (method) => method["@odata.type"] !== "#microsoft.graph.passwordAuthenticationMethod"
    );

    if (mfaDevicesFiltered.length > 0) {
      mfaDevicesItems = mfaDevicesFiltered.map((device, index) => ({
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
  } else if (mfaDevicesData?.status !== 200) {
    // Error fetching MFA devices
    mfaDevicesItems = [
      {
        id: 1,
        cardLabelBox: "!",
        text: "Error loading MFA devices",
        subtext: `Status code: ${mfaDevicesData?.status}`,
        statusColor: "error.main",
        statusText: "Error",
        propertyItems: [
          {
            label: "Error",
            value: mfaDevicesData?.body?.error?.message || "Unknown Error",
          },
          {
            label: "Inner Error",
            value: (
              <CippCodeBlock
                language="json"
                code={
                  JSON.stringify(mfaDevicesData?.body?.error?.innerError, null, 2) ||
                  "Unknown Error"
                }
              />
            ),
          },
        ],
      },
    ];
  } else if (mfaDevices.length === 0) {
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

  const groupMembershipItems = userMemberOf
    ? [
        {
          id: 1,
          cardLabelBox: {
            cardLabelBoxHeader: <Group />,
          },
          text: "Groups",
          subtext: "List of groups the user is a member of",
          table: {
            title: "Group Memberships",
            hideTitle: true,
            actions: [
              {
                icon: <PencilIcon />,
                label: "Edit Group",
                link: "/identity/administration/groups/edit?groupId=[id]",
              },
            ],
            data: userMemberOf?.filter(
              (item) => item?.["@odata.type"] === "#microsoft.graph.group"
            ),
            simpleColumns: ["displayName", "groupTypes", "securityEnabled", "mailEnabled"],
          },
        },
      ]
    : [];

  const roleMembershipItems = userMemberOf
    ? [
        {
          id: 1,
          cardLabelBox: {
            cardLabelBoxHeader: <AdminPanelSettings />,
          },
          text: "Admin Roles",
          subtext: "List of roles the user is a member of",
          table: {
            title: "Admin Roles",
            hideTitle: true,
            data: userMemberOf?.filter(
              (item) => item?.["@odata.type"] === "#microsoft.graph.directoryRole"
            ),
            simpleColumns: ["displayName", "description"],
          },
        },
      ]
    : [];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      actions={userActions}
      actionsData={data}
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
            <Grid size={4}>
              <CippUserInfoCard
                user={data}
                tenant={userSettingsDefaults.currentTenant}
                isFetching={userRequest.isLoading}
              />
            </Grid>
            <Grid size={8}>
              <Stack spacing={3}>
                <Typography variant="h6">Latest Logon</Typography>
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={signInLogItem ? [signInLogItem] : []}
                  isCollapsible={signInLogItem ? true : false}
                />
                <Typography variant="h6">Applied Conditional Access Policies</Typography>
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={conditionalAccessPoliciesItems}
                  isCollapsible={conditionalAccessPoliciesItems.length > 0 ? true : false}
                />
                <Typography variant="h6">Multi-Factor Authentication Devices</Typography>
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={mfaDevicesItems}
                  isCollapsible={mfaDevicesItems.length > 0 ? true : false}
                />
                <Typography variant="h6">Memberships</Typography>
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={groupMembershipItems}
                  isCollapsible={groupMembershipItems.length > 0 ? true : false}
                />
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={roleMembershipItems}
                  isCollapsible={roleMembershipItems.length > 0 ? true : false}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
      <SignInLogsDialog
        open={signInLogsDialogOpen}
        onClose={() => setSignInLogsDialogOpen(false)}
        userId={userId}
        tenantFilter={userSettingsDefaults.currentTenant}
      />
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
