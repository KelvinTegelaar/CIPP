import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Mailbox Restores";

  const actions = [
    {
      label: "Show Report",
      modal: true,
      modalType: "codeblock",
      dataKey: "Report",
      color: "info",
    },
    {
      label: "Resume Restore Request",
      type: "POST",
      url: "/api/ExecMailboxRestore",
      data: {
        TenantFilter: "Tenant",
        Identity: "Identity",
        Action: "Resume",
      },
      confirmText: "Are you sure you want to resume this restore request?",
      color: "info",
    },
    {
      label: "Suspend Restore Request",
      type: "POST",
      url: "/api/ExecMailboxRestore",
      data: {
        TenantFilter: "Tenant",
        Identity: "Identity",
        Action: "Suspend",
      },
      confirmText: "Are you sure you want to suspend this restore request?",
      color: "warning",
    },
    {
      label: "Remove Restore Request",
      type: "POST",
      url: "/api/ExecMailboxRestore",
      data: {
        TenantFilter: "Tenant",
        Identity: "Identity",
        Action: "Remove",
      },
      confirmText: "Are you sure you want to remove this restore request?",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "Status",
      "StatusDetail",
      "SyncStage",
      "DataConsistencyScore",
      "EstimatedTransferSize",
      "BytesTransferred",
      "PercentComplete",
      "EstimatedTransferItemCount",
      "ItemsTransferred",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "Name",
    "Status",
    "TargetMailbox",
    "WhenCreated",
    "WhenChanged",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListMailboxRestores"
      apiData={{
        TenantFilter: "Tenant",
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      /* 
      Filters included in the original file:
      { filterName: 'Completed', filter: 'Complex: Status eq Completed' }

      Developer Note: Uncomment and adjust if filters are required in CippTablePage. */
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
