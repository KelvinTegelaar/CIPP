import { Layout as DashboardLayout } from "../../../layouts/index";
import { CippIcons } from "../../../utils/icon-registry";
import CippTablePage from "../../../components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import { useState } from "react";
import ScheduledTaskDetails from "../../../components/CippComponents/ScheduledTaskDetails";
import { CippScheduledTaskActions } from "../../../components/CippComponents/CippScheduledTaskActions";
import { CippSchedulerDrawer } from "../../../components/CippComponents/CippSchedulerDrawer";
import { CippSchedulerCountdown } from "../../../components/CippComponents/CippSchedulerCountdown";
import { useSettings } from "../../../hooks/use-settings";

const Page = () => {
  const [editTaskId, setEditTaskId] = useState(null);
  const [cloneTaskId, setCloneTaskId] = useState(null);
  const currentTenant = useSettings().currentTenant;

  const drawerHandlers = {
    openEditDrawer: (row) => {
      setEditTaskId(row.RowKey);
    },
    openCloneDrawer: (row) => {
      setCloneTaskId(row.RowKey);
    },
  };

  const actions = CippScheduledTaskActions(drawerHandlers);

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
      <ScheduledTaskDetails data={extendedData} showActions={true} showTitle={false} />
    ),
    size: "xl",
    actions: actions,
  };
  const [showHiddenJobs, setShowHiddenJobs] = useState(false);
  // Hoisted so the countdown can subscribe to exactly the cache entry the table populates,
  // rather than issuing a second request for the same rows.
  const apiUrl = showHiddenJobs
    ? `/api/ListScheduledItems?ShowHidden=true`
    : `/api/ListScheduledItems`;
  const queryKey = showHiddenJobs
    ? `ListScheduledItems-hidden-${currentTenant}`
    : `ListScheduledItems-${currentTenant}`;
  return (
    <>
      <CippTablePage
        cardButton={
          <>
            <Button onClick={() => setShowHiddenJobs((prev) => !prev)}>
              {showHiddenJobs ? "Hide" : "Show"} System Jobs
            </Button>
            <CippSchedulerDrawer buttonText="Add Task" />
          </>
        }
        title="Scheduled Tasks"
        tableFilter={<CippSchedulerCountdown apiUrl={apiUrl} queryKey={queryKey} />}
        apiUrl={apiUrl}
        queryKey={queryKey}
        simpleColumns={[
          "ExecutedTime",
          "TaskState",
          "Tenant",
          "Name",
          "ScheduledTime",
          "Command",
          "Parameters",
          "PostExecution",
          "Reference",
          "PsaTicketId",
          "Recurrence",
          "Results",
        ]}
        actions={actions}
        offCanvas={offCanvas}
        rowOpen={{
          link: '/cipp/scheduler/task?id=[RowKey]',
          condition: (row) => Boolean(row?.RowKey),
        }}
        filters={filterList}
      />

      {/* Edit Drawer */}
      {editTaskId && (
        <CippSchedulerDrawer
          key={`edit-${editTaskId}`}
          taskId={editTaskId}
          onSuccess={() => setEditTaskId(null)}
          onClose={() => setEditTaskId(null)}
          PermissionButton={({ children }) => <>{children}</>}
        />
      )}

      {/* Clone Drawer */}
      {cloneTaskId && (
        <CippSchedulerDrawer
          key={`clone-${cloneTaskId}`}
          taskId={cloneTaskId}
          cloneMode={true}
          onSuccess={() => setCloneTaskId(null)}
          onClose={() => setCloneTaskId(null)}
          PermissionButton={({ children }) => <>{children}</>}
        />
      )}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
