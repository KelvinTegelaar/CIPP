import { TrashIcon, MagnifyingGlassIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import {
  Archive,
  MailOutline,
  Visibility,
  PhonelinkLock,
  Key,
  PostAdd,
  Gavel,
  Language,
  Outbox,
  NotificationImportant,
  DataUsage,
  MailLock,
  SettingsEthernet,
  CalendarMonth,
  PersonAdd,
  Email,
} from "@mui/icons-material";
import { useSettings } from "../../hooks/use-settings.js";
import { useMemo } from "react";

export const CippExchangeActions = () => {
  const tenant = useSettings().currentTenant;

  // API configuration for all user selection fields
  const userApiConfig = useMemo(
    () => ({
      url: "/api/ListGraphRequest",
      dataKey: "Results",
      labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
      valueField: "userPrincipalName",
      queryKey: `users-${tenant}`,
      data: {
        Endpoint: "users",
        tenantFilter: tenant,
        $select: "id,displayName,userPrincipalName,mail",
        $top: 999,
      },
    }),
    [tenant]
  );

  return [
    {
      label: "Bulk Add Mailbox Permissions",
      type: "POST",
      url: "/api/ExecModifyMBPerms",
      icon: <PersonAdd />,
      data: {
        userID: "UPN",
      },
      confirmText: "Add the specified permissions to selected mailboxes?",
      multiPost: false,
      data: {},
      fields: [
        {
          type: "autoComplete",
          name: "fullAccessUser",
          label: "Add Full Access User",
          multiple: true,
          creatable: false,
          api: userApiConfig,
        },
        {
          type: "switch",
          name: "autoMap",
          label: "Enable Automapping",
          defaultValue: true,
          labelLocation: "behind",
        },
        {
          type: "autoComplete",
          name: "sendAsUser",
          label: "Add Send As User",
          multiple: true,
          creatable: false,
          api: userApiConfig,
        },
        {
          type: "autoComplete",
          name: "sendOnBehalfUser",
          label: "Add Send On Behalf User",
          multiple: true,
          creatable: false,
          api: userApiConfig,
        },
      ],
      customDataformatter: (rows, action, formData) => {
        const mailboxArray = Array.isArray(rows) ? rows : [rows];

        // Create bulk request array - one object per mailbox
        const bulkRequestData = mailboxArray.map((mailbox) => {
          const permissions = [];
          const autoMap = formData.autoMap === undefined ? true : formData.autoMap;

          // Add type: "user" to match format
          const addTypeToUsers = (users) => {
            return users.map((user) => ({
              ...user,
              type: "user",
            }));
          };

          // Handle FullAccess - formData.fullAccessUser is an array since multiple: true
          if (formData.fullAccessUser && formData.fullAccessUser.length > 0) {
            permissions.push({
              UserID: addTypeToUsers(formData.fullAccessUser),
              PermissionLevel: "FullAccess",
              Modification: "Add",
              AutoMap: autoMap,
            });
          }

          // Handle SendAs - formData.sendAsUser is an array since multiple: true
          if (formData.sendAsUser && formData.sendAsUser.length > 0) {
            permissions.push({
              UserID: addTypeToUsers(formData.sendAsUser),
              PermissionLevel: "SendAs",
              Modification: "Add",
            });
          }

          // Handle SendOnBehalf - formData.sendOnBehalfUser is an array since multiple: true
          if (formData.sendOnBehalfUser && formData.sendOnBehalfUser.length > 0) {
            permissions.push({
              UserID: addTypeToUsers(formData.sendOnBehalfUser),
              PermissionLevel: "SendOnBehalf",
              Modification: "Add",
            });
          }

          return {
            userID: mailbox.UPN,
            permissions: permissions,
          };
        });

        return {
          mailboxRequests: bulkRequestData,
          tenantFilter: tenant,
        };
      },
      color: "primary",
    },
    {
      label: "Edit permissions",
      link: "/identity/administration/users/user/exchange?userId=[ExternalDirectoryObjectId]",
      color: "info",
      icon: <Key />,
    },
    {
      label: "Research Compromised Account",
      link: "/identity/administration/users/user/bec?userId=[ExternalDirectoryObjectId]",
      color: "info",
      icon: <MagnifyingGlassIcon />,
    },
    {
      label: "Send MFA Push",
      type: "POST",
      url: "/api/ExecSendPush",
      data: {
        UserEmail: "UPN",
      },
      confirmText: "Are you sure you want to send an MFA request to [UPN]?",
      icon: <PhonelinkLock />,
    },
    {
      label: "Convert Mailbox",
      type: "POST",
      icon: <Email />,
      url: "/api/ExecConvertMailbox",
      data: { ID: "UPN" },
      fields: [
        {
          type: "radio",
          name: "MailboxType",
          label: "Mailbox Type",
          options: [
            { label: "User Mailbox", value: "Regular" },
            { label: "Shared Mailbox", value: "Shared" },
            { label: "Room Mailbox", value: "Room" },
            { label: "Equipment Mailbox", value: "Equipment" },
          ],
          validators: { required: "Please select a mailbox type" },
        },
      ],
      confirmText:
        "Pick the type of mailbox you want to convert [UPN] of mailbox type [recipientTypeDetails] to:",
      multiPost: false,
    },
    {
      label: "Enable Online Archive",
      type: "POST",
      icon: <Archive />,
      url: "/api/ExecEnableArchive",
      data: { ID: "Id", username: "UPN" },
      confirmText: "Are you sure you want to enable the online archive for [UPN]?",
      multiPost: false,
      condition: (row) => row.ArchiveGuid === "00000000-0000-0000-0000-000000000000",
    },
    {
      label: "Set Retention Policy",
      type: "POST",
      url: "/api/ExecSetMailboxRetentionPolicies",
      icon: <MailLock />,
      confirmText: "Set the specified retention policy for selected mailboxes?",
      multiPost: false,
      fields: [
        {
          type: "autoComplete",
          name: "policyName",
          label: "Retention Policy",
          multiple: false,
          creatable: false,
          validators: { required: "Please select a retention policy" },
          api: {
            url: "/api/ExecManageRetentionPolicies",
            labelField: "Name",
            valueField: "Name",
            queryKey: `RetentionPolicies-${tenant}`,
            data: {
              tenantFilter: tenant,
            },
          },
        },
      ],
      customDataformatter: (rows, action, formData) => {
        const mailboxArray = Array.isArray(rows) ? rows : [rows];

        // Extract mailbox identities - using UPN as the identifier
        const mailboxes = mailboxArray.map((mailbox) => mailbox.UPN);

        // Handle autocomplete selection - could be string or object
        const policyName =
          typeof formData.policyName === "object" ? formData.policyName.value : formData.policyName;

        return {
          PolicyName: policyName,
          Mailboxes: mailboxes,
          tenantFilter: tenant,
        };
      },
      color: "primary",
    },
    {
      label: "Enable Auto-Expanding Archive",
      type: "POST",
      icon: <PostAdd />,
      url: "/api/ExecEnableAutoExpandingArchive",
      data: { ID: "Id", username: "UPN" },
      confirmText:
        "Are you sure you want to enable auto-expanding archive for [UPN]? The archive must already be enabled.",
      multiPost: false,
      condition: (row) => row.ArchiveGuid !== "00000000-0000-0000-0000-000000000000",
    },
    {
      label: "Set Global Address List visibility",
      type: "POST",
      url: "/api/ExecHideFromGAL",
      icon: <Visibility />,
      data: {
        ID: "UPN",
      },
      fields: [
        {
          type: "radio",
          name: "HidefromGAL",
          label: "Global Address List visibility",
          options: [
            { label: "Hidden", value: true },
            { label: "Shown", value: false },
          ],
          validators: { required: "Please select a global address list state" },
        },
      ],
      confirmText:
        "Are you sure you want to set the global address list state for [UPN]? Changes can take up to 72 hours to take effect.",
    },
    {
      label: "Start Managed Folder Assistant",
      type: "POST",
      url: "/api/ExecStartManagedFolderAssistant",
      icon: <PlayCircleIcon />,
      data: {
        ID: "ExchangeGuid",
        UserPrincipalName: "UPN",
      },
      confirmText: "Are you sure you want to start the managed folder assistant for [UPN]?",
    },
    {
      label: "Delete Mailbox",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveUser",
      data: { ID: "UPN" },
      confirmText: "Are you sure you want to delete [UPN]?",
      multiPost: false,
    },
    {
      label: "Set Copy Sent Items for Delegated Mailboxes",
      type: "POST",
      icon: <MailOutline />,
      condition: (row) =>
        row.recipientTypeDetails === "UserMailbox" || row.recipientTypeDetails === "SharedMailbox",
      url: "/api/ExecCopyForSent",
      data: { ID: "UPN" },
      fields: [
        {
          type: "radio",
          name: "messageCopyState",
          label: "Copy Sent Items",
          options: [
            { label: "Enabled", value: true },
            { label: "Disabled", value: false },
          ],
          validators: { required: "Please select a copy sent items state" },
        },
      ],
      confirmText: "Are you sure you want to set Copy Sent Items for [UPN]?",
    },
    {
      label: "Set Litigation Hold",
      type: "POST",
      url: "/api/ExecSetLitigationHold",
      data: { UPN: "UPN", Identity: "Id" },
      confirmText: "What do you want to set the Litigation Hold to?",
      icon: <Gavel />,
      condition: (row) => row.LicensedForLitigationHold === true,
      fields: [
        {
          type: "switch",
          name: "disable",
          label: "Disable Litigation Hold",
        },
        {
          type: "number",
          name: "days",
          label: "Hold Duration (Days)",
          placeholder: "Blank or 0 for indefinite",
        },
      ],
    },
    {
      label: "Set Retention Hold",
      type: "POST",
      url: "/api/ExecSetRetentionHold",
      data: { UPN: "UPN", Identity: "Id" },
      confirmText: "What do you want to set Retention Hold to?",
      icon: <MailLock />,
      fields: [
        {
          type: "switch",
          name: "disable",
          label: "Disable Retention Hold",
        },
      ],
    },
    {
      label: "Set Mailbox Locale",
      type: "POST",
      url: "/api/ExecSetMailboxLocale",
      data: { user: "UPN", ProhibitSendQuota: true },
      confirmText: "Enter a locale, e.g. en-US",
      icon: <Language />,
      fields: [
        {
          label: "Locale",
          name: "locale",
          type: "textField",
          placeholder: "e.g. en-US",
          validators: { required: "Please enter a locale" },
        },
      ],
    },
    {
      label: "Set Max Send/Receive Size",
      type: "POST",
      url: "/api/ExecSetMailboxEmailSize",
      data: { UPN: "UPN", id: "ExternalDirectoryObjectId" },
      confirmText: "Enter a size in from 1 to 150. Leave blank to not change.",
      icon: <SettingsEthernet />,
      fields: [
        {
          label: "Send Size(MB)",
          name: "maxSendSize",
          type: "number",
          placeholder: "e.g. 35",
        },
        {
          label: "Receive Size(MB)",
          name: "maxReceiveSize",
          type: "number",
          placeholder: "e.g. 36",
        },
      ],
    },
    {
      label: "Set Send Quota",
      type: "POST",
      url: "/api/ExecSetMailboxQuota",
      data: { user: "UPN", ProhibitSendQuota: true },
      confirmText: "Enter a quota. e.g. 1000MB, 10GB,1TB",
      icon: <Outbox />,
      fields: [
        {
          label: "Quota",
          name: "quota",
          type: "textField",
          placeholder: "e.g. 1000MB, 10GB,1TB",
          validators: { required: "Please enter a quota" },
        },
      ],
    },
    {
      label: "Set Send and Receive Quota",
      type: "POST",
      url: "/api/ExecSetMailboxQuota",
      data: {
        user: "UPN",
        ProhibitSendReceiveQuota: true,
      },
      confirmText: "Enter a quota. e.g. 1000MB, 10GB,1TB",
      icon: <DataUsage />,
      fields: [
        {
          label: "Quota",
          name: "quota",
          type: "textField",
          placeholder: "e.g. 1000MB, 10GB,1TB",
          validators: { required: "Please enter a quota" },
        },
      ],
    },
    {
      label: "Set Quota Warning Level",
      type: "POST",
      url: "/api/ExecSetMailboxQuota",
      data: { user: "UPN", IssueWarningQuota: true },
      confirmText: "Enter a quota. e.g. 1000MB, 10GB,1TB",
      icon: <NotificationImportant />,
      fields: [
        {
          label: "Quota",
          name: "quota",
          type: "textField",
          placeholder: "e.g. 1000MB, 10GB,1TB",
          validators: { required: "Please enter a quota" },
        },
      ],
    },
    {
      label: "Set Calendar Processing",
      type: "POST",
      url: "/api/ExecSetCalendarProcessing",
      data: { UPN: "UPN" },
      confirmText: "Configure calendar processing settings for [UPN]",
      icon: <CalendarMonth />,
      condition: (row) =>
        row.recipientTypeDetails === "RoomMailbox" ||
        row.recipientTypeDetails === "EquipmentMailbox",
      fields: [
        {
          label: "Automatically Process Meeting Requests",
          name: "automaticallyProcess",
          type: "switch",
        },
        {
          label: "Automatically Accept Meeting Requests",
          name: "automaticallyAccept",
          type: "switch",
        },
        {
          label: "Allow Conflicts",
          name: "allowConflicts",
          type: "switch",
        },
        {
          label: "Maximum Number of Conflicts",
          name: "maxConflicts",
          type: "number",
          placeholder: "e.g. 2",
        },
        {
          label: "Allow Recurring Meetings",
          name: "allowRecurringMeetings",
          type: "switch",
        },
        {
          label: "Schedule Only During Work Hours",
          name: "scheduleOnlyDuringWorkHours",
          type: "switch",
        },
        {
          label: "Maximum Duration (Minutes)",
          name: "maximumDurationInMinutes",
          type: "number",
          placeholder: "e.g. 240",
        },
        {
          label: "Minimum Duration (Minutes)",
          name: "minimumDurationInMinutes",
          type: "number",
          placeholder: "e.g. 30",
        },
        {
          label: "Booking Window (Days)",
          name: "bookingWindowInDays",
          type: "number",
          placeholder: "e.g. 30",
        },
        {
          label: "Add Organizer to Subject",
          name: "addOrganizerToSubject",
          type: "switch",
        },
        {
          label: "Delete Comments",
          name: "deleteComments",
          type: "switch",
        },
        {
          label: "Delete Subject",
          name: "deleteSubject",
          type: "switch",
        },
        {
          label: "Remove Private Property",
          name: "removePrivateProperty",
          type: "switch",
        },
        {
          label: "Remove Canceled Meetings",
          name: "removeCanceledMeetings",
          type: "switch",
        },
        {
          label: "Remove Old Meeting Messages",
          name: "removeOldMeetingMessages",
          type: "switch",
        },
        {
          label: "Process External Meeting Messages",
          name: "processExternalMeetingMessages",
          type: "switch",
        },
        {
          label: "Additional Response",
          name: "additionalResponse",
          type: "textField",
          placeholder: "Additional text to add to responses",
        },
      ],
    },
  ];
};

export default CippExchangeActions;
