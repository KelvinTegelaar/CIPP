import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Tenant Allow/Block Lists";

  const actions = [
    {
      label: "Remove",
      type: "POST",
      url: "/api/RemoveTenantAllowBlockList",
      data: {
        TenantFilter: "Tenant",
        Entries: "Value",
        ListType: "ListType",
      },
      confirmText: "Are you sure you want to delete?",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["Value", "Notes", "ExpirationDate"],
    actions: actions,
  };

  const simpleColumns = [
    "Value",
    "ListType",
    "Action",
    "Notes",
    "LastModifiedDateTime",
    "ExpirationDate",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTenantAllowBlockList"
      apiData={{
        TenantFilter: "Tenant",
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      titleButton={{
        label: "New Entry",
        href: "/email/administration/add-tenant-allow-block-list",
      }}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
