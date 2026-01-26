import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { useState } from "react";
import {
  Button,
  FormControlLabel,
  Switch,
  Alert,
  SvgIcon,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useSettings } from "../../../../hooks/use-settings";
import { Stack } from "@mui/system";
import { Sync, Info } from "@mui/icons-material";
import { useDialog } from "../../../../hooks/use-dialog";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";

const Page = () => {
  const [byUser, setByUser] = useState(true);
  const currentTenant = useSettings().currentTenant;
  const syncDialog = useDialog();

  const isAllTenants = currentTenant === "AllTenants";

  const columns = byUser
    ? [
        ...(isAllTenants ? ["Tenant"] : []),
        "User",
        "UserMailboxType",
        "Permissions",
        "MailboxCacheTimestamp",
        "PermissionCacheTimestamp",
      ]
    : [
        ...(isAllTenants ? ["Tenant"] : []),
        "CalendarUPN",
        "CalendarDisplayName",
        "CalendarType",
        "Permissions",
        "MailboxCacheTimestamp",
        "PermissionCacheTimestamp",
      ];

  // Compute apiData based on byUser directly (no useState needed)
  const apiData = {
    UseReportDB: true,
    ByUser: byUser,
  };

  const pageActions = [
    <Stack direction="row" spacing={2} alignItems="center" key="actions-stack">
      <Tooltip title="This report displays cached data from the CIPP reporting database. Cache timestamps are shown in the table. Click the Sync button to update the cache for the current tenant.">
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
      <FormControlLabel
        key="byUser"
        control={
          <Switch checked={byUser} onChange={(e) => setByUser(e.target.checked)} color="primary" />
        }
        label="Group by User"
        labelPlacement="start"
      />
    </Stack>,
  ];

  return (
    <>
      {currentTenant && currentTenant !== "" ? (
        <CippTablePage
          key={`calendar-permissions-${byUser}`}
          title="Calendar Permissions Report"
          apiUrl="/api/ListCalendarPermissions"
          queryKey={["calendar-permissions", currentTenant, byUser]}
          apiData={apiData}
          simpleColumns={columns}
          cardButton={pageActions}
          offCanvas={null}
        />
      ) : (
        <Alert severity="warning">Please select a tenant to view calendar permissions.</Alert>
      )}
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync Calendar Permissions Cache"
        fields={[]}
        api={{
          type: "GET",
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run calendar permissions cache sync for ${currentTenant}? This will update mailbox and calendar permission data immediately.`,
          relatedQueryKeys: ["calendar-permissions"],
          data: {
            Name: "Calendars",
          },
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
