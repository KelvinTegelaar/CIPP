import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Defender Status";

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListDefenderState"
      apiData={{
        TenantFilter: "TenantFilter",
      }}
      apiDataKey="Results"
      simpleColumns={[
        "managedDeviceName",
        "malwareProtectionEnabled",
        "realTimeProtectionEnabled",
        "networkInspectionSystemEnabled",
        "managedDeviceHealthState",
        "quickScanOverdue",
        "fullScanOverdue",
        "signatureUpdateOverdue",
        "rebootRequired",
        "attentionRequired",
      ]}
      queryKey="DefenderStateReport"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
