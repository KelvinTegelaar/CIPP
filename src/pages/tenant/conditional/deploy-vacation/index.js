import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import { EventAvailable } from "@mui/icons-material";
import Link from "next/link";
import { Delete } from "@mui/icons-material";
import { EyeIcon } from "@heroicons/react/24/outline";

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
          <Button component={Link} href="deploy-vacation/add" startIcon={<EventAvailable />}>
            Add Vacation Schedule
          </Button>
        </>
      }
      title="Vacation Mode"
      apiUrl="/api/ListScheduledItems?Type=Set-CIPPCAExclusion"
      queryKey="VacationMode"
      tenantInTitle={false}
      actions={actions}
      simpleColumns={[
        "Tenant",
        "Name",
        "TaskState",
        "ScheduledTime",
        "ExecutedTime",
        "Parameters.ExclusionType",
        "Parameters.Users",
        "Parameters.UserName",
      ]}
      offCanvas={{
        extendedInfoFields: [
          "Name",
          "TaskState",
          "ScheduledTime",
          "Parameters.Users",
          "Parameters.UserName",
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
