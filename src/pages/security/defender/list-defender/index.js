import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Defender Status";

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListDefenderState"
      simpleColumns={[
        "deviceName",
        "windowsProtectionState.malwareProtectionEnabled",
        "windowsProtectionState.realTimeProtectionEnabled",
        "windowsProtectionState.networkInspectionSystemEnabled",
        "windowsProtectionState.deviceState",
        "windowsProtectionState.quickScanOverdue",
        "windowsProtectionState.fullScanOverdue",
        "windowsProtectionState.signatureUpdateOverdue",
        "windowsProtectionState.rebootRequired",
        "windowsProtectionState.lastReportedDateTime",
      ]}
      queryKey="DefenderStateReport"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
