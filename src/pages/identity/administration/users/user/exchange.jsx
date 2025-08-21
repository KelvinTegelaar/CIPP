import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useSettings } from "/src/hooks/use-settings";
import { useRouter } from "next/router";
import { ApiGetCall } from "/src/api/ApiCall";
import CippFormSkeleton from "/src/components/CippFormPages/CippFormSkeleton";
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon";
import {
  Check,
  Error,
  Mail,
  Fingerprint,
  Launch,
  Delete,
  Star,
  CalendarToday,
  AlternateEmail,
  PersonAdd,
  Block,
  PlayArrow,
} from "@mui/icons-material";
import { HeaderedTabbedLayout } from "../../../../../layouts/HeaderedTabbedLayout";
import tabOptions from "./tabOptions";
import { CippTimeAgo } from "../../../../../components/CippComponents/CippTimeAgo";
import { CippCopyToClipBoard } from "../../../../../components/CippComponents/CippCopyToClipboard";
import { Box, Stack } from "@mui/system";
import { Grid } from "@mui/system";
import { CippBannerListCard } from "../../../../../components/CippCards/CippBannerListCard";
import { CippExchangeInfoCard } from "../../../../../components/CippCards/CippExchangeInfoCard";
import { useEffect, useState, useMemo } from "react";
import CippExchangeSettingsForm from "../../../../../components/CippFormPages/CippExchangeSettingsForm";
import { useForm } from "react-hook-form";
import { Alert, Button, Collapse, CircularProgress, Typography } from "@mui/material";
import { CippApiResults } from "../../../../../components/CippComponents/CippApiResults";
import { CippPropertyListCard } from "../../../../../components/CippCards/CippPropertyListCard";
import { getCippTranslation } from "../../../../../utils/get-cipp-translation";
import { getCippFormatting } from "../../../../../utils/get-cipp-formatting";
import CippExchangeActions from "../../../../../components/CippComponents/CippExchangeActions";
import { CippApiDialog } from "../../../../../components/CippComponents/CippApiDialog";
import { useDialog } from "../../../../../hooks/use-dialog";
import CippAliasDialog from "../../../../../components/CippComponents/CippAliasDialog";
import CippMailboxPermissionsDialog from "../../../../../components/CippComponents/CippMailboxPermissionsDialog";
import CippCalendarPermissionsDialog from "../../../../../components/CippComponents/CippCalendarPermissionsDialog";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const [waiting, setWaiting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [actionData, setActionData] = useState({ ready: false });
  const createDialog = useDialog();
  const aliasDialog = useDialog();
  const permissionsDialog = useDialog();
  const calendarPermissionsDialog = useDialog();
  const router = useRouter();
  const { userId } = router.query;

  const formControl = useForm({
    mode: "onChange",
    defaultValues: {
      tenantFilter: userSettingsDefaults.currentTenant,
    },
  });
  const graphUserRequest = ApiGetCall({
    url: `/api/ListUsers?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ListUsers-${userId}`,
    waiting: waiting,
  });
  const userRequest = ApiGetCall({
    url: `/api/ListUserMailboxDetails?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}&userMail=${graphUserRequest.data?.[0]?.userPrincipalName}`,
    queryKey: `Mailbox-${userId}`,
    waiting: waiting && !!graphUserRequest.data?.[0]?.userPrincipalName,
  });

  const usersList = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `users`,
      tenantFilter: userSettingsDefaults.currentTenant,
      $select: "id,displayName,userPrincipalName,mail",
      $top: 999,
    },
    queryKey: `UserNames-${userSettingsDefaults.currentTenant}`,
  });

  const oooRequest = ApiGetCall({
    url: `/api/ListOoO?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `ooo-${userId}`,
    waiting: waiting,
  });

  const calPermissions = ApiGetCall({
    url: `/api/ListCalendarPermissions?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `CalendarPermissions-${userId}`,
    waiting: waiting,
  });

  const mailboxRulesRequest = ApiGetCall({
    url: `/api/ListUserMailboxRules?UserId=${userId}&tenantFilter=${userSettingsDefaults.currentTenant}`,
    queryKey: `MailboxRules-${userId}`,
    waiting: waiting,
  });

  const groupsList = ApiGetCall({
    url: "/api/ListGraphRequest",
    data: {
      Endpoint: `groups`,
      tenantFilter: userSettingsDefaults.currentTenant,
      $filter: "securityEnabled eq true and mailEnabled eq true",
      $select: "id,displayName,mail,description",
      $top: 999,
    },
    queryKey: `MailEnabledSecurityGroups-${userSettingsDefaults.currentTenant}`,
  });

  const getPermissionInfo = (userIdentifier, groupsList) => {
    // Handle undefined/null cases first
    if (!userIdentifier) {
      return {
        type: "Unknown",
        displayName: "Unknown User",
      };
    }

    // Handle special built-in cases
    if (userIdentifier === "Default" || userIdentifier === "Anonymous") {
      return {
        type: "System",
        displayName: userIdentifier,
      };
    }

    // Check if it's a group - handle Exchange's different naming patterns
    const matchingGroup = groupsList?.data?.Results?.find((group) => {
      // Ensure group properties exist before comparison
      if (!group) return false;

      return (
        // Exact match on mail address
        (group.mail && group.mail === userIdentifier) ||
        // Exact match on display name
        (group.displayName && group.displayName === userIdentifier) ||
        // Partial match - permission identifier starts with group display name (handles timestamps)
        (group.displayName && userIdentifier?.startsWith(group.displayName))
      );
    });

    if (matchingGroup) {
      return {
        type: "Group",
        displayName: matchingGroup.displayName, // Use clean name from Graph API
      };
    }

    // If not a system entity or group, assume it's a user
    return {
      type: "User",
      displayName: userIdentifier, // Keep original for users
    };
  };

  // Define API configurations for the dialogs
  const aliasApiConfig = {
    type: "POST",
    url: "/api/EditUserAliases",
    relatedQueryKeys: `ListUsers-${userId}`,
    confirmText: "Add the specified proxy addresses to this user?",
    customDataformatter: (row, action, formData) => {
      return {
        id: userId,
        tenantFilter: userSettingsDefaults.currentTenant,
        AddedAliases: formData?.AddedAliases?.join(",") || "",
        userPrincipalName: graphUserRequest?.data?.[0]?.userPrincipalName,
      };
    },
  };

  const permissionsApiConfig = {
    type: "POST",
    url: "/api/ExecModifyMBPerms",
    relatedQueryKeys: `Mailbox-${userId}`,
    confirmText: "Add the specified permissions to this mailbox?",
    customDataformatter: (row, action, data) => {
      const permissions = [];
      const { permissions: permissionValues } = data;
      const autoMap = permissionValues.AutoMap === undefined ? true : permissionValues.AutoMap;

      // Build permissions array based on form values
      if (permissionValues?.AddFullAccess) {
        permissions.push({
          UserID: permissionValues.AddFullAccess,
          PermissionLevel: "FullAccess",
          Modification: "Add",
          AutoMap: autoMap,
        });
      }
      if (permissionValues?.AddSendAs) {
        permissions.push({
          UserID: permissionValues.AddSendAs,
          PermissionLevel: "SendAs",
          Modification: "Add",
        });
      }
      if (permissionValues?.AddSendOnBehalf) {
        permissions.push({
          UserID: permissionValues.AddSendOnBehalf,
          PermissionLevel: "SendOnBehalf",
          Modification: "Add",
        });
      }

      return {
        userID: graphUserRequest.data?.[0]?.userPrincipalName,
        tenantFilter: userSettingsDefaults.currentTenant,
        permissions: permissions,
      };
    },
  };

  const calendarPermissionsApiConfig = {
    type: "POST",
    url: "/api/ExecModifyCalPerms",
    relatedQueryKeys: `CalendarPermissions-${userId}`,
    confirmText: "Add the specified permissions to this calendar?",
    customDataformatter: (row, action, data) => {
      if (!data.UserToGetPermissions || !data.Permissions) return null;

      // Build permission object dynamically
      const permission = {
        UserID: data.UserToGetPermissions,
        PermissionLevel: data.Permissions,
        FolderName: calPermissions.data?.[0]?.FolderName ?? "Calendar",
        Modification: "Add",
      };

      if (data.CanViewPrivateItems) {
        permission.CanViewPrivateItems = true;
      }

      // Always include SendNotificationToUser explicitly (default false)
      permission.SendNotificationToUser = Boolean(data.SendNotificationToUser);

      return {
        userID: graphUserRequest.data?.[0]?.userPrincipalName,
        tenantFilter: userSettingsDefaults.currentTenant,
        permissions: [permission],
      };
    },
  };

  useEffect(() => {
    if (permissionsDialog.open) {
      usersList.refetch();
    }
  }, [permissionsDialog.open]);

  useEffect(() => {
    if (oooRequest.isSuccess) {
      formControl.setValue("ooo.ExternalMessage", oooRequest.data?.ExternalMessage);
      formControl.setValue("ooo.InternalMessage", oooRequest.data?.InternalMessage);
      formControl.setValue("ooo.AutoReplyState", {
        value: oooRequest.data?.AutoReplyState,
        label: oooRequest.data?.AutoReplyState,
      });
      formControl.setValue(
        "ooo.StartTime",
        new Date(oooRequest.data?.StartTime).getTime() / 1000 || null
      );
      formControl.setValue(
        "ooo.EndTime",
        new Date(oooRequest.data?.EndTime).getTime() / 1000 || null
      );
    }
  }, [oooRequest.isSuccess, oooRequest.data]);

  useEffect(() => {
    //if userId is defined, we can fetch the user data
    if (userId) {
      setWaiting(true);
    }
  }, [userId]);

  useEffect(() => {
    if (userRequest.isSuccess && userRequest.data?.[0]) {
      const currentSettings = userRequest.data[0];
      const forwardingAddress = currentSettings.ForwardingAddress;
      const forwardingSmtpAddress = currentSettings.MailboxActionsData?.ForwardingSmtpAddress;
      const forwardAndDeliver = currentSettings.ForwardAndDeliver;

      let forwardingType = "disabled";
      let cleanAddress = "";

      if (forwardingSmtpAddress) {
        // External forwarding
        forwardingType = "ExternalAddress";
        cleanAddress = forwardingSmtpAddress;
      } else if (forwardingAddress) {
        // Internal forwarding
        forwardingType = "internalAddress";
        cleanAddress = forwardingAddress;
      }

      // Set form values
      formControl.setValue("forwarding.forwardOption", forwardingType);
      formControl.setValue("forwarding.KeepCopy", forwardAndDeliver === true);

      if (forwardingType === "internalAddress") {
        formControl.setValue("forwarding.ForwardInternal", cleanAddress);
        formControl.setValue("forwarding.ForwardExternal", "");
      } else if (forwardingType === "ExternalAddress") {
        formControl.setValue("forwarding.ForwardExternal", cleanAddress);
        formControl.setValue("forwarding.ForwardInternal", "");
      } else {
        formControl.setValue("forwarding.ForwardInternal", "");
        formControl.setValue("forwarding.ForwardExternal", "");
      }
    }
  }, [userRequest.isSuccess, userRequest.dataUpdatedAt, formControl]);

  const title = graphUserRequest.isSuccess ? graphUserRequest.data?.[0]?.displayName : "Loading...";

  // Create options array for mailbox permissions (no system users)
  const mailboxPermissionOptions = useMemo(() => {
    const options = [];

    // Add users
    if (usersList?.data?.Results) {
      usersList.data.Results.forEach((user) => {
        options.push({
          value: user.userPrincipalName,
          label: `${user.displayName} (${user.userPrincipalName})`,
          type: "user",
        });
      });
    }

    // Add mail-enabled security groups
    if (groupsList?.data?.Results) {
      groupsList.data.Results.forEach((group) => {
        options.push({
          value: group.mail,
          label: `${group.displayName} (${group.mail})`,
          type: "group",
        });
      });
    }

    // Sort alphabetically by label
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [usersList?.data?.Results, groupsList?.data?.Results]);

  // Create options array for calendar permissions (includes system users)
  const calendarPermissionOptions = useMemo(() => {
    const options = [];

    // Add special system users for calendar permissions
    options.push({
      value: "Default",
      label: "Default",
      type: "system",
    });

    // Add users
    if (usersList?.data?.Results) {
      usersList.data.Results.forEach((user) => {
        options.push({
          value: user.userPrincipalName,
          label: `${user.displayName} (${user.userPrincipalName})`,
          type: "user",
        });
      });
    }

    // Add mail-enabled security groups
    if (groupsList?.data?.Results) {
      groupsList.data.Results.forEach((group) => {
        options.push({
          value: group.mail,
          label: `${group.displayName} (${group.mail})`,
          type: "group",
        });
      });
    }

    // Sort alphabetically by label, but keep system users at the top
    return options.sort((a, b) => {
      if (a.type === "system" && b.type !== "system") return -1;
      if (b.type === "system" && a.type !== "system") return 1;
      return a.label.localeCompare(b.label);
    });
  }, [usersList?.data?.Results, groupsList?.data?.Results]);

  const isUserGroupLoading = usersList.isFetching || groupsList.isFetching;

  const subtitle = graphUserRequest.isSuccess
    ? [
        {
          icon: <Mail />,
          text: (
            <CippCopyToClipBoard type="chip" text={graphUserRequest.data?.[0]?.userPrincipalName} />
          ),
        },
        {
          icon: <Fingerprint />,
          text: <CippCopyToClipBoard type="chip" text={graphUserRequest.data?.[0]?.id} />,
        },
        {
          icon: <CalendarIcon />,
          text: (
            <>
              Created: <CippTimeAgo data={graphUserRequest.data?.[0]?.createdDateTime} />
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

  const mailboxPermissionActions = [
    {
      label: "Remove Permission",
      type: "POST",
      icon: <Delete />,
      url: "/api/ExecModifyMBPerms",
      customDataformatter: (row, action, formData) => {
        var permissions = [];
        if (Array.isArray(row)) {
          row.forEach((item) => {
            // Safely extract original user identifier
            const originalUser = item?._raw?.User || item?.User;
            if (originalUser) {
              // Only add if we have a valid user
              permissions.push({
                UserID: originalUser, // Use original identifier for API calls
                PermissionLevel: item?.AccessRights || "Unknown",
                Modification: "Remove",
              });
            }
          });
        } else {
          // Safely extract original user identifier
          const originalUser = row?._raw?.User || row?.User;
          if (originalUser) {
            // Only add if we have a valid user
            permissions.push({
              UserID: originalUser, // Use original identifier for API calls
              PermissionLevel: row?.AccessRights || "Unknown",
              Modification: "Remove",
            });
          }
        }

        return {
          userID: graphUserRequest.data?.[0]?.userPrincipalName,
          tenantFilter: userSettingsDefaults.currentTenant,
          permissions: permissions,
        };
      },
      confirmText: "Are you sure you want to remove this permission?",
      multiPost: false,
      relatedQueryKeys: `Mailbox-${userId}`,
    },
  ];

  const permissions = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: userRequest.isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : userRequest.data?.[0]?.Permissions?.length !== 0 ? (
          <Check />
        ) : (
          <Error />
        ),
      },
      text: "Mailbox Permissions",
      subtext:
        userRequest.data?.[0]?.Permissions?.length !== 0
          ? "Other users or groups have access to this mailbox"
          : "No other users or groups have access to this mailbox",
      statusColor: "green.main",
      cardLabelBoxActions: (
        <Button
          startIcon={<PersonAdd />}
          onClick={() => permissionsDialog.handleOpen()}
          variant="outlined"
          color="primary"
          size="small"
        >
          Add Permissions
        </Button>
      ),
      table: {
        title: "Mailbox Permissions",
        hideTitle: true,
        data:
          userRequest.data?.[0]?.Permissions?.map((permission) => {
            const userIdentifier = permission?.User;
            const permissionInfo = getPermissionInfo(permission.User, groupsList);
            return {
              User: permissionInfo.displayName, // Show clean name
              AccessRights: permission.AccessRights,
              Type: permissionInfo.type,
              _raw: permission,
            };
          }) || [],
        refreshFunction: () => userRequest.refetch(),
        isFetching: userRequest.isFetching,
        simpleColumns: ["User", "AccessRights", "Type"],
        actions: mailboxPermissionActions,
        offCanvas: {
          children: (data) => {
            const originalUser = data?._raw?.User || data?.User;
            const permissionInfo = getPermissionInfo(originalUser, groupsList);
            return (
              <CippPropertyListCard
                cardSx={{ p: 0, m: -2 }}
                title="Permission Details"
                propertyItems={[
                  {
                    label: "User/Group",
                    value: permissionInfo.displayName,
                  },
                  {
                    label: "Type",
                    value: permissionInfo.type,
                  },
                  {
                    label: "Access Rights",
                    value: data?.AccessRights || "Unknown",
                  },
                ]}
                actionItems={mailboxPermissionActions}
              />
            );
          },
        },
      },
    },
  ];

  // Replace your existing calCard array with this simple version:
  const calCard = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: calPermissions.isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : calPermissions.data?.length !== 0 ? (
          <Check />
        ) : (
          <Error />
        ),
      },
      text: "Calendar permissions",
      subtext:
        calPermissions.data?.length !== 0
          ? "Other users or groups have access to this calendar"
          : "No other users or groups have access to this calendar",
      statusColor: "green.main",
      cardLabelBoxActions: (
        <Button
          startIcon={<CalendarToday />}
          onClick={() => calendarPermissionsDialog.handleOpen()}
          variant="outlined"
          color="primary"
          size="small"
        >
          Add Permissions
        </Button>
      ),
      table: {
        title: "Calendar Permissions",
        hideTitle: true,
        data:
          calPermissions.data?.map((permission) => {
            const userIdentifier = permission?.User;
            const permissionInfo = getPermissionInfo(permission.User, groupsList);
            return {
              User: permissionInfo.displayName,
              AccessRights: permission?.AccessRights?.join(", ") || "Unknown",
              FolderName: permission?.FolderName || "Unknown",
              Type: permissionInfo.type,
              _raw: permission,
            };
          }) || [],
        refreshFunction: () => calPermissions.refetch(),
        isFetching: calPermissions.isFetching,
        simpleColumns: ["User", "AccessRights", "FolderName", "Type"],
        actions: [
          {
            label: "Remove Permission",
            type: "POST",
            icon: <Delete />,
            url: "/api/ExecModifyCalPerms",
            customDataformatter: (row, action, formData) => {
              var permissions = [];
              if (Array.isArray(row)) {
                row.forEach((item) => {
                  const originalUser = item._raw ? item._raw.User : item.User;
                  permissions.push({
                    UserID: originalUser, // Use original identifier for API calls
                    PermissionLevel: item.AccessRights,
                    FolderName: item.FolderName,
                    Modification: "Remove",
                  });
                });
              } else {
                const originalUser = row._raw ? row._raw.User : row.User;
                permissions.push({
                  UserID: originalUser, // Use original identifier for API calls
                  PermissionLevel: row.AccessRights,
                  FolderName: row.FolderName,
                  Modification: "Remove",
                });
              }
              return {
                userID: graphUserRequest.data?.[0]?.userPrincipalName,
                tenantFilter: userSettingsDefaults.currentTenant,
                permissions: permissions,
              };
            },
            confirmText: "Are you sure you want to remove this calendar permission?",
            multiPost: false,
            relatedQueryKeys: `CalendarPermissions-${userId}`,
            condition: (row) => row.User !== "Default" && row.User !== "Anonymous",
          },
        ],
        offCanvas: {
          children: (data) => {
            const originalUser = data._raw ? data._raw.User : data.User;
            const permissionInfo = getPermissionInfo(originalUser, groupsList);
            return (
              <CippPropertyListCard
                cardSx={{ p: 0, m: -2 }}
                title="Permission Details"
                propertyItems={[
                  {
                    label: "User/Group",
                    value: permissionInfo.displayName,
                  },
                  {
                    label: "Type",
                    value: permissionInfo.type,
                  },
                  {
                    label: "Access Rights",
                    value: data.AccessRights,
                  },
                  {
                    label: "Folder Name",
                    value: data.FolderName,
                  },
                ]}
                actionItems={[
                  {
                    label: "Remove Permission",
                    type: "POST",
                    icon: <Delete />,
                    url: "/api/ExecModifyCalPerms",
                    data: {
                      userID: graphUserRequest.data?.[0]?.userPrincipalName,
                      tenantFilter: userSettingsDefaults.currentTenant,
                      permissions: [
                        {
                          UserID: originalUser, // Use original identifier for API calls
                          PermissionLevel: data.AccessRights,
                          FolderName: data.FolderName,
                          Modification: "Remove",
                        },
                      ],
                    },
                    confirmText: "Are you sure you want to remove this calendar permission?",
                    multiPost: false,
                    relatedQueryKeys: `CalendarPermissions-${userId}`,
                  },
                ]}
              />
            );
          },
        },
      },
    },
  ];

  const mailboxRuleActions = [
    {
      label: "Enable Mailbox Rule",
      type: "POST",
      icon: <PlayArrow />,
      url: "/api/ExecSetMailboxRule",
      customDataformatter: (row, action, formData) => {
        return {
          ruleId: row?.Identity,
          userPrincipalName: graphUserRequest.data?.[0]?.userPrincipalName,
          ruleName: row?.Name,
          Enable: true,
          tenantFilter: userSettingsDefaults.currentTenant,
        };
      },
      condition: (row) => row && !row.Enabled,
      confirmText: "Are you sure you want to enable this mailbox rule?",
      multiPost: false,
    },
    {
      label: "Disable Mailbox Rule",
      type: "POST",
      icon: <Block />,
      url: "/api/ExecSetMailboxRule",
      customDataformatter: (row, action, formData) => {
        return {
          ruleId: row?.Identity,
          userPrincipalName: graphUserRequest.data?.[0]?.userPrincipalName,
          ruleName: row?.Name,
          Disable: true,
          tenantFilter: userSettingsDefaults.currentTenant,
        };
      },
      condition: (row) => row && row.Enabled,
      confirmText: "Are you sure you want to disable this mailbox rule?",
      multiPost: false,
    },
    {
      label: "Remove Mailbox Rule",
      type: "POST",
      icon: <Delete />,
      url: "/api/ExecRemoveMailboxRule",
      customDataformatter: (row, action, formData) => {
        return {
          ruleId: row?.Identity,
          ruleName: row?.Name,
          userPrincipalName: graphUserRequest.data?.[0]?.userPrincipalName,
          tenantFilter: userSettingsDefaults.currentTenant,
        };
      },
      confirmText: "Are you sure you want to remove this mailbox rule?",
      multiPost: false,
      relatedQueryKeys: `MailboxRules-${userId}`,
    },
  ];

  const mailboxRulesCard = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: mailboxRulesRequest.isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : mailboxRulesRequest.data?.length !== 0 ? (
          <Check />
        ) : (
          <Error />
        ),
      },
      text: "Current Mailbox Rules",
      subtext: mailboxRulesRequest.data?.length
        ? "Mailbox rules are configured for this user"
        : "No mailbox rules configured for this user",
      statusColor: "green.main",
      table: {
        title: "Mailbox Rules",
        hideTitle: true,
        data: mailboxRulesRequest.data || [],
        refreshFunction: () => mailboxRulesRequest.refetch(),
        isFetching: mailboxRulesRequest.isFetching,
        simpleColumns: ["Enabled", "Name", "Description", "Priority"],
        actions: mailboxRuleActions,
        offCanvas: {
          children: (data) => {
            const keys = Object.keys(data).filter(
              (key) => !key.includes("@odata") && !key.includes("@data")
            );
            const properties = [];
            keys.forEach((key) => {
              if (data[key] && data[key].length > 0) {
                properties.push({
                  label: getCippTranslation(key),
                  value: getCippFormatting(data[key], key),
                });
              }
            });
            return (
              <CippPropertyListCard
                cardSx={{ p: 0, m: -2 }}
                title="Rule Details"
                propertyItems={properties}
                actionItems={[
                  {
                    label: "Enable Mailbox Rule",
                    type: "POST",
                    icon: <PlayArrow />,
                    url: "/api/ExecSetMailboxRule",
                    data: {
                      ruleId: data?.Identity,
                      userPrincipalName: graphUserRequest.data?.[0]?.userPrincipalName,
                      ruleName: data?.Name,
                      Enable: true,
                      tenantFilter: userSettingsDefaults.currentTenant,
                    },
                    confirmText: "Are you sure you want to enable this mailbox rule?",
                    multiPost: false,
                  },
                  {
                    label: "Disable Mailbox Rule",
                    type: "POST",
                    icon: <Block />,
                    url: "/api/ExecSetMailboxRule",
                    data: {
                      ruleId: data?.Identity,
                      userPrincipalName: graphUserRequest.data?.[0]?.userPrincipalName,
                      ruleName: data?.Name,
                      Disable: true,
                      tenantFilter: userSettingsDefaults.currentTenant,
                    },
                    confirmText: "Are you sure you want to disable this mailbox rule?",
                    multiPost: false,
                  },
                  {
                    label: "Remove Mailbox Rule",
                    type: "POST",
                    icon: <Delete />,
                    url: "/api/ExecRemoveMailboxRule",
                    data: {
                      ruleId: data?.Identity,
                      ruleName: data?.Name,
                      userPrincipalName: graphUserRequest.data?.[0]?.userPrincipalName,
                      tenantFilter: userSettingsDefaults.currentTenant,
                    },
                    confirmText: "Are you sure you want to remove this mailbox rule?",
                    multiPost: false,
                    relatedQueryKeys: `MailboxRules-${userId}`,
                  },
                ]}
              />
            );
          },
        },
      },
    },
  ];

  const proxyAddressActions = [
    {
      label: "Make Primary",
      type: "POST",
      icon: <Star />,
      url: "/api/EditUserAliases",
      data: {
        id: userId,
        tenantFilter: userSettingsDefaults.currentTenant,
        MakePrimary: "Address",
      },
      confirmText: "Are you sure you want to make this the primary proxy address?",
      multiPost: false,
      relatedQueryKeys: `ListUsers-${userId}`,
      condition: (row) => row && row.Type !== "Primary",
    },
    {
      label: "Remove Proxy Address",
      type: "POST",
      icon: <Delete />,
      url: "/api/EditUserAliases",
      data: {
        id: userId,
        tenantFilter: userSettingsDefaults.currentTenant,
        RemovedAliases: "Address",
      },
      confirmText: "Are you sure you want to remove this proxy address?",
      multiPost: false,
      relatedQueryKeys: `ListUsers-${userId}`,
      condition: (row) => row && row.Type !== "Primary",
    },
  ];

  const proxyAddressesCard = [
    {
      id: 1,
      cardLabelBox: {
        cardLabelBoxHeader: graphUserRequest.isFetching ? (
          <CircularProgress size="25px" color="inherit" />
        ) : graphUserRequest.data?.[0]?.proxyAddresses?.length > 1 ? (
          <Check />
        ) : (
          <Error />
        ),
      },
      text: "Proxy Addresses",
      subtext:
        graphUserRequest.data?.[0]?.proxyAddresses?.length > 1
          ? "Proxy addresses are configured for this user"
          : "No proxy addresses configured for this user",
      statusColor: "green.main",
      cardLabelBoxActions: (
        <Button
          startIcon={<AlternateEmail />}
          onClick={() => aliasDialog.handleOpen()}
          variant="outlined"
          color="primary"
          size="small"
        >
          Add Alias
        </Button>
      ),
      table: {
        title: "Proxy Addresses",
        hideTitle: true,
        data:
          graphUserRequest.data?.[0]?.proxyAddresses?.map((address) => ({
            Address: address,
            Type: address?.startsWith("SMTP:") ? "Primary" : "Alias",
          })) || [],
        refreshFunction: () => graphUserRequest.refetch(),
        isFetching: graphUserRequest.isFetching,
        simpleColumns: ["Address", "Type"],
        actions: proxyAddressActions,
        offCanvas: {
          children: (data) => {
            return (
              <CippPropertyListCard
                cardSx={{ p: 0, m: -2 }}
                title="Address Details"
                propertyItems={[
                  {
                    label: "Address",
                    value: data.Address,
                  },
                  {
                    label: "Type",
                    value: data.Type,
                  },
                ]}
                actionItems={proxyAddressActions}
              />
            );
          },
        },
      },
    },
  ];

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      subtitle={subtitle}
      actions={CippExchangeActions()}
      actionsData={userRequest.data?.[0]?.MailboxActionsData}
      isFetching={graphUserRequest.isLoading}
    >
      <CippApiResults apiObject={userRequest} errorsOnly={true} />
      {graphUserRequest.isLoading && <CippFormSkeleton layout={[2, 1, 2, 2]} />}
      {graphUserRequest.isSuccess && (
        <Box
          sx={{
            flexGrow: 1,
            py: 4,
            mr: 2,
          }}
        >
          <Grid container spacing={2}>
            {userRequest?.data?.[0]?.Mailbox?.[0]?.error && (
              <Grid size={12}>
                <Alert severity="error">
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">
                      {userRequest?.data?.[0]?.Mailbox?.[0]?.error.includes(
                        "Microsoft.Exchange.Configuration.Tasks.ManagementObjectNotFoundException"
                      )
                        ? "This user does not have a mailbox, make sure they are licensed for Exchange."
                        : "An error occurred while fetching the mailbox details."}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setShowDetails(!showDetails)}
                      sx={{ mr: 1 }}
                    >
                      {showDetails ? "Hide Details" : "Show Details"}
                    </Button>
                  </Box>
                  <Collapse in={showDetails}>
                    <Box mt={2}>{userRequest?.data?.[0]?.Mailbox?.[0]?.error}</Box>
                  </Collapse>
                </Alert>
              </Grid>
            )}
            {!userRequest?.data?.[0]?.Mailbox?.[0]?.error?.includes(
              "Microsoft.Exchange.Configuration.Tasks.ManagementObjectNotFoundException"
            ) && (
              <>
                <Grid size={4}>
                  <CippExchangeInfoCard
                    exchangeData={data}
                    isLoading={userRequest.isLoading}
                    isFetching={userRequest.isFetching}
                    handleRefresh={() => userRequest.refetch()}
                  />
                </Grid>
                <Grid size={8}>
                  <Stack spacing={3}>
                    <CippBannerListCard
                      isFetching={graphUserRequest.isLoading}
                      items={proxyAddressesCard}
                      isCollapsible={true}
                    />
                    <CippBannerListCard
                      isFetching={userRequest.isLoading}
                      items={permissions}
                      isCollapsible={true}
                    />
                    <CippBannerListCard
                      isFetching={calPermissions.isLoading}
                      items={calCard}
                      isCollapsible={true}
                    />
                    <CippBannerListCard
                      isFetching={mailboxRulesRequest.isLoading}
                      items={mailboxRulesCard}
                      isCollapsible={true}
                    />
                    <CippExchangeSettingsForm
                      userId={userId}
                      calPermissions={calPermissions.data}
                      currentSettings={userRequest.data?.[0]}
                      isFetching={userRequest.isFetching}
                      formControl={formControl}
                      oooRequest={oooRequest}
                    />
                  </Stack>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      )}
      {actionData.ready && (
        <CippApiDialog
          createDialog={createDialog}
          title="Confirmation"
          api={actionData.action}
          row={actionData.data}
        />
      )}
      <CippApiDialog
        createDialog={aliasDialog}
        title="Add Proxy Addresses"
        api={aliasApiConfig}
        row={graphUserRequest.data?.[0]}
      >
        {({ formHook }) => <CippAliasDialog formHook={formHook} />}
      </CippApiDialog>

      <CippApiDialog
        createDialog={permissionsDialog}
        title="Add Mailbox Permissions"
        api={permissionsApiConfig}
        row={graphUserRequest.data?.[0]}
        allowResubmit={true}
      >
        {({ formHook }) => (
          <CippMailboxPermissionsDialog
            formHook={formHook}
            combinedOptions={mailboxPermissionOptions}
            isUserGroupLoading={isUserGroupLoading}
            defaultAutoMap={true}
          />
        )}
      </CippApiDialog>

      <CippApiDialog
        createDialog={calendarPermissionsDialog}
        title="Add Calendar Permissions"
        api={calendarPermissionsApiConfig}
        row={graphUserRequest.data?.[0]}
        allowResubmit={true}
      >
        {({ formHook }) => (
          <CippCalendarPermissionsDialog
            formHook={formHook}
            combinedOptions={calendarPermissionOptions}
            isUserGroupLoading={isUserGroupLoading}
          />
        )}
      </CippApiDialog>
    </HeaderedTabbedLayout>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
