import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Room Lists";

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListRoomLists"
      apiData={{
        TenantFilter: "TenantFilter", // Added for tenant-specific filtering
      }}
      apiDataKey="Results"
      queryKey="RoomListsReport"
      simpleColumns={[
        "displayName",
        "geoCoordinates",
        "placeId",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
