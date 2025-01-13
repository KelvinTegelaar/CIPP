import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Software Vulnerabilities Status";

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListDefenderTVM"
      simpleColumns={[
        "affectedDevicesCount",
        "affectedDevices",
        "osPlatform",
        "softwareVendor",
        "softwareName",
        "vulnerabilitySeverityLevel",
        "cvssScore",
        "securityUpdateAvailable",
        "exploitabilityLevel",
        "cveId",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
