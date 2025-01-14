import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { useRouter } from "next/router";
import { useSettings } from "/src/hooks/use-settings";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const userSettingsDefaults = useSettings();
  const router = useRouter();
  const { roomAddress } = router.query;
  const pageTitle = `Rooms included in ${roomAddress}`;

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl= "/api/ListGraphRequest"
      apiData={{
        Endpoint: `/places/${roomAddress}/microsoft.graph.roomlist/rooms`,
        tenantFilter: userSettingsDefaults.currentTenant,
        AsApp: true,
        manualPagination: true,
        $count: true,
        $top: 999,
      }}
      apiDataKey="Results"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
