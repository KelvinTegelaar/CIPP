import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Transport Rules";

  const actions = [
    {
      label: "Create template based on rule",
      type: "POST",
      url: "/api/AddTransportTemplate",
      data: {}, // No extra data was specified for this action in the original file
      confirmText: "Are you sure you want to create a template based on this rule?",
    },
    {
      label: "Enable Rule",
      type: "POST",
      url: "/api/EditTransportRule",
      data: {
        State: "Enable",
        TenantFilter: "Tenant",
        GUID: "Guid",
      },
      confirmText: "Are you sure you want to enable this rule?",
    },
    {
      label: "Disable Rule",
      type: "POST",
      url: "/api/EditTransportRule",
      data: {
        State: "Disable",
        TenantFilter: "Tenant",
        GUID: "Guid",
      },
      confirmText: "Are you sure you want to disable this rule?",
    },
    {
      label: "Delete Rule",
      type: "POST",
      url: "/api/RemoveTransportRule",
      data: {
        TenantFilter: "Tenant",
        GUID: "Guid",
      },
      confirmText: "Are you sure you want to delete this rule?",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["CreatedBy", "LastModifiedBy", "Description"],
    actions: actions,
  };

  const simpleColumns = ["Name", "State", "Mode", "RuleErrorAction"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTransportRules"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button component={Link} href="/email/transport/list-rules/add">
            Deploy Template
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
