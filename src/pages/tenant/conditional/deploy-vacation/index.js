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
        "TaskState",
        "ScheduledTime",
        "ExecutedTime",
      ]}
      offCanvas={{
        extendedInfoFields: [
          "Name",
          "TaskState",
          "ScheduledTime",
          "Parameters.Member",
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
