import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Mailboxes";

  // Define actions for mailboxes
  const actions = [
    {
      label: "Edit Calendar permissions",
      link: "/email/administration/edit-calendar-permissions?userId=[UPN]&tenantDomain=[TenantFilter]",
      color: "info",
    },
    {
      label: "Research Compromised Account",
      link: "/identity/administration/ViewBec?userId=[UPN]&tenantDomain=[TenantFilter]",
      color: "info",
    },
    {
      label: "Send MFA Push",
      type: "POST",
      url: "/api/ExecSendPush",
      data: {
        TenantFilter: "TenantFilter",
        UserEmail: "[UPN]",
      },
      confirmText: "Are you sure you want to send an MFA request?",
    },
    {
      label: "Convert to Shared Mailbox",
      type: "POST",
      url: "/api/ExecConvertToSharedMailbox",
      data: {
        TenantFilter: "TenantFilter",
        ID: "[UPN]",
      },
      confirmText: "Are you sure you want to convert this mailbox to a shared mailbox?",
    },
    {
      label: "Convert to Room Mailbox",
      type: "POST",
      url: "/api/ExecConvertToRoomMailbox",
      data: {
        TenantFilter: "TenantFilter",
        ID: "[UPN]",
      },
      confirmText: "Are you sure you want to convert this mailbox to a room mailbox?",
    },
    {
      label: "Hide from Global Address List",
      type: "POST",
      url: "/api/ExecHideFromGAL",
      data: {
        TenantFilter: "TenantFilter",
        ID: "[UPN]",
        HidefromGAL: true,
      },
      confirmText:
        "Are you sure you want to hide this mailbox from the global address list? This will not work if the user is AD Synced.",
    },
    {
      label: "Unhide from Global Address List",
      type: "POST",
      url: "/api/ExecHideFromGAL",
      data: {
        TenantFilter: "TenantFilter",
        ID: "[UPN]",
      },
      confirmText:
        "Are you sure you want to unhide this mailbox from the global address list? This will not work if the user is AD Synced.",
    },
    {
      label: "Start Managed Folder Assistant",
      type: "POST",
      url: "/api/ExecStartManagedFolderAssistant",
      data: {
        TenantFilter: "TenantFilter",
        ID: "[UPN]",
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
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
