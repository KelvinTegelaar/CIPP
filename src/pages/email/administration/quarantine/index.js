import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Quarantine Management";

  const actions = [
    {
      label: "Release",
      type: "POST",
      url: "/api/ExecQuarantineManagement",
      data: {
        TenantFilter: "TenantFilter",
        ID: "id",
        Type: "Release",
      },
      confirmText: "Are you sure you want to release this message?",
    },
    {
      label: "Deny",
      type: "POST",
      url: "/api/ExecQuarantineManagement",
      data: {
        TenantFilter: "TenantFilter",
        ID: "id",
        Type: "Deny",
      },
      confirmText: "Are you sure you want to deny this message?",
    },
    {
      label: "Release & Allow Sender",
      type: "POST",
      url: "/api/ExecQuarantineManagement",
      data: {
        TenantFilter: "TenantFilter",
        ID: "id",
        Type: "Release",
        AllowSender: true,
      },
      confirmText:
        "Are you sure you want to release this email and add the sender to the whitelist?",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["MessageId", "RecipientAddress", "Type"],
    actions: actions,
  };

  const simpleColumns = [
    "SenderAddress",
    "RecipientAddress",
    "Subject",
    "Type",
    "ReceivedTime",
    "ReleaseStatus",
    "PolicyName",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListMailQuarantine"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
