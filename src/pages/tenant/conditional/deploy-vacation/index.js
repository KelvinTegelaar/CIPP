import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import { EventAvailable } from "@mui/icons-material";
import Link from "next/link";
import { Delete } from "@mui/icons-material";

const Page = () => {
  const actions = [
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
        "Name",
        "TaskState",
        "ScheduledTime",
        "Parameters.ExclusionType",
        "Parameters.UserName",
        "Parameters.PolicyId",
      ]}
      offCanvas={{
        extendedInfoFields: [
          "Name",
          "TaskState",
          "ScheduledTime",
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
