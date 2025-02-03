import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

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
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      titleButton={{
        label: "Add",
        href: "/email/administration/tenant-allow-block-list/add",
      }}
      cardButton={
        <>
          <Button component={Link} href="/email/administration/tenant-allow-block-lists/add">
            Add Entry
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
