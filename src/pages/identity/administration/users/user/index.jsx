import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { Check, Mail } from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import Grid from "@mui/material/Grid2";
import { CippUserInfoCard } from "../../../../../components/CippCards/CippUserInfoCard";
import { Typography } from "@mui/material";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { useEffect, useState } from "react";
import { usePopover } from "../../../../../hooks/use-popover";
import { useDialog } from "../../../../../hooks/use-dialog";
import { EyeIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  Archive,
  Block,
  Clear,
  CloudDone,
  Edit,
  Email,
  ForwardToInbox,
  GroupAdd,
  LockOpen,
  LockPerson,
  LockReset,
  MeetingRoom,
  NoMeetingRoom,
  Password,
  PersonOff,
  PhonelinkLock,
  PhonelinkSetup,
  Shortcut,
} from "@mui/icons-material";

const Page = () => {
  const popover = usePopover();
  const createDialog = useDialog();
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    if (userId) {
      setWaiting(true);
    }
  }, [userId]);
  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListUsers-${userId}`,
    waiting: waiting,
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
    waiting: waiting,
  });

  const signInLogs = ApiGetCall({
    url: `/api/ListUserSigninLogs?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}&top=1`,
    queryKey: `ListSignIns-${userId}`,
    waiting: waiting,
  });

  // Set the title and subtitle for the layout
  const title = userRequest.isSuccess ? <>{userRequest.data?.[0]?.displayName}</> : "Loading...";

  const subtitle = userRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: <CippCopyToClipBoard type="chip" text={userRequest.data?.[0]?.userPrincipalName} />,
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created <CippTimeAgo data={userRequest.data?.[0]?.createdDateTime} />
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
  const actions = [
    {
      //tested
      label: "View User",
      link: "/identity/administration/users/user?userId=[id]",
      multiPost: false,
      icon: <EyeIcon />,
      color: "success",
    },
    {
      //tested
      label: "Edit User",
      link: "/identity/administration/users/user/edit?userId=[id]",
      icon: <Edit />,
      color: "success",
      target: "_self",
    },
    {
      //tested
      label: "Research Compromised Account",
      type: "GET",
      icon: <MagnifyingGlassIcon />,
      link: "/identity/administration/users/user/bec?userId=[id]",
      confirmText: "Are you sure you want to research this compromised account?",
      multiPost: false,
    },
    {
      //tested

      label: "Create Temporary Access Password",
      type: "GET",
      icon: <Password />,
      url: "/api/ExecCreateTAP",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to create a Temporary Access Password?",
      multiPost: false,
    },
    {
      //tested
      label: "Rerequire MFA registration",
      type: "GET",
      icon: <PhonelinkSetup />,
      url: "/api/ExecResetMFA",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to reset MFA for this user?",
      multiPost: false,
    },
    {
      //tested
      label: "Send MFA Push",
      type: "POST",
      icon: <PhonelinkLock />,
      url: "/api/ExecSendPush",
      data: { UserEmail: "userPrincipalName" },
      confirmText: "Are you sure you want to send an MFA request?",
      multiPost: false,
    },
    {
      //tested
      label: "Set Per-User MFA",
      type: "POST",
      icon: <LockPerson />,
      url: "/api/ExecPerUserMFA",
      data: { userId: "userPrincipalName" },
      fields: [
        {
          type: "autoComplete",
          name: "State",
          label: "State",
          options: [
            { label: "Enforced", value: "Enforced" },
            { label: "Enabled", value: "Enabled" },
            { label: "Disabled", value: "Disabled" },
          ],
          multiple: false,
        },
      ],
      confirmText: "Are you sure you want to set per-user MFA for these users?",
      multiPost: false,
    },
    {
      //tested
      label: "Convert to Shared Mailbox",
      type: "GET",
      icon: <Email />,
      url: "/api/ExecConvertToSharedMailbox",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to convert this user to a shared mailbox?",
      multiPost: false,
    },
    {
      //tested
      label: "Enable Online Archive",
      type: "GET",
      icon: <Archive />,
      url: "/api/ExecEnableArchive",
      data: { ID: "userPrincipalName" },
      confirmText: "Are you sure you want to enable the online archive for this user?",
      multiPost: false,
    },
    {
      //tested
      label: "Set Out of Office",
      type: "POST",
      icon: <MeetingRoom />,
      url: "/api/ExecSetOoO",
      data: {
        userId: "userPrincipalName",
        AutoReplyState: { value: "Enabled" },
      },
      fields: [{ type: "richText", name: "input", label: "Out of Office Message" }],
      confirmText: "Are you sure you want to set the out of office?",
      multiPost: false,
    },

    {
      label: "Disable Out of Office",
      type: "POST",
      icon: <NoMeetingRoom />,
      url: "/api/ExecSetOoO",
      data: { user: "userPrincipalName", AutoReplyState: "Disabled" },
      confirmText: "Are you sure you want to disable the out of office?",
      multiPost: false,
    },
    {
      label: "Add to Group",
      type: "POST",
      icon: <GroupAdd />,
      url: "/api/EditGroup",
      data: { addMember: "userPrincipalName" },
      fields: [
        {
          type: "autoComplete",
          name: "groupId",
          label: "Select a group to add the user to",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/ListGroups",
            labelField: "displayName",
            valueField: "id",
            addedField: {
              groupType: "calculatedGroupType",
              groupName: "displayName",
            },
            queryKey: `groups-${userSettingsDefaults.currentTenant}}`,
          },
        },
      ],
      confirmText: "Are you sure you want to add the user to this group?",
    },
    {
      label: "Disable Email Forwarding",
      type: "POST",
      url: "/api/ExecEmailForward",
      icon: <ForwardToInbox />,
      data: {
        username: "userPrincipalName",
        userid: "userPrincipalName",
        ForwardOption: "!disabled",
      },
      confirmText: "Are you sure you want to disable forwarding of this user's emails?",
      multiPost: false,
    },
    {
      label: "Pre-provision OneDrive",
      type: "POST",
      icon: <CloudDone />,
      url: "/api/ExecOneDriveProvision",
      data: { UserPrincipalName: "userPrincipalName" },
      confirmText: "Are you sure you want to pre-provision OneDrive for this user?",
      multiPost: false,
    },
    {
      label: "Add OneDrive Shortcut",
      type: "POST",
      icon: <Shortcut />,
      url: "/api/ExecOneDriveShortCut",
      data: {
        username: "userPrincipalName",
        userid: "id",
      },
      fields: [
        {
          type: "autoComplete",
          name: "siteUrl",
          label: "Select a Site",
          multiple: false,
          creatable: false,
          api: {
            url: "/api/ListSites",
            data: { type: "SharePointSiteUsage", URLOnly: true },
            labelField: "webUrl",
            valueField: "webUrl",
            queryKey: `sharepointSites-${userSettingsDefaults.currentTenant}}`,
          },
        },
      ],
      confirmText: "Select a SharePoint site to create a shortcut for:",
      multiPost: false,
    },
    {
      label: "Block Sign In",
      type: "GET",
      icon: <Block />,
      url: "/api/ExecDisableUser",
      data: { ID: "id" },
      confirmText: "Are you sure you want to block the sign-in for this user?",
      multiPost: false,
    },
    {
      label: "Unblock Sign In",
      type: "GET",
      icon: <LockOpen />,
      url: "/api/ExecDisableUser",
      data: { ID: "id", Enable: true },
      confirmText: "Are you sure you want to unblock sign-in for this user?",
      multiPost: false,
    },
    {
      label: "Reset Password (Must Change)",
      type: "GET",
      icon: <LockReset />,
      url: "/api/ExecResetPass",
      data: {
        MustChange: true,
        ID: "userPrincipalName",
        displayName: "displayName",
      },
      confirmText:
        "Are you sure you want to reset the password for this user? The user must change their password at next logon.",
      multiPost: false,
    },
    {
      label: "Reset Password",
      type: "GET",
      icon: <LockReset />,
      url: "/api/ExecResetPass",
      data: {
        MustChange: false,
        ID: "userPrincipalName",
        displayName: "displayName",
      },
      confirmText: "Are you sure you want to reset the password for this user?",
      multiPost: false,
    },
    {
      label: "Clear Immutable ID",
      type: "GET",
      icon: <Clear />,
      url: "/api/ExecClrImmId",
      data: {
        ID: "id",
      },
      confirmText: "Are you sure you want to clear the Immutable ID for this user?",
      multiPost: false,
    },
    {
      label: "Revoke all user sessions",
      type: "GET",
      icon: <PersonOff />,
      url: "/api/ExecRevokeSessions",
      data: { ID: "id", Username: "userPrincipalName" },
      confirmText: "Are you sure you want to revoke all sessions for this user?",
      multiPost: false,
    },
    {
      label: "Delete User",
      type: "GET",
      icon: <TrashIcon />,
      url: "/api/RemoveUser",
      data: { ID: "id" },
      confirmText: "Are you sure you want to delete this user?",
      multiPost: false,
    },
  ];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      actions={actions}
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
            <Grid item size={4}>
              <CippUserInfoCard
                user={data}
                tenant={userSettingsDefaults.currentTenant}
                isFetching={userRequest.isLoading}
              />
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
