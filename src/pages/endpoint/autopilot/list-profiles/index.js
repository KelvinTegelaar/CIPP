import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Delete } from "@mui/icons-material";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { CippAutopilotProfileDrawer } from "../../../../components/CippComponents/CippAutopilotProfileDrawer";

const Page = () => {
  const pageTitle = "Autopilot Profiles";

  const actions = [
    {
      label: "Delete Profile",
      icon: <Delete />,
      type: "POST",
      url: "/api/RemoveAutopilotConfig",
      data: { ID: "id", displayName: "displayName", assignments: "assignments" },
      confirmText:
        "Are you sure you want to delete this Autopilot profile? This action cannot be undone.",
      color: "danger",
    },
  ];

  const offCanvas = {
    children: (row) => <CippJsonView object={row} type="intune" defaultOpen={true} />,
    size: "xl",
  };

  const simpleColumns = [
    "displayName",
    "description",
    "language",
    "extractHardwareHash",
    "deviceNameTemplate",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "deviceManagement/windowsAutopilotDeploymentProfiles",
        $expand: "assignments",
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <CippAutopilotProfileDrawer />
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
