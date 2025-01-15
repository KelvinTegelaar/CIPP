import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Edit } from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";

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
      cardButton={
        <>
          <Button component={Link} href="/email/administration/contacts/add">
            Add contact
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
