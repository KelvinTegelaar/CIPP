import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { useState } from "react";
import { Button, Alert, SvgIcon, IconButton, Tooltip } from "@mui/material";
import { useSettings } from "../../../../hooks/use-settings";
import { Stack } from "@mui/system";
import { Sync, Info } from "@mui/icons-material";
import { useDialog } from "../../../../hooks/use-dialog";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { CippQueueTracker } from "../../../../components/CippTable/CippQueueTracker";

const Page = () => {
  const currentTenant = useSettings().currentTenant;
  const syncDialog = useDialog();
  const [syncQueueId, setSyncQueueId] = useState(null);

  const isAllTenants = currentTenant === "AllTenants";

  const columns = [
    ...(isAllTenants ? ["Tenant"] : []),
    "UPN",
    "DisplayName",
    "RecipientTypeDetails",
    "ForwardingType",
    "ForwardTo",
    "DeliverToMailboxAndForward",
    "CacheTimestamp",
  ];

  const apiData = {
    UseReportDB: true,
  };

  const filters = [
    {
      filterName: "External Forwarding",
      value: [{ id: "ForwardingType", value: "External" }],
      type: "column",
    },
    {
      filterName: "Internal Forwarding",
      value: [{ id: "ForwardingType", value: "Internal" }],
      type: "column",
    },
  ];

  const pageActions = [
    <Stack direction="row" spacing={2} alignItems="center" key="actions-stack">
      <CippQueueTracker
        queueId={syncQueueId}
        queryKey={`mailbox-forwarding-${currentTenant}`}
        title="Mailbox Forwarding Sync"
      />
      <Tooltip title="This report displays cached mailbox data from the CIPP reporting database. Cache timestamps are shown in the table. Click the Sync button to update the mailbox cache for the current tenant.">
        <IconButton size="small">
          <Info fontSize="small" />
        </IconButton>
      </Tooltip>
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
    </Stack>,
  ];

  return (
    <>
      {currentTenant && currentTenant !== "" ? (
        <CippTablePage
          title="Mailbox Forwarding Report"
          apiUrl="/api/ListMailboxForwarding"
          queryKey={`mailbox-forwarding-${currentTenant}`}
          apiData={apiData}
          simpleColumns={columns}
          filters={filters}
          cardButton={pageActions}
          offCanvas={null}
        />
      ) : (
        <Alert severity="warning">Please select a tenant to view mailbox forwarding settings.</Alert>
      )}
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync Mailbox Cache"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run mailbox cache sync for ${currentTenant}? This will update mailbox data including forwarding settings.`,
          relatedQueryKeys: [`mailbox-forwarding-${currentTenant}`],
          data: {
            Name: "Mailboxes",
            Types: "",
          },
          onSuccess: (result) => {
            if (result?.Metadata?.QueueId) {
              setSyncQueueId(result.Metadata.QueueId);
            }
          },
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
