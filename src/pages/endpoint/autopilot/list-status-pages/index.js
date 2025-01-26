import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

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
          <Button component={Link} href="/endpoint/autopilot/list-status-pages/add">
            Add Status Page
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
