import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import CippExchangeActions from "../../../../components/CippComponents/CippExchangeActions";
import { CippHVEUserDrawer } from "../../../../components/CippComponents/CippHVEUserDrawer.jsx";
import { CippSharedMailboxDrawer } from "../../../../components/CippComponents/CippSharedMailboxDrawer.jsx";
import { Sync, Info } from "@mui/icons-material";
import { Button, SvgIcon, IconButton, Tooltip } from "@mui/material";
import { useSettings } from "../../../../hooks/use-settings";
import { Stack } from "@mui/system";
import { useDialog } from "../../../../hooks/use-dialog";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { useState } from "react";
import { CippQueueTracker } from "../../../../components/CippTable/CippQueueTracker";

const Page = () => {
  const pageTitle = "Mailboxes";
  const currentTenant = useSettings().currentTenant;
  const syncDialog = useDialog();
  const [syncQueueId, setSyncQueueId] = useState(null);

  const isAllTenants = currentTenant === "AllTenants";

  const apiData = {
    UseReportDB: true,
  };

  // Define off-canvas details
  const offCanvas = {
    extendedInfoFields: ["displayName", "UPN", "AdditionalEmailAddresses", "recipientTypeDetails"],
    actions: CippExchangeActions(),
  };

  const filterList = [
    {
      filterName: "View User Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "UserMailbox" }],
      type: "column",
    },
    {
      filterName: "View Shared Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "SharedMailbox" }],
      type: "column",
    },
    {
      filterName: "View Room Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "RoomMailbox" }],
      type: "column",
    },
    {
      filterName: "View Equipment Mailboxes",
      value: [{ id: "recipientTypeDetails", value: "EquipmentMailbox" }],
      type: "column",
    },
  ];

  // Simplified columns for the table
  const simpleColumns = isAllTenants
    ? [
        "Tenant", // Tenant
        "displayName", // Display Name
        "recipientTypeDetails", // Recipient Type Details
        "UPN", // User Principal Name
        "primarySmtpAddress", // Primary Email Address
        "recipientType", // Recipient Type
        "AdditionalEmailAddresses", // Additional Email Addresses
        "CacheTimestamp", // Cache Timestamp
      ]
    : [
        "displayName", // Display Name
        "recipientTypeDetails", // Recipient Type Details
        "UPN", // User Principal Name
        "primarySmtpAddress", // Primary Email Address
        "recipientType", // Recipient Type
        "AdditionalEmailAddresses", // Additional Email Addresses
        "CacheTimestamp", // Cache Timestamp
      ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListMailboxes"
        apiData={apiData}
        queryKey={`ListMailboxes-${currentTenant}`}
        actions={CippExchangeActions()}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        filters={filterList}
        cardButton={
          <Stack direction="row" spacing={1} alignItems="center">
            <CippSharedMailboxDrawer />
            <CippHVEUserDrawer />
            <CippQueueTracker
              queueId={syncQueueId}
              queryKey={`ListMailboxes-${currentTenant}`}
              title="Mailboxes Sync"
            />
            <Tooltip title="This report displays cached data from the CIPP reporting database. Click the Sync button to update the cache for the current tenant.">
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
            >
              Sync
            </Button>
          </Stack>
        }
      />
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync Mailboxes"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run mailboxes cache sync for ${currentTenant}? This will update mailbox data immediately.`,
          relatedQueryKeys: [`ListMailboxes-${currentTenant}`],
          data: {
            Name: "Mailboxes",
          },
          onSuccess: (response) => {
            if (response?.QueueId) {
              setSyncQueueId(response.QueueId);
            }
          },
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={true}>{page}</DashboardLayout>;

export default Page;
