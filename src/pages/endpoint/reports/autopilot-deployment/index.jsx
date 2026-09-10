
import { CippIcons } from "../../../../utils/icon-registry"
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { useSettings } from "../../../../hooks/use-settings";

const Page = () => {
  const pageTitle = "Autopilot Deployments";
  const tenantFilter = useSettings().currentTenant;

  // Actions for viewing device in Intune and deployment details
  const actions = [
    {
      label: "View Device in Intune",
      link: `https://intune.microsoft.com/${tenantFilter}/#view/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/~/overview/mdmDeviceId/[deviceId]`,
      pinned: true,
      color: "info",
      icon: <CippIcons.EyeIcon />,
      target: "_blank",
      multiPost: false,
      external: true,
    },
    {
      label: "View Deployment Details",
      link: `https://intune.microsoft.com/${tenantFilter}/#view/Microsoft_Intune_DeviceSettings/DeploymentOverviewMenuBlade/~/autopilotDeployment/deploymentProfileId/[windowsAutopilotDeploymentProfileDisplayName]`,
      pinned: true,
      color: "info",
      icon: <CippIcons.DocumentTextIcon />,
      target: "_blank",
      multiPost: false,
      external: true,
    },
  ];

  // Extended info fields for the off-canvas panel
  const offCanvas = {
    extendedInfoFields: [
      "id",
      "deviceId",
      "userId",
      "eventDateTime",
      "deviceRegisteredDateTime",
      "enrollmentStartDateTime",
      "enrollmentType",
      "deviceSerialNumber",
      "managedDeviceName",
      "userPrincipalName",
      "windowsAutopilotDeploymentProfileDisplayName",
      "enrollmentState",
      "windows10EnrollmentCompletionPageConfigurationDisplayName",
      "deploymentState",
      "deviceSetupStatus",
      "accountSetupStatus",
      "osVersion",
      "deploymentDuration",
      "deploymentTotalDuration",
      "deviceSetupDuration",
      "accountSetupDuration",
      "deploymentStartDateTime",
      "deploymentEndDateTime",
      "enrollmentFailureDetails",
    ],
    actions: actions,
  };

  // Columns to be displayed in the table (most important first)
  const simpleColumns = [
    "managedDeviceName",
    "eventDateTime",
    "deviceSerialNumber",
    "userPrincipalName",
    "deploymentState",
    "enrollmentState",
    "enrollmentType",
    "deploymentTotalDuration",
    "windowsAutopilotDeploymentProfileDisplayName",
    "enrollmentFailureDetails",
  ];

  // Predefined filters for common deployment scenarios
  const filterList = [
    {
      filterName: "Failed Deployments",
      value: [{ id: "deploymentState", value: "failure" }],
      type: "column",
    },
    {
      filterName: "Successful Deployments",
      value: [{ id: "deploymentState", value: "success" }],
      type: "column",
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        endpoint: "deviceManagement/autopilotEvents",
        $orderBy: "enrollmentStartDateTime desc",
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
