import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { Book, DoDisturb, Done } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Transport Rules";

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

  const simpleColumns = ["Name", "State", "Mode", "RuleErrorAction", "WhenChanged", "Comments"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTransportRules"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      filters={[
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
      ]}
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
