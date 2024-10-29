import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Lighthouse - Device Compliance";

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListAllTenantDeviceCompliance"
      apiData={{
        TenantFilter: "TenantFilter",
      }}
      apiDataKey="Results"
      simpleColumns={[
        "tenantDisplayName",
        "managedDeviceName",
        "complianceStatus",
        "ownerType",
        "osDescription",
        "manufacturer",
        "model",
        "lastSyncDateTime",
      ]}
      queryKey="LighthouseDeviceComplianceReport"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
