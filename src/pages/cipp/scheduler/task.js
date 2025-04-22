import { useRouter } from "next/router";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import ScheduledTaskDetails from "../../../components/CippComponents/ScheduledTaskDetails";
import CippPageCard from "../../../components/CippCards/CippPageCard";
import { CardContent, CardHeader } from "@mui/material";

const Page = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <CippPageCard title="Scheduled Task Details" backButtonTitle="Back to Scheduled Tasks">
      <CardContent>
        <ScheduledTaskDetails data={{ RowKey: id }} />
      </CardContent>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
