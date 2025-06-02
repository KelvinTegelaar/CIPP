import { EyeIcon } from "@heroicons/react/24/outline";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { useSettings } from "/src/hooks/use-settings";

const Page = () => {
  const pageTitle = "Work from anywhere Report";
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
        "serialNumber",
        "model",
        "manufacturer",
        "ownership",
        "upgradeEligibility",
    ],
    actions: actions,
  };

  // Columns to be displayed in the table
  const simpleColumns = [
    "deviceName",
    "serialNumber",
    "model",
    "manufacturer",
    "ownership",
    "managedBy",
    "osVersion",
    "upgradeEligibility",
    "ramCheckFailed",
    "storageCheckFailed",
    "processorCoreCountCheckFailed",
    "processorSpeedCheckFailed",
    "tpmCheckFailed",
    "secureBootCheckFailed",
    "processorFamilyCheckFailed",
    "processor64BitCheckFailed",
    "osCheckFailed",
  ];

  // Predefined filters to be applied to the table
  const filterList = [
    {
      filterName: "Upgrade not eligible",
      value: [{ id: "upgradeEligibility", value: "notCapable" }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "deviceManagement/userExperienceAnalyticsWorkFromAnywhereMetrics('allDevices')/metricDevices",
        manualPagination: true,
        $top: 999,
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      filters={filterList}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
