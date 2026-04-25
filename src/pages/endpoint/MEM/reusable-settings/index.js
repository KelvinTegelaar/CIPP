import { Book, DeleteForever } from "@mui/icons-material";
import { CippReusableSettingsDeployDrawer } from "../../../../components/CippComponents/CippReusableSettingsDeployDrawer.jsx";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useSettings } from "../../../../hooks/use-settings";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { Stack } from "@mui/system";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";

const Page = () => {
  const { currentTenant } = useSettings();
  const pageTitle = "Reusable Settings";
  const reportDB = useCippReportDB({
    apiUrl: "/api/ListIntuneReusableSettings",
    queryKey: "ListIntuneReusableSettings",
    cacheName: "IntuneReusableSettings",
    syncTitle: "Sync Reusable Settings Report",
    allowToggle: true,
    defaultCached: false,
  });
  const isAllTenants = reportDB.isAllTenants;


  const actions = [
    {
      label: "Edit Reusable Setting",
      link: isAllTenants
        ? "/endpoint/MEM/reusable-settings/edit?id=[id]&tenant=[Tenant]&tenantFilter=[Tenant]"
        : `/endpoint/MEM/reusable-settings/edit?id=[id]&tenant=${currentTenant}&tenantFilter=${currentTenant}`,
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

  const simpleColumns = [
    ...reportDB.cacheColumns,
    "displayName",
    "description",
    "id",
    "version",
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <CippReusableSettingsDeployDrawer requiredPermissions={["Endpoint.MEM.ReadWrite"]} />
            {reportDB.controls}
          </Stack>
        }
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
