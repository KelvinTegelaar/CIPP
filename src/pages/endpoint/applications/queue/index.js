import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CheckmarkIcon } from "react-hot-toast";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Queued Applications";

  const actions = [
    {
      label: "Deploy now",
      type: "POST",
      url: "/api/ExecAppUpload",
      confirmText:
        "Deploy all queued applications to tenants?\n\nNote: This job runs automatically every 12 hours.",
      multiPost: false,
    },
    {
      label: "Delete Application",
      type: "POST",
      url: "/api/RemoveQueuedApp",
      data: { ID: "id" },
      confirmText: "Do you want to delete the queued application?",
      color: "danger",
    },
  ];

  const simpleColumns = ["tenantName", "applicationName", "cmdLine", "assignTo"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListApplicationQueue"
      actions={actions}
      simpleColumns={simpleColumns}
      tenantInTitle={false}
      cardButton={
        <>
          <Button component={Link} href="/endpoint/applications/list/add">
            Add Application
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
