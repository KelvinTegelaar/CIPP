import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import { Button } from "@mui/material";
import { EventAvailable } from "@mui/icons-material";
import Link from "next/link";

const Page = () => {
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
      simpleColumns={[
        "Name",
        "TaskState",
        "ScheduledTime",
        "Parameters.ExclusionType",
        "Parameters.UserName",
        "Parameters.PolicyId",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
