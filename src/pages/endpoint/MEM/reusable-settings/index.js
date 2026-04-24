import { Book, DeleteForever, Sync, CloudDone, Bolt } from "@mui/icons-material";
import { CippReusableSettingsDeployDrawer } from "../../../../components/CippComponents/CippReusableSettingsDeployDrawer.jsx";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { useSettings } from "../../../../hooks/use-settings";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { Button, Chip, SvgIcon, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useDialog } from "../../../../hooks/use-dialog";
import { CippQueueTracker } from "../../../../components/CippTable/CippQueueTracker";
import { useEffect, useState } from "react";

const Page = () => {
  const { currentTenant } = useSettings();
  const pageTitle = "Reusable Settings";
  const isAllTenants = currentTenant === "AllTenants";
  const syncDialog = useDialog();
  const [syncQueueId, setSyncQueueId] = useState(null);
  const [useReportDB, setUseReportDB] = useState(isAllTenants);

  useEffect(() => {
    setUseReportDB(currentTenant === "AllTenants");
  }, [currentTenant]);

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
    ...(useReportDB ? ["CacheTimestamp"] : []),
    ...(useReportDB && isAllTenants ? ["Tenant"] : []),
    "displayName",
    "description",
    "id",
    "version",
  ];

  const pageActions = [
    <Stack key="actions-stack" direction="row" spacing={1} alignItems="center">
      {useReportDB && (
        <>
          <CippQueueTracker
            queueId={syncQueueId}
            queryKey={`ListIntuneReusableSettings-${currentTenant}`}
            title="Reusable Settings Sync"
          />
          <Button
            startIcon={
              <SvgIcon fontSize="small">
                <Sync />
              </SvgIcon>
            }
            size="xs"
            onClick={syncDialog.handleOpen}
          >
            Sync
          </Button>
        </>
      )}
      <Tooltip
        title={
          isAllTenants
            ? "AllTenants always uses cached data"
            : useReportDB
              ? "Showing cached data from the Reporting Database - click to switch to live"
              : "Showing live data - click to switch to cache"
        }
      >
        <span>
          <Chip
            icon={useReportDB ? <CloudDone /> : <Bolt />}
            label={useReportDB ? "Cached" : "Live"}
            color="primary"
            size="small"
            onClick={isAllTenants ? undefined : () => setUseReportDB((prev) => !prev)}
            clickable={!isAllTenants}
            disabled={isAllTenants}
            variant="outlined"
          />
        </span>
      </Tooltip>
    </Stack>,
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <CippReusableSettingsDeployDrawer requiredPermissions={["Endpoint.MEM.ReadWrite"]} />
            {pageActions}
          </Stack>
        }
        apiUrl={`/api/ListIntuneReusableSettings${useReportDB ? "?UseReportDB=true" : ""}`}
        queryKey={`ListIntuneReusableSettings-${currentTenant}-${useReportDB}`}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
      />
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync Reusable Settings Report"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run reusable settings cache sync for ${currentTenant}? This will update reusable settings data immediately.`,
          relatedQueryKeys: [`ListIntuneReusableSettings-${currentTenant}-true`],
          data: {
            Name: "IntuneReusableSettings",
          },
          onSuccess: (result) => {
            if (result?.Metadata?.QueueId) {
              setSyncQueueId(result?.Metadata?.QueueId);
            }
          },
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
