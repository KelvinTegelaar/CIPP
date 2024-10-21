import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import Link from "next/link";
import { CalendarDaysIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { CopyAll, Edit } from "@mui/icons-material";

//show hidden jobs will also create a banner with "These might be system jobs. Do not touch, unless you know what you are doing. or something"

const Page = () => {
  const actions = [
    {
      label: "View Results",
      link: "/cipp/scheduler/job?ID=[id]",
      multiPost: false,
      icon: <EyeIcon />,
      color: "success",
    },
    {
      label: "Edit Job",
      link: "/cipp/scheduler/job?ID=[id]",
      multiPost: false,
      icon: <Edit />,
      color: "success",
    },
    {
      label: "Clone and Edit Job",
      link: "/cipp/scheduler/job?ID=[id]&Clone=True",
      multiPost: false,
      icon: <CopyAll />,
      color: "success",
    },
    {
      label: "Delete Job",
      icon: <TrashIcon />,
      type: "POST",
      url: "/api/RemoveScheduledItem",
      data: { id: "RowKey" },
      confirmText: "Are you sure you want to delete this job?",
      multiPost: false,
    },
  ];

  const [showHiddenJobs, setShowHiddenJobs] = useState(false);
  return (
    <CippTablePage
      cardButton={
        <>
          <Button onClick={() => setShowHiddenJobs((prev) => !prev)}>
            {showHiddenJobs ? "Hide" : "Show"} Hidden Jobs
          </Button>
          <Button startIcon={<CalendarDaysIcon />} component={Link} href="/cipp/scheduler/job">
            Add Job
          </Button>
        </>
      }
      title="Scheduled Tasks"
      apiUrl={
        showHiddenJobs ? "/api/ListScheduledItems?ListHidden=True" : "/api/ListScheduledItems"
      }
      queryKey={`ListScheduledItems-${showHiddenJobs}`}
      simpleColumns={[
        "Name",
        "Tenant",
        "TaskState",
        "Command",
        "Parameters",
        "PostExecution",
        "Recurrence",
        "ExecutedTime",
        "ScheduledTime",
      ]}
      actions={actions}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
