import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Delete } from "@mui/icons-material";
import { CippAddTenantAllowBlockListDrawer } from "../../../../components/CippComponents/CippAddTenantAllowBlockListDrawer.jsx";

const Page = () => {
  const pageTitle = "Tenant Allow/Block Lists";
  const cardButtonPermissions = ["Exchange.SpamFilter.ReadWrite"];

  const actions = [
    {
      label: "Remove",
      type: "POST",
      url: "/api/RemoveTenantAllowBlockList",
      data: {
        Entries: "Value",
        ListType: "ListType",
      },
      confirmText: "Are you sure you want to delete this entry?",
      color: "danger",
      icon: <Delete />,
    },
  ];

  const simpleColumns = [
    "Value",
    "ListType",
    "Action",
    "Notes",
    "LastUsedDate",
    "LastModifiedDateTime",
    "ExpirationDate",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTenantAllowBlockList"
      actions={actions}
      simpleColumns={simpleColumns}
      apiDataKey="Results"
      cardButton={<CippAddTenantAllowBlockListDrawer requiredPermissions={cardButtonPermissions} />}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
