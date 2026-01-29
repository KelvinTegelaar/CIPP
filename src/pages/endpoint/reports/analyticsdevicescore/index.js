import { EyeIcon } from "@heroicons/react/24/outline";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { useSettings } from "../../../../hooks/use-settings";

const Page = () => {
  const pageTitle = "Analytics Device Score Report";
  const tenantFilter = useSettings().currentTenant;

  // Actions from the source file
  const actions = [
    {
      label: "View in Intune",
      link: `https://intune.microsoft.com/${tenantFilter}/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/[id]`,
      color: "info",
      icon: <EyeIcon />,
      target: "_blank",
      multiPost: false,
      external: true,
    },
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
