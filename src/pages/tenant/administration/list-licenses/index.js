import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Licenses Report";
  const apiUrl = "/api/ListLicenses";

  const actions = []; // No actions specified, setting to empty array

  const offCanvas = null; // No off-canvas details provided

  const simpleColumns = [
    "Tenant",
    "License",
    "CountUsed",
    "CountAvailable",
    "TotalLicenses",
    "TermInfo",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
