import { Book, DeleteForever } from "@mui/icons-material";
import { CippReusableSettingsDeployDrawer } from "../../../../components/CippComponents/CippReusableSettingsDeployDrawer.jsx";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useSettings } from "../../../../hooks/use-settings";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";

const Page = () => {
  const { currentTenant } = useSettings();
  const pageTitle = "Reusable Settings";

  const actions = [
    {
      label: "Edit Reusable Setting",
      link: `/endpoint/MEM/reusable-settings/edit?id=[id]&tenant=${currentTenant}&tenantFilter=${currentTenant}`,
    },
    {
      label: "Delete Reusable Setting",
      type: "POST",
      url: "/api/RemoveIntuneReusableSetting",
      icon: <DeleteForever />,
      color: "error",
      data: {
        ID: "id",
        DisplayName: "displayName",
      },
      confirmText: "Delete this reusable setting from the tenant?",
      multiPost: false,
    },
    {
      label: "Create Template from Setting",
      type: "POST",
      url: "/api/AddIntuneReusableSettingTemplate",
      icon: <Book />,
      data: {
        displayName: "displayName",
        description: "description",
        rawJSON: "RawJSON",
      },
      confirmText: "Create a reusable settings template from this entry?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    children: (row) => <CippJsonView object={row} type={"intune"} defaultOpen={true} />,
    size: "lg",
  };

  return (
    <CippTablePage
      title={pageTitle}
      cardButton={
        <CippReusableSettingsDeployDrawer requiredPermissions={["Endpoint.MEM.ReadWrite"]} />
      }
      apiUrl="/api/ListIntuneReusableSettings"
      queryKey={`ListIntuneReusableSettings-${currentTenant}`}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={["displayName", "description", "id", "version"]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
