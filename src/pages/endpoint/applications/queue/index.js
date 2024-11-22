import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CheckmarkIcon } from "react-hot-toast";

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
      //still needs a card button for deploy now + a button to the wizard.
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
