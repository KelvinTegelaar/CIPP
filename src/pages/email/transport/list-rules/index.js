import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Book, DoDisturb, Done } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippAddTransportRuleDrawer } from "../../../../components/CippComponents/CippAddTransportRuleDrawer";
import { Button } from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Transport Rules";
  const cardButtonPermissions = ["Exchange.TransportRule.ReadWrite"];

  const actions = [
    {
      label: "Create template based on rule",
      type: "POST",
      url: "/api/AddTransportTemplate",
      postEntireRow: true,
      confirmText: "Are you sure you want to create a template based on this rule?",
      icon: <Book />,
    },
    {
      label: "Enable Rule",
      type: "POST",
      url: "/api/EditTransportRule",
      data: {
        State: "!Enable",
        GUID: "Guid",
      },
      confirmText: "Are you sure you want to enable this rule?",
      icon: <Done />,
    },
    {
      label: "Disable Rule",
      type: "POST",
      url: "/api/EditTransportRule",
      data: {
        State: "!Disable",
        GUID: "Guid",
      },
      confirmText: "Are you sure you want to disable this rule?",
      icon: <DoDisturb />,
    },
    {
      label: "Delete Rule",
      type: "POST",
      url: "/api/RemoveTransportRule",
      data: {
        GUID: "Guid",
      },
      confirmText: "Are you sure you want to delete this rule?",
      color: "danger",
      icon: <TrashIcon />,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "Guid",
      "CreatedBy",
      "LastModifiedBy",
      "WhenChanged",
      "Name",
      "Comments",
      "Description",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "Name",
    "State",
    "Mode",
    "RuleErrorAction",
    "WhenChanged",
    "Comments",
    "Tenant",
  ];

  const filters = [
    {
      filterName: "Enabled Rules",
      value: [{ id: "State", value: "Enabled" }],
      type: "column",
    },
    {
      filterName: "Disabled Rules",
      value: [{ id: "State", value: "Disabled" }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTransportRules"
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      filters={filters}
      cardButton={
        <>
          <CippAddTransportRuleDrawer requiredPermissions={cardButtonPermissions} />
          <Button
            component={Link}
            href="/email/transport/new-rules/add"
            startIcon={<RocketLaunch />}
          >
            New Transport Rule
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;
export default Page;
