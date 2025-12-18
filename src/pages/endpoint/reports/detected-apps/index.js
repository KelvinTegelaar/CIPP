import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Discovered Apps";

  // Columns to be displayed in the table
  const simpleColumns = [
    "displayName",
    "version",
    "deviceCount",
    "platform",
    "publisher",
    "sizeInByte",
  ];

  // Predefined filters
  const filterList = [
    {
      filterName: "Windows Apps",
      value: [{ id: "platform", value: "windows" }],
      type: "column",
    },
    {
      filterName: "macOS Apps",
      value: [{ id: "platform", value: "macOS" }],
      type: "column",
    },
    {
      filterName: "iOS Apps",
      value: [{ id: "platform", value: "ios" }],
      type: "column",
    },
    {
      filterName: "Android Apps",
      value: [{ id: "platform", value: "android" }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        endpoint: "deviceManagement/detectedApps",
        manualPagination: true,
        $orderBy: "displayName",
      }}
      apiDataKey="Results"
      simpleColumns={simpleColumns}
      filters={filterList}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
