import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import Link from "next/link";

const Page = () => {
  const pageTitle = "Standard Templates";
  const actions = [
    {
      label: "Edit Template",
      type: "POST",
      url: "/api/ExecGetRecoveryKey",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "ID",
      },
      confirmText: "Are you sure you want to retrieve the Bitlocker keys?",
      multiPost: false,
    },
    {
      label: "Clone Template",
      type: "POST",
      url: "/api/ExecGetRecoveryKey",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "ID",
      },
      confirmText: "Are you sure you want to retrieve the Bitlocker keys?",
      multiPost: false,
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/ExecDeviceDelete",
      data: {
        TenantFilter: "TenantFilter",
        ID: "ID",
        Action: "Delete",
      },
      confirmText: "Are you sure you want to delete this device?",
      multiPost: false,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "devices",
        $format: "application/json",
        $count: true,
      }}
      cardButton={
        <Button component={Link} href="add-template">
          Add Template
        </Button>
      }
      apiDataKey="Results"
      actions={actions}
      simpleColumns={["templateName", "templateDescription", "Tenants", "includedStandards"]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
