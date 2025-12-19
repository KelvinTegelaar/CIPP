import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import { Delete } from "@mui/icons-material";
import { EyeIcon } from "@heroicons/react/24/outline";
import { CippAddVacationModeDrawer } from "/src/components/CippComponents/CippAddVacationModeDrawer";

const Page = () => {
  const actions = [
    {
      label: "View Task Details",
      link: "/cipp/scheduler/task?id=[RowKey]",
      icon: <EyeIcon />,
    },
    {
      label: "Cancel Vacation Mode",
      type: "POST",
      url: "/api/RemoveScheduledItem",
      data: { ID: "RowKey" },
      confirmText:
        "Are you sure you want to cancel this vacation mode entry? This might mean the user will remain in vacation mode permanently.",
      icon: <Delete />,
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

  return (
    <CippTablePage
      cardButton={
        <>
          <CippAddVacationModeDrawer />
        </>
      }
      title="Vacation Mode"
      apiUrl="/api/ListScheduledItems?SearchTitle=*CA Exclusion Vacation*"
      queryKey="VacationMode"
      tenantInTitle={false}
      actions={actions}
      simpleColumns={[
        "Tenant",
        "Name",
        "Parameters.Member",
        "Reference",
        "TaskState",
        "ScheduledTime",
        "ExecutedTime",
      ]}
      filters={filterList}
      offCanvas={{
        extendedInfoFields: [
          "Name",
          "TaskState",
          "ScheduledTime",
          "Parameters.Member",
          "Reference",
          "Parameters.PolicyId",
          "Tenant",
          "ExecutedTime",
        ],
        actions: actions,
      }}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
