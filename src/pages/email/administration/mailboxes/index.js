import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import Link from "next/link";
import { Button } from "@mui/material";

const Page = () => {
  const pageTitle = "Mailboxes";

  // Define actions for mailboxes
  const actions = [
    {
      label: "Edit permissions",
      link: "/identity/administration/users/user/exchange?userId=[Id]",
      color: "info",
    },
    {
      label: "Research Compromised Account",
      link: "/identity/administration/users/user/bec?userId=[UPN]",
      color: "info",
    },
    {
      label: "Send MFA Push",
      type: "GET",
      url: "/api/ExecSendPush",
      data: {
        UserEmail: "mail",
      },
      confirmText: "Are you sure you want to send an MFA request?",
    },
    {
      label: "Convert to Shared Mailbox",
      type: "GET",
      url: "/api/ExecConvertToSharedMailbox",
      data: {
        ID: "UPN",
      },
      confirmText: "Are you sure you want to convert this mailbox to a shared mailbox?",
    },
    {
      label: "Convert to Room Mailbox",
      type: "GET",
      url: "/api/ExecConvertToRoomMailbox",
      data: {
        ID: "UPN",
      },
      confirmText: "Are you sure you want to convert this mailbox to a room mailbox?",
    },
    {
      label: "Hide from Global Address List",
      type: "GET",
      url: "/api/ExecHideFromGAL",
      data: {
        ID: "UPN",
        HidefromGAL: true,
      },
      confirmText:
        "Are you sure you want to hide this mailbox from the global address list? This will not work if the user is AD Synced.",
    },
    {
      label: "Unhide from Global Address List",
      type: "GET",
      url: "/api/ExecHideFromGAL",
      data: {
        ID: "UPN",
      },
      confirmText:
        "Are you sure you want to unhide this mailbox from the global address list? This will not work if the user is AD Synced.",
    },
    {
      label: "Start Managed Folder Assistant",
      type: "GET",
      url: "/api/ExecStartManagedFolderAssistant",
      data: {
        ID: "UPN",
      },
      confirmText: "Are you sure you want to start the managed folder assistant for this user?",
    },
  ];

  // Define off-canvas details
  const offCanvas = {
    extendedInfoFields: ["displayName", "UPN", "AdditionalEmailAddresses", "recipientTypeDetails"],
    actions: actions,
  };

  // Simplified columns for the table
  const simpleColumns = [
    "UPN", // User Principal Name
    "displayName", // Display Name
    "primarySmtpAddress", // Primary Email Address
    "recipientType", // Recipient Type
    "recipientTypeDetails", // Recipient Type Details
    "AdditionalEmailAddresses", // Additional Email Addresses
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListMailboxes"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
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
