import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import { PlaylistAdd } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Tenant Allow/Block Lists";

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
      icon: <TrashIcon />,
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
      titleButton={{
        label: "Add",
        href: "/email/administration/tenant-allow-block-list/add",
      }}
      cardButton={
        <>
          <Button
            component={Link}
            href="/email/administration/tenant-allow-block-lists/add"
            startIcon={<PlaylistAdd />}
          >
            Add Entry
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
