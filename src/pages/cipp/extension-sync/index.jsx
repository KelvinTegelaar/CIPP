import { Layout as DashboardLayout } from "../../../layouts/index";
import { CippIcons } from "../../../utils/icon-registry"
import { CippTablePage } from "../../../components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";

const Page = () => {
  const pageTitle = "Extension Sync";

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListExtensionSync"
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
          startIcon={<CippIcons.Refresh />}
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

Page.getLayout = (page) => <DashboardLayout tenantGroupSupport={true}>{page}</DashboardLayout>;

export default Page;
