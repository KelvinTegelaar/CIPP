import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Edit, PersonAdd } from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';

const Page = () => {
  const pageTitle = "Contacts";

  const actions = [
    {
      label: "Remove Contact",
      type: "GET",
      url: "/api/RemoveContact",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to delete this contact?",
      color: "danger",
      icon: <TrashIcon />,
    },
    /* TODO: Implement edit contact
    {
      label: "Edit Contact",
      link: "/email/administration/edit-contact/[id]",
      multiPost: false,
      icon: <Edit />,
      color: "warning",
    },*/
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
          <Button
            component={Link}
            href="/email/administration/contacts/add"
            startIcon={<PersonAdd />}
          >
            Add contact
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
