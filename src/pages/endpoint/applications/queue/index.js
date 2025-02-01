import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CheckmarkIcon } from "react-hot-toast";
import { Button } from "@mui/material";
import { PlayArrow, Add } from "@mui/icons-material";
import Link from "next/link";
import { ApiPostCall } from "../../../../api/ApiCall";
import { CippApiResults } from "../../../../components/CippComponents/CippApiResults";
import { TrashIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Queued Applications";

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
  const handlePostCall = ApiPostCall({
    urlFromdata: true,
    relatedQueryKeys: "ListApplicationQueue",
  });
  const simpleColumns = ["tenantName", "applicationName", "cmdLine", "assignTo"];
  const handleRunQueue = () => {
    handlePostCall.mutate({ url: "/api/ExecAppUpload" });
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListApplicationQueue"
      actions={actions}
      tableFilter={<CippApiResults apiObject={handlePostCall} />}
      simpleColumns={simpleColumns}
      tenantInTitle={false}
      cardButton={
        <>
          <Button onClick={() => handleRunQueue()} startIcon={<PlayArrow />}>
            Run Queue now
          </Button>

          <Button component={Link} href="/endpoint/applications/list/add" startIcon={<Add />}>
            Add Application
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
