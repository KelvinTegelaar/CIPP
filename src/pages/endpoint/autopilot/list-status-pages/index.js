import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CippAutopilotStatusPageDrawer } from "/src/components/CippComponents/CippAutopilotStatusPageDrawer";

const Page = () => {
  const pageTitle = "Autopilot Status Pages";

  const simpleColumns = [
    "displayName",
    "Description",
    "installProgressTimeoutInMinutes",
    "showInstallationProgress",
    "blockDeviceSetupRetryByUser",
    "allowDeviceResetOnInstallFailure",
    "allowDeviceUseOnInstallFailure",
  ];

  // No actions specified in the original file, so none are included here.

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListAutopilotConfig?type=ESP"
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <CippAutopilotStatusPageDrawer />
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
