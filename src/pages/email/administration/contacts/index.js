import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Edit, PersonAdd } from "@mui/icons-material";
import { Button } from "@mui/material";
import Link from "next/link";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";

const Page = () => {
  const pageTitle = "Contacts";

  const actions = [
    {
      label: "Edit Contact",
      link: "/email/administration/contacts/edit?id=[id]",
      multiPost: false,
      postEntireRow: true,
      icon: <Edit />,
      color: "warning",
      condition: (row) => !row.onPremisesSyncEnabled,
    },
    {
      label: "Remove Contact",
      type: "POST",
      url: "/api/RemoveContact",
      data: {
        GUID: "id",
      },
      confirmText:
        "Are you sure you want to delete this contact? Remember this will not work if the contact is AD Synced.",
      color: "danger",
      icon: <TrashIcon />,
      condition: (row) => !row.onPremisesSyncEnabled,
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
