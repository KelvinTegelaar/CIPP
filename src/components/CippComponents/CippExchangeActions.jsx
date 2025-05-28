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
      label: "Convert to User Mailbox",
      type: "POST",
      url: "/api/ExecConvertMailbox",
      icon: <Person />,
      data: {
        ID: "UPN",
        MailboxType: "!Regular",
      },
      confirmText: "Are you sure you want to convert [UPN] to a user mailbox?",
      condition: (row) => row.recipientTypeDetails !== "UserMailbox",
    },
    {
      label: "Convert to Shared Mailbox",
      type: "POST",
      icon: <MailOutline />,
      url: "/api/ExecConvertMailbox",
      data: {
        ID: "UPN",
        MailboxType: "!Shared",
      },
      confirmText: "Are you sure you want to convert [UPN] to a shared mailbox?",
      condition: (row) => row.recipientTypeDetails !== "SharedMailbox",
    },
    {
      label: "Convert to Room Mailbox",
      type: "POST",
      url: "/api/ExecConvertMailbox",
      icon: <Room />,
      data: {
        ID: "UPN",
        MailboxType: "!Room",
      },
      confirmText: "Are you sure you want to convert [UPN] to a room mailbox?",
      condition: (row) => row.recipientTypeDetails !== "RoomMailbox",
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
      label: "Hide from Global Address List",
      type: "POST",
      url: "/api/ExecHideFromGAL",
      icon: <VisibilityOff />,
      data: {
        ID: "UPN",
        HidefromGAL: true,
      },
      confirmText:
        "Are you sure you want to hide [UPN] from the global address list? This will not work if the user is AD Synced.",
      condition: (row) => row.HiddenFromAddressListsEnabled === false,
    },
    {
      label: "Unhide from Global Address List",
      type: "POST",
      url: "/api/ExecHideFromGAL",
      icon: <Visibility />,
      data: {
        ID: "UPN",
        HidefromGAL: false,
      },
      confirmText:
        "Are you sure you want to unhide [UPN] from the global address list? This will not work if the user is AD Synced.",
      condition: (row) => row.HiddenFromAddressListsEnabled === true,
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
      label: "Copy Sent Items to for Delegated Mailboxes",
      type: "POST",
      url: "/api/ExecCopyForSent",
      data: { ID: "UPN", MessageCopyForSentAsEnabled: true },
      confirmText: "Are you sure you want to enable Copy Sent Items on [UPN]?",
      icon: <MailOutline />,
      condition: (row) => row.MessageCopyForSentAsEnabled === false,
    },
    {
      label: "Disable Copy Sent Items for Delegated Mailboxes",
      type: "POST",
      url: "/api/ExecCopyForSent",
      data: { ID: "UPN", MessageCopyForSentAsEnabled: false },
      confirmText: "Are you sure you want to disable Copy Sent Items on [UPN]?",
      icon: <MailOutline />,
      condition: (row) => row.MessageCopyForSentAsEnabled === true,
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
        },
      ],
    },
  ];
};

export default CippExchangeActions;
