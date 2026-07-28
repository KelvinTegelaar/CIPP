import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { useSettings } from "../../../../../hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall, ApiPostCall } from "../../../../../api/ApiCall";
import CippFormSkeleton from "../../../../../components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import { 
  AdminPanelSettings, 
  Check, 
  Group, 
  Mail, 
  Fingerprint, 
  Launch,
  Login,
  Security,
  Devices,
  Badge,
  PersonAdd,
} from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import { Grid } from "@mui/system";
import { CippUserInfoCard } from "../../../../../components/CippCards/CippUserInfoCard";
import { SvgIcon, Typography, Divider } from "@mui/material";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useCippUserActions } from "../../../../../components/CippComponents/CippUserActions";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CippDataTable } from "../../../../../components/CippTable/CippDataTable";
import { getGroupTypeLabel } from "../../../../../utils/group-types";
import dynamic from "next/dynamic";
const CippMap = dynamic(() => import("../../../../../components/CippComponents/CippMap"), {
  ssr: false,
});

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useForm, useWatch } from "react-hook-form";
import CippFormComponent from "../../../../../components/CippComponents/CippFormComponent";
import { CippApiResults } from "../../../../../components/CippComponents/CippApiResults";
import gdaproles from "../../../../../data/GDAPRoles.json";
import { CippPropertyList } from "../../../../../components/CippComponents/CippPropertyList";
import { CippCodeBlock } from "../../../../../components/CippComponents/CippCodeBlock";
import { CippHead } from "../../../../../components/CippComponents/CippHead";
import { CippUserDevicesSection } from "../../../../../components/CippComponents/CippUserDevicesSection";

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

