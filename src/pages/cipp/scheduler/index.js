import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import Link from "next/link";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import ScheduledTaskDetails from "../../../components/CippComponents/ScheduledTaskDetails";
import { CippScheduledTaskActions } from "../../../components/CippComponents/CippScheduledTaskActions";

const Page = () => {
  const actions = CippScheduledTaskActions();

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
    children: (extendedData) => <ScheduledTaskDetails data={extendedData} showActions={false} />,
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
