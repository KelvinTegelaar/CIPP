import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippApplicationDeployDrawer } from "../../../../components/CippComponents/CippApplicationDeployDrawer";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { useDialog } from "../../../../hooks/use-dialog";

const Page = () => {
  const pageTitle = "Queued Applications";
  const runQueueDialog = useDialog();

  const actions = [
    {
      label: "Delete Application",
      type: "POST",
      icon: <TrashIcon />,
      url: "/api/RemoveQueuedApp",
      data: { ID: "id" },
      confirmText: "Do you want to delete the queued application?",
      color: "danger",
    },
  ];

  const simpleColumns = ["tenantName", "applicationName", "cmdLine", "assignTo"];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListApplicationQueue"
        actions={actions}
        simpleColumns={simpleColumns}
        tenantInTitle={false}
        cardButton={
          <>
            <Button onClick={runQueueDialog.handleOpen} startIcon={<PlayArrow />}>
              Run Queue now
            </Button>
            <CippApplicationDeployDrawer />
          </>
        }
      />
      <CippApiDialog
        createDialog={runQueueDialog}
        title="Run Application Queue"
        fields={[]}
        api={{
          type: "POST",
          url: "/api/ExecAppUpload",
          relatedQueryKeys: ["ListApplicationQueue"],
          confirmText: "Are you sure you want to run the application queue now? This will process all queued applications."
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
