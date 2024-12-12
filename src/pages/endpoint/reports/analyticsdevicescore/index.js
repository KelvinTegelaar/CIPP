import { EyeIcon } from "@heroicons/react/24/outline";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Analytics Device Score Report";

  // Actions from the source file
  const actions = [
    /* TODO: Add direct link to InTune Device
    {
      label: "View Device",
      type: "LINK",
      link: "https://intune.microsoft.com/[tenant]/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/[id]",
      linkParams: {
        tenant: "TenantFilter",
        id: "id",
      },
      icon: <EyeIcon />,
    },*/
  ];

  // OffCanvas details based on the source file
  const offCanvas = {
    extendedInfoFields: [
        "id",
        "deviceName",
        "model",
        "manufacturer",
        "endpointAnalyticsScore",
        "startupPerformanceScore",
        "appReliabilityScore",
        "workFromAnywhereScore",
        "meanResourceSpikeTimeScore",
        "batteryHealthScore",
        "healthStatus",
    ],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "deviceManagement/userExperienceAnalyticsDeviceScores",
        manualPagination: true,
        $top: 999,
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "deviceName",
        "model",
        "manufacturer",
        "endpointAnalyticsScore",
        "startupPerformanceScore",
        "appReliabilityScore",
        "workFromAnywhereScore",
        "meanResourceSpikeTimeScore",
        "batteryHealthScore",
        "healthStatus",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
