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
      /* 
      Uncomment and configure filters functionality once implemented in CippTablePage:
      filters={[
        { label: "# Affected Devices", filter: '"affectedDevicesCount":1' },
        { label: "Windows 10 devices", filter: '"osPlatform":"Windows10"' },
        { label: "Windows 11 devices", filter: '"osPlatform":"Windows11"' },
        { label: "Vendor is Microsoft", filter: '"softwareVendor":"Microsoft"' },
        { label: "High Severity", filter: '"vulnerabilitySeverityLevel":"High"' },
      ]}
      */
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
