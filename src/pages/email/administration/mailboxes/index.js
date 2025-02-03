import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import Link from "next/link";
import { Button } from "@mui/material";

import {
  Archive,
  MailOutline,
  Person,
  Room,
  Visibility,
  VisibilityOff,
  PhonelinkLock,
  Key,
} from "@mui/icons-material";
import { TrashIcon, MagnifyingGlassIcon, PlayCircleIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Mailboxes";

  // Define actions for mailboxes
  const actions = [
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
      type: "GET",
      url: "/api/ExecSendPush",
      data: {
        UserEmail: "UPN",
      },
      confirmText: "Are you sure you want to send an MFA request?",
      icon: <PhonelinkLock />,
    },
    {
      label: "Convert to Shared Mailbox",
      type: "GET",
      icon: <MailOutline />,
      url: "/api/ExecConvertToSharedMailbox",
      data: {
        ID: "UPN",
      },
      confirmText: "Are you sure you want to convert this mailbox to a shared mailbox?",
      condition: (row) => row.recipientTypeDetails !== "SharedMailbox",
    },
    {
      label: "Convert to User Mailbox",
      type: "GET",
      url: "/api/ExecConvertToSharedMailbox",
      icon: <Person />,
      data: {
        ID: "UPN",
        ConvertToUser: true,
      },
      confirmText: "Are you sure you want to convert this mailbox to a user mailbox?",
      condition: (row) => row.recipientTypeDetails !== "UserMailbox",
    },
    {
      label: "Convert to Room Mailbox",
      type: "GET",
      url: "/api/ExecConvertToRoomMailbox",
      icon: <Room />,
      data: {
        ID: "UPN",
      },
      confirmText: "Are you sure you want to convert this mailbox to a room mailbox?",
      condition: (row) => row.recipientTypeDetails !== "RoomMailbox",
    },
    {
      //tested
      label: "Enable Online Archive",
      type: "GET",
      icon: <Archive />,
      url: "/api/ExecEnableArchive",
      data: { ID: "UPN" },
      confirmText: "Are you sure you want to enable the online archive for this user?",
      multiPost: false,
      condition: (row) => row.ArchiveGuid === "00000000-0000-0000-0000-000000000000",
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
        "Are you sure you want to hide this mailbox from the global address list? This will not work if the user is AD Synced.",
      condition: (row) => row.HiddenFromAddressListsEnabled === false,
    },
    {
      label: "Unhide from Global Address List",
      type: "POST",
      url: "/api/ExecHideFromGAL",
      icon: <Visibility />,
      data: {
        ID: "UPN",
      },
      confirmText:
        "Are you sure you want to unhide this mailbox from the global address list? This will not work if the user is AD Synced.",
      condition: (row) => row.HiddenFromAddressListsEnabled === true,
    },
    {
      label: "Start Managed Folder Assistant",
      type: "GET",
      url: "/api/ExecStartManagedFolderAssistant",
      icon: <PlayCircleIcon />,
      data: {
        ID: "UPN",
      },
      confirmText: "Are you sure you want to start the managed folder assistant for this user?",
    },
    {
      label: "Delete Mailbox",
      type: "GET",
      icon: <TrashIcon />, // Added
      url: "/api/RemoveMailbox",
      data: { ID: "UPN" },
      confirmText: "Are you sure you want to delete this mailbox?",
      multiPost: false,
    },
  ];

  // Define off-canvas details
  const offCanvas = {
    extendedInfoFields: ["displayName", "UPN", "AdditionalEmailAddresses", "recipientTypeDetails"],
    actions: actions,
  };

  const filterList = [
    {
      filterName: "View User Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "UserMailbox" }],
      type: "column",
    },
    {
      filterName: "View Shared Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "SharedMailbox" }],
      type: "column",
    },
    {
      filterName: "View Room Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "RoomMailbox" }],
      type: "column",
    },
    {
      filterName: "View Equipment Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "EquipmentMailbox" }],
      type: "column",
    },
  ];

  // Simplified columns for the table
  const simpleColumns = [
    "displayName", // Display Name
    "recipientTypeDetails", // Recipient Type Details
    "UPN", // User Principal Name
    "primarySmtpAddress", // Primary Email Address
    "recipientType", // Recipient Type
    "AdditionalEmailAddresses", // Additional Email Addresses
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListMailboxes"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      filters={filterList}
      cardButton={
        <>
          <Button component={Link} href="/email/administration/mailboxes/addshared">
            Add Shared Mailbox
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
