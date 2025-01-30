import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Transport Rule Templates";

  const actions = [
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveTransportRuleTemplate",
      data: { ID: "GUID" },
      confirmText: "Do you want to delete the template?",
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["name", "comments", "GUID"],
    actions: actions,
  };

  const simpleColumns = ["name", "comments", "GUID"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTransportRulesTemplates"
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