const AddRoleForm = ({ user, tenant, onClose, onSuccess, mutation }) => {
  const formControl = useForm({ mode: "onChange" });
  const assignmentType = useWatch({
    control: formControl.control,
    name: "assignmentType",
  });
  const assignmentTypeValue = assignmentType?.value || assignmentType;
  const isTemporary = assignmentTypeValue === "Temporary";

  const handleSubmit = formControl.handleSubmit((formData) => {
    const actionType = isTemporary ? "AddTemporary" : "Add";
    const roles = Array.isArray(formData.roles) ? formData.roles : [formData.roles];
    mutation.mutate(
      {
        url: "/api/ExecRoleAssignment",
        data: {
          tenantFilter: tenant,
          userId: user.id,
          userPrincipalName: user.userPrincipalName,
          displayName: user.displayName,
          roles: roles.map((r) => ({ label: r.label, value: r.value })),
          action: actionType,
          expiration: formData.expiration
            ? Math.floor(new Date(formData.expiration).getTime() / 1000)
            : undefined,
          reason: formData.reason || undefined,
        },
      },
      { onSuccess }
    );
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <CippFormComponent
          type="autoComplete"
          name="roles"
          label="Select Admin Roles"
          multiple={true}
          creatable={false}
          formControl={formControl}
          options={gdaproles.map((role) => ({ label: role.Name, value: role.ObjectId }))}
          validators={{ required: "Please select at least one role" }}
        />
        <CippFormComponent
          type="radio"
          name="assignmentType"
          label="Assignment Type"
          formControl={formControl}
          options={[
            { label: "Permanent", value: "Permanent" },
            { label: "Temporary", value: "Temporary" },
          ]}
          validators={{ required: "Please select an assignment type" }}
        />
        {isTemporary && (
          <CippFormComponent
            type="datePicker"
            name="expiration"
            label="Expiration Date/Time"
            dateTimeType="datetime"
            formControl={formControl}
            validators={{ required: "Please select an expiration date" }}
          />
        )}
        <CippFormComponent
          type="textField"
          name="reason"
          label="Reason (optional)"
          formControl={formControl}
        />
        <CippApiResults apiObject={mutation} />
        <DialogActions sx={{ px: 0, pb: 0 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
            startIcon={
              mutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PersonAdd />
              )
            }
          >
            {mutation.isPending ? "Assigning..." : "Assign Role"}
          </Button>
        </DialogActions>
      </Stack>
    </form>
  );
};

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { userId } = router.query;
  const [signInLogsDialogOpen, setSignInLogsDialogOpen] = useState(false);
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const userActions = useCippUserActions();
  const tenant = router.query.tenantFilter ?? userSettingsDefaults.currentTenant;
  const settingsReady = userSettingsDefaults.isInitialized && !!tenant;
  const queryReady = router.isReady && !!userId && settingsReady;

  const userRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${tenant}`,
    queryKey: `ListUsers-${userId}-${tenant}`,
    waiting: queryReady,
  });

  // Trigger refetch when query conditions become ready
  useEffect(() => {
    if (queryReady && !userRequest.isSuccess && !userRequest.isFetching) {
      userRequest.refetch();
    }
  }, [queryReady, userId, tenant]);

  const userBulkRequest = ApiPostCall({
    urlFromData: true,
  });

  const addRoleMutation = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ["ListRoles"],
  });

  const refreshFunction = useCallback(() => {
    const userPrincipalName = userRequest.data?.[0]?.userPrincipalName;
    const requests = [
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
    ];

    if (userPrincipalName) {
      requests.push({
        id: "managedDevices",
        url: `/deviceManagement/managedDevices?$filter=userPrincipalName eq '${userPrincipalName}'`,
        method: "GET",
      });
    }

    userBulkRequest.mutate({
      url: "/api/ListGraphBulkRequest",
      data: {
        Requests: requests,
        tenantFilter: userSettingsDefaults.currentTenant,
        noPaginateIds: ["signInLogs"],
      },
    });
  }, [userId, userSettingsDefaults.currentTenant, userBulkRequest]);

  useEffect(() => {
    if (userId && userSettingsDefaults.currentTenant && userRequest.isSuccess && !userBulkRequest.isSuccess) {
      refreshFunction();
    }
  }, [userId, userSettingsDefaults.currentTenant, userRequest.isSuccess, userBulkRequest.isSuccess]);

  const { signInLogsData, userMemberOfData, mfaDevicesData, managedDevicesData, signInLogs, userMemberOf, mfaDevices, managedDevices } = useMemo(() => {
    const bulkData = userBulkRequest?.data?.data ?? [];
    const signInLogsData = bulkData?.find((item) => item.id === "signInLogs");
    const userMemberOfData = bulkData?.find((item) => item.id === "userMemberOf");
    const mfaDevicesData = bulkData?.find((item) => item.id === "mfaDevices");
    const managedDevicesData = bulkData?.find((item) => item.id === "managedDevices");

    return {
      signInLogsData,
      userMemberOfData,
      mfaDevicesData,
      managedDevicesData,
      signInLogs: signInLogsData?.body?.value || [],
      userMemberOf: userMemberOfData?.body?.value || [],
      mfaDevices: mfaDevicesData?.body?.value || [],
      managedDevices: managedDevicesData?.body?.value || [],
    };
  }, [userBulkRequest?.data?.data]);

  // Set the title and subtitle for the layout - memoized for performance
  const title = userRequest.isSuccess ? userRequest.data?.[0]?.displayName : "Loading...";

  const subtitle = useMemo(() => {
    if (!userRequest.isSuccess) return [];
    const userData = userRequest.data?.[0];
    return [
      {
        icon: <Mail />,
        text: <CippCopyToClipBoard type="chip" text={userData?.userPrincipalName} />,
      },
      {
        icon: <Fingerprint />,
        text: <CippCopyToClipBoard type="chip" text={userData?.id} />,
      },
      {
        icon: <CalendarIcon />,
        text: (
          <>
            Created: <CippTimeAgo data={userData?.createdDateTime} />
          </>
        ),
      },
      {
        icon: <Launch style={{ color: "#757575" }} />,
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
    ];
  }, [userRequest.isSuccess, userRequest.data, userSettingsDefaults.currentTenant, userId]);

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
                <Grid size={{ xs: 12, md: 8 }}>
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
                <Grid size={{ xs: 12, md: 4 }}>
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
        (policy) => policy.result === "success",
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
      (method) => method["@odata.type"] !== "#microsoft.graph.passwordAuthenticationMethod",
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

  // Memoize group membership items
  const groupMembershipItems = useMemo(() => {
    if (!userMemberOf) return [];
    // Raw Graph groups have no groupType field, but the edit page needs the label
    const groups = userMemberOf
      .filter((item) => item?.["@odata.type"] === "#microsoft.graph.group")
      .map((group) => ({ ...group, groupType: getGroupTypeLabel(group) }));
    return [
      {
        id: 1,
        cardLabelBox: {
          cardLabelBoxHeader: <Group />,
        },
        text: "Groups",
        subtext: "List of groups the user is a member of",
        statusText: ` ${groups.length} Group(s)`,
        statusColor: "info.main",
        table: {
          title: "Group Memberships",
          hideTitle: true,
          actions: [
            {
              icon: <PencilIcon />,
              label: "Edit Group",
              link: "/identity/administration/groups/edit?groupId=[id]&groupType=[groupType]",
              category: "edit",
            },
          ],
          data: groups,
          refreshFunction: refreshFunction,
          simpleColumns: ["displayName", "groupTypes", "securityEnabled", "mailEnabled"],
        },
      },
    ];
  }, [userMemberOf, refreshFunction]);

  // Memoize role membership items
  const roleMembershipItems = useMemo(() => {
    if (!userMemberOf) return [];
    const roles = userMemberOf.filter((item) => item?.["@odata.type"] === "#microsoft.graph.directoryRole");
    return [
      {
        id: 1,
        cardLabelBox: {
          cardLabelBoxHeader: <AdminPanelSettings />,
        },
        text: "Admin Roles",
        subtext: "List of roles the user is a member of",
        statusText: ` ${roles.length} Role(s)`,
        statusColor: "info.main",
        actionButton: (
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAdd />}
            onClick={() => setAddRoleDialogOpen(true)}
          >
            Add Role
          </Button>
        ),
        table: {
          title: "Admin Roles",
          hideTitle: true,
          data: roles,
          simpleColumns: ["displayName", "description"],
          refreshFunction: refreshFunction,
          actions: [
            {
              label: "Remove Role",
              type: "POST",
              url: "/api/ExecRoleAssignment",
              icon: <TrashIcon />,
              dataFunction: (row) => ({
                userId: data?.id,
                userPrincipalName: data?.userPrincipalName,
                displayName: data?.displayName,
                tenantFilter: tenant,
                action: "Remove",
                roles: [{ label: row.displayName, value: row.roleTemplateId }],
              }),
              confirmText: "Are you sure you want to remove the [displayName] role from this user?",
              category: "danger",
            },
          ],
        },
      },
    ];
  }, [userMemberOf, refreshFunction, data, tenant]);

  const ownedDevicesItems = managedDevices.length > 0
    ? [
        {
          id: 1,
          cardLabelBox: {
            cardLabelBoxHeader: <Devices />,
          },
          text: "Managed Devices",
          subtext: "List of devices managed for this user",
          statusText: `${managedDevices.length} Device(s)`,
          statusColor: "info.main",
          table: {
            title: "Managed Devices",
            hideTitle: true,
            data: managedDevices,
            refreshFunction: refreshFunction,
            simpleColumns: ["deviceName", "operatingSystem", "osVersion", "managementType"],
            actions: [
              {
                icon: <EyeIcon />,
                label: "View Device",
                link: `/endpoint/MEM/devices/device?deviceId=[id]&tenantFilter=${userSettingsDefaults.currentTenant}`,
                category: "view",
              },
            ],
          },
        },
      ]
    : managedDevicesData?.status !== 200
    ? [
        {
          id: 1,
          cardLabelBox: "!",
          text: "Error loading devices",
          subtext: managedDevicesData?.error?.message || "Unknown error",
          statusColor: "error.main",
          statusText: "Error",
          propertyItems: [],
        },
      ]
    : [
        {
          id: 1,
          cardLabelBox: "-",
          text: "No devices",
          subtext: "This user does not have any managed devices.",
          statusColor: "warning.main",
          statusText: "No Devices",
          propertyItems: [],
        },
      ];

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
          <CippHead title={title} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippUserInfoCard
                user={data}
                tenant={userSettingsDefaults.currentTenant}
                isFetching={userRequest.isLoading}
                onRefresh={() => userRequest.refetch()}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={3}>
                {/* Sign-In Activity Section */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Login color="primary" />
                  <Typography variant="h6">Sign-In Activity</Typography>
                </Stack>
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={signInLogItem ? [signInLogItem] : []}
                  isCollapsible={signInLogItem ? true : false}
                />

                <Divider sx={{ my: 1 }} />

                {/* Security Section */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Security color="primary" />
                  <Typography variant="h6">Security</Typography>
                </Stack>
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={conditionalAccessPoliciesItems}
                  isCollapsible={conditionalAccessPoliciesItems.length > 0 ? true : false}
                />
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={mfaDevicesItems}
                  isCollapsible={mfaDevicesItems.length > 0 ? true : false}
                />

                <Divider sx={{ my: 1 }} />

                {/* Memberships Section */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Badge color="primary" />
                  <Typography variant="h6">Memberships</Typography>
                </Stack>
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={groupMembershipItems}
                  isCollapsible={true}
                />
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={roleMembershipItems}
                  isCollapsible={true}
                />

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Devices color="primary" />
                  <Typography variant="h6">Devices</Typography>
                </Stack>
                <CippUserDevicesSection userId={userId} tenant={userSettingsDefaults.currentTenant} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                  Intune managed devices
                </Typography>
                <CippBannerListCard
                  isFetching={userBulkRequest.isPending}
                  items={ownedDevicesItems}
                  isCollapsible={true}
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
      <Dialog
        open={addRoleDialogOpen}
        onClose={() => !addRoleMutation.isPending && setAddRoleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonAdd color="primary" />
          Add Role to {data?.displayName}
        </DialogTitle>
        <DialogContent>
          {addRoleDialogOpen && (
            <AddRoleForm
              user={data}
              tenant={tenant}
              onClose={() => setAddRoleDialogOpen(false)}
              onSuccess={() => {
                refreshFunction();
                setAddRoleDialogOpen(false);
              }}
              mutation={addRoleMutation}
            />
          )}
        </DialogContent>
      </Dialog>
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
