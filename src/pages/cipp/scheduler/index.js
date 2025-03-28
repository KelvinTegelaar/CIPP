import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import { Button, Typography } from "@mui/material";
import Link from "next/link";
import { CalendarDaysIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { CopyAll, Edit } from "@mui/icons-material";
import { CippCodeBlock } from "../../../components/CippComponents/CippCodeBlock";

const Page = () => {
  const actions = [
    {
      label: "Edit Job",
      link: "/cipp/scheduler/job?id=[RowKey]",
      multiPost: false,
      icon: <Edit />,
      color: "success",
    },
    {
      label: "Clone and Edit Job",
      link: "/cipp/scheduler/job?id=[RowKey]&Clone=True",
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

  const filterList = [
    {
      filterName: "Running",
      value: [{ id: "TaskState", value: "Running" }],
      type: "column",
    },
    {
      filterName: "Planned",
      value: [{ id: "TaskState", value: "Planned" }],
      type: "column",
    },
    {
      filterName: "Failed",
      value: [{ id: "TaskState", value: "Failed" }],
      type: "column",
    },
    {
      filterName: "Completed",
      value: [{ id: "TaskState", value: "Completed" }],
      type: "column",
    },
  ];

  const offCanvas = {
    children: (extendedData) => (
      <>
        <Typography variant="h6">Job Results</Typography>
        <CippCodeBlock type="editor" code={extendedData.Results} />
      </>
    ),
    actions: actions,
  };
  const [showHiddenJobs, setShowHiddenJobs] = useState(false);
  return (
    <CippTablePage
      cardButton={
        <>
          <Button onClick={() => setShowHiddenJobs((prev) => !prev)}>
            {showHiddenJobs ? "Hide" : "Show"} System Jobs
          </Button>
          <Button startIcon={<CalendarDaysIcon />} component={Link} href="/cipp/scheduler/job">
            Add Job
          </Button>
        </>
      }
      tenantInTitle={false}
      title="Scheduled Tasks"
      apiUrl={
        showHiddenJobs ? "/api/ListScheduledItems?ShowHidden=true" : "/api/ListScheduledItems"
      }
      queryKey={showHiddenJobs ? `ListScheduledItems-hidden` : `ListScheduledItems`}
      simpleColumns={[
        "ExecutedTime",
        "TaskState",
        "Tenant",
        "Name",
        "ScheduledTime",
        "Command",
        "Parameters",
        "PostExecution",
        "Recurrence",
        "Results",
      ]}
      actions={actions}
      offCanvas={offCanvas}
      filters={filterList}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
