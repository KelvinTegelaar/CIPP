import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Connection Filters";

  const actions = [
    {
      label: "Create template based on rule",
      type: "POST",
      url: "/api/AddConnectionfilterTemplate",
      dataFunction: (data) => {
        return { ...data };
      },
      confirmText: "Are you sure you want to create a template based on this rule?",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "DistinguishedName",
      "DirectoryBasedEdgeBlockMode",
      "ExchangeVersion",
      "ExchangeObjectId",
      "OrganizationalUnitRoot",
      "WhenCreated",
      "WhenChanged",
      "Guid",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "Name",
    "IsDefault",
    "IPAllowList",
    "IPBlockList",
    "EnableSafeList",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListConnectionFilter"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button component={Link} href="/email/connectionfilter/list-connectionfilter/add">
            Deploy ConnectionFilter
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
