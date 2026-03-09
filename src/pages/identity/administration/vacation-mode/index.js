import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippTablePage from "../../../../components/CippComponents/CippTablePage";
import { Delete } from "@mui/icons-material";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Button } from "@mui/material";
import Link from "next/link";
import { EventAvailable } from "@mui/icons-material";

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
    {
      filterName: "CA Exclusion",
      value: [{ id: "Name", value: "CA Exclusion" }],
      type: "column",
    },
    {
      filterName: "Mailbox Permissions",
      value: [{ id: "Name", value: "Mailbox Vacation" }],
      type: "column",
    },
    {
      filterName: "Out of Office",
      value: [{ id: "Name", value: "OOO Vacation" }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      cardButton={
        <Button
          component={Link}
          href="/identity/administration/vacation-mode/add"
          startIcon={<EventAvailable />}
        >
          Add Vacation Schedule
        </Button>
      }
      title="Vacation Mode"
      apiUrl="/api/ListScheduledItems?SearchTitle=*Vacation*"
      queryKey="VacationMode"
      tenantInTitle={false}
      actions={actions}
      simpleColumns={[
        "Tenant",
        "Name",
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
          "Reference",
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
