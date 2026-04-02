import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippWizardConfirmation } from "../../../../components/CippWizard/CippWizardConfirmation";
import CippWizardPage from "../../../../components/CippWizard/CippWizardPage.jsx";
import { CippTenantStep } from "../../../../components/CippWizard/CippTenantStep.jsx";
import { CippWizardAutoComplete } from "../../../../components/CippWizard/CippWizardAutoComplete";
import { CippWizardOffboarding } from "../../../../components/CippWizard/CippWizardOffboarding";
import { useSettings } from "../../../../hooks/use-settings";
import CippTablePage from "../../../../components/CippComponents/CippTablePage";
import { PersonOff } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useState } from "react";
import ScheduledTaskDetails from "../../../../components/CippComponents/ScheduledTaskDetails";
import { CippScheduledTaskActions } from "../../../../components/CippComponents/CippScheduledTaskActions";
import { CippSchedulerDrawer } from "../../../../components/CippComponents/CippSchedulerDrawer";

const Page = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [cloneTaskId, setCloneTaskId] = useState(null);
  const initialState = useSettings();
  const currentTenant = initialState.currentTenant;

  const drawerHandlers = {
    openEditDrawer: (row) => setEditTaskId(row.RowKey),
    openCloneDrawer: (row) => setCloneTaskId(row.RowKey),
  };

  const actions = CippScheduledTaskActions(drawerHandlers, {
    hideActions: ["Edit Job", "Clone Job"],
  });

  const steps = [
    {
      title: "Step 1",
      description: "Tenant Selection",
      component: CippTenantStep,
      componentProps: {
        allTenants: false,
        type: "single",
        includeOffboardingDefaults: true,
      },
    },
    {
      title: "Step 2",
      description: "User Selection",
      component: CippWizardAutoComplete,
      componentProps: {
        title: "Select the users to offboard",
        name: "user",
        placeholder: "Select User",
        type: "multiple",
        api: {
          url: "/api/ListGraphRequest",
          dataKey: "Results",
          queryKey: "Users - {tenant}",
          data: {
            Endpoint: "users",
            manualPagination: true,
            $select: "id,userPrincipalName,displayName",
            $count: true,
            $orderby: "displayName",
            $top: 999,
          },
          labelField: (option) => `${option.displayName} (${option.userPrincipalName})`,
          valueField: "userPrincipalName",
        },
      },
    },
    {
      title: "Step 3",
      description: "Offboarding Options",
      component: CippWizardOffboarding,
    },
    {
      title: "Step 4",
      description: "Confirmation",
      component: CippWizardConfirmation,
      maxWidth: "lg",
      componentProps: {
        columns: 3,
      },
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
      <ScheduledTaskDetails data={extendedData} showActions={true} showTitle={false} />
    ),
    size: "xl",
    actions: actions,
  };

  return (
    <>
      <CippTablePage
        cardButton={
          <Button onClick={() => setWizardOpen(true)} startIcon={<PersonOff />}>
            Start Offboarding
          </Button>
        }
        title="User Offboarding"
        apiUrl="/api/ListScheduledItems?Type=Invoke-CIPPOffboardingJob&"
        queryKey={`OffboardingJobs-${currentTenant}`}
        actions={actions}
        simpleColumns={[
          "Tenant",
          "Parameters.Username",
          "TaskState",
          "ScheduledTime",
          "ExecutedTime",
        ]}
        filters={filterList}
        offCanvas={offCanvas}
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
      <CippWizardPage
        dialogMode={true}
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        dialogIcon={<PersonOff />}
        relatedQueryKeys={[`OffboardingJobs-${currentTenant}`]}
        initialState={{
          ...initialState.offboardingDefaults,
          ...{ Scheduled: { enabled: false } },
        }}
        steps={steps}
        postUrl="/api/ExecOffboardUser"
        wizardTitle="User Offboarding Wizard"
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
