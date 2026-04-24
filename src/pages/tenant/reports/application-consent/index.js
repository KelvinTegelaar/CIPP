import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Sync, CloudDone, Bolt } from "@mui/icons-material";
import { Button, SvgIcon, Tooltip, Chip } from "@mui/material";
import { useSettings } from "../../../../hooks/use-settings";
import { Stack } from "@mui/system";
import { useDialog } from "../../../../hooks/use-dialog";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { useState, useEffect } from "react";
import { CippQueueTracker } from "../../../../components/CippTable/CippQueueTracker";

const pageTitle = "Consented Applications";

const Page = () => {
  const currentTenant = useSettings().currentTenant;
  const syncDialog = useDialog();
  const [syncQueueId, setSyncQueueId] = useState(null);

  const isAllTenants = currentTenant === "AllTenants";
  const [useReportDB, setUseReportDB] = useState(true);

  useEffect(() => {
    setUseReportDB(true);
  }, [currentTenant]);

  const simpleColumns = isAllTenants
    ? ["Tenant", "Name", "ApplicationID", "ObjectID", "Scope", "StartTime", "CacheTimestamp"]
    : ["Name", "ApplicationID", "ObjectID", "Scope", "StartTime", "CacheTimestamp"];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={`/api/ListOAuthApps${useReportDB ? "?UseReportDB=true" : ""}`}
        queryKey={`ListOAuthApps-${currentTenant}-${useReportDB}`}
        simpleColumns={simpleColumns}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            {useReportDB && (
              <>
                <CippQueueTracker
                  queueId={syncQueueId}
                  queryKey={`ListOAuthApps-${currentTenant}`}
                  title="OAuth Apps Sync"
                />
                <Button
                  startIcon={
                    <SvgIcon fontSize="small">
                      <Sync />
                    </SvgIcon>
                  }
                  size="xs"
                  onClick={syncDialog.handleOpen}
                  disabled={isAllTenants}
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
                    ? "Showing cached data — click to switch to live"
                    : "Showing live data — click to switch to cache"
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
          </Stack>
        }
      />
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync Consented Applications"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run OAuth apps cache sync for ${currentTenant}? This will update consented application data immediately.`,
          relatedQueryKeys: [`ListOAuthApps-${currentTenant}-true`],
          data: {
            Name: "OAuth2PermissionGrants",
            Types: "None",
          },
          onSuccess: (response) => {
            if (response?.Metadata?.QueueId) {
              setSyncQueueId(response.Metadata.QueueId);
            }
          },
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;

export default Page;
