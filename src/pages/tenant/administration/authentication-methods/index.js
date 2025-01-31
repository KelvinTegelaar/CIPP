import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Check, Block } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Auth Methods";
  const apiUrl = "/api/ListGraphRequest";

  // Columns configuration based on provided structure
  const simpleColumns = ["id", "state", "includeTargets", "excludeTargets"];

  const actions = [
    {
      label: "Enable Policy",
      type: "POST",
      icon: <Check />,
      url: "/api/SetAuthMethod",
      data: { state: "enabled", id: "id" },
      confirmText: "Are you sure you want to enable this policy?",
      multiPost: false,
    },
    {
      label: "Disable Policy",
      type: "POST",
      icon: <Block />,
      url: "/api/SetAuthMethod",
      data: { state: "disabled", id: "id" },
      confirmText: "Are you sure you want to disable this policy?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["id", "state", "includeTargets", "excludeTargets"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiData={{
        Endpoint: "authenticationMethodsPolicy",
      }}
      apiDataKey="Results.0.authenticationMethodConfigurations"
      simpleColumns={simpleColumns}
      offCanvas={offCanvas}
      actions={actions}
      dynamicColumns={false}
    />
  );
};

// Adding the layout for the dashboard
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
