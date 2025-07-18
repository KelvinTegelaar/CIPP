import { TrashIcon, MagnifyingGlassIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import {
  Archive,
  MailOutline,
  Person,
  Room,
  Visibility,
  VisibilityOff,
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
  Email,
} from "@mui/icons-material";

export const CippExchangeActions = () => {
  // const tenant = useSettings().currentTenant;
  return [
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
      data: { ID: "userPrincipalName" },
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
      //tested
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
      url: "/api/ExecCopyForSent",
      data: { ID: "UPN" },
      fields: [
        {
          type: "radio",
          name: "MessageCopyForSentAsEnabled",
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
