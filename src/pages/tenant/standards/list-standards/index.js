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
      url: "/api/RemoveStandardTemplate",
      data: {
        ID: "GUID",
      },
      confirmText: "Are you sure you want to delete this template?",
      multiPost: false,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/listStandardTemplates"
      cardButton={
        <Button component={Link} href="template">
          Add Template
        </Button>
      }
      actions={actions}
      simpleColumns={["templateName", "tenantFilter", "excludedTenants", "standards"]}
      queryKey="listStandardTemplates"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
