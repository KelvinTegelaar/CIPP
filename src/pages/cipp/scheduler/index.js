import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import Link from "next/link";
import { CalendarDaysIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { CopyAll, Edit, PlayArrow } from "@mui/icons-material";
import ScheduledTaskDetails from "../../../components/CippComponents/ScheduledTaskDetails";

const Page = () => {
  const actions = [
    {
      label: "View Task Details",
      link: "/cipp/scheduler/task?id=[RowKey]",
      icon: <EyeIcon />,
    },
    {
      label: "Run Now",
      type: "POST",
      url: "/api/AddScheduledItem",
      data: { RowKey: "RowKey", RunNow: true },
      icon: <PlayArrow />,
      confirmText: "Are you sure you want to run [Name]?",
      allowResubmit: true,
    },
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
    children: (extendedData) => <ScheduledTaskDetails data={extendedData} />,
    size: "xl",
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
