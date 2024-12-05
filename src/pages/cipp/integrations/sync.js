import { Box } from "@mui/system";
import CippPageCard from "../../../components/CippCards/CippPageCard";
import { CippDataTable } from "../../../components/CippTable/CippDataTable";
import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  const simpleColumns = [
    "Tenant",
    "SyncType",
    "Task",
    "ScheduledTime",
    "ExecutedTime",
    "LastRun",
    "RepeatsEvery",
    "Results",
  ];

  return (
    <CippPageCard backButtonTitle="Integrations" title="Integration Sync">
      <Box sx={{ p: 2 }}>
        <CippDataTable
          title="Integration Sync"
          noCard={true}
          simpleColumns={simpleColumns}
          api={{
            url: "/api/ListExtensionSync",
          }}
        />
      </Box>
    </CippPageCard>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
