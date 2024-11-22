import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Edit } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Contacts";

  const actions = [
    {
      label: "Remove Contact",
      type: "POST",
      url: "/api/RemoveContact",
      data: {
        TenantFilter: "Tenant",
        GUID: "id",
      },
      confirmText: "Are you sure you want to delete this contact?",
      color: "danger",
    },
    {
      label: "Edit Contact",
      link: "/email/administration/edit-contact/[id]",
      multiPost: false,
      icon: <Edit />,
      color: "warning",
    },
  ];


  const simpleColumns = ["displayName", "mail", "companyName", "onPremisesSyncEnabled"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListContacts"
      actions={actions}
      simpleColumns={simpleColumns}
      titleButton={{
        label: "Add Contact",
        href: "/email/administration/add-contact",
      }}
      /* Developer Note:
      Bulk removal is available in actionsList with "Remove selected Contacts."
      Uncomment if needed when `CippTablePage` bulk actions support is confirmed. */
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
