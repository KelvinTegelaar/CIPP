import { Layout as DashboardLayout } from "../../../layouts/index.js";
import { CippTablePage } from "../../../components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { Refresh } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Extension Sync";

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListExtensionSync"
      apiData={{
        TenantFilter: "TenantFilter", // Added for tenant-specific filtering
      }}
      apiDataKey="Results"
      queryKey="ExtensionSyncReport"
      simpleColumns={[
        "Tenant",
        "SyncType",
        "Name",
        "ScheduledTime",
        "ExecutedTime",
        "RepeatsEvery",
        "Results",
      ]}
      cardButton={
        <Button
          startIcon={<Refresh />}
          onClick={() => {
            /* Developer Note: Implement refresh functionality to refetch data */
          }}
        >
          Refresh
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
