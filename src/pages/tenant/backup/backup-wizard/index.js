import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { Restore, Backup } from "@mui/icons-material";
import Link from "next/link";

const Page = () => {
  return (
    <CippTablePage
      title="Backup Tasks"
      apiUrl="/api/ListScheduledItems"
      cardButton={
        <>
          <Button
            component={Link}
            href="/tenant/backup/backup-wizard/restore"
            startIcon={<Restore />}
          >
            Restore Configuration Backup
          </Button>
          <Button component={Link} href="/tenant/backup/backup-wizard/add" startIcon={<Backup />}>
            Add Configuration Backup Task
          </Button>
        </>
      }
      tenantInTitle={false}
      apiData={{
        showHidden: true,
        Type: "New-CIPPBackup",
      }}
      simpleColumns={["Tenant", "TaskState", "ExecutedTime"]}
      actions={[
        {
          label: "Delete Task",
          type: "POST",
          url: "/api/RemoveScheduledItem",
          data: { ID: "RowKey" },
          confirmText: "Do you want to delete this job?",
        },
      ]}
      offCanvas={{
        extendedInfoFields: ["RowKey", "TaskState", "ExecutedTime"],
        actions: [
          {
            label: "Delete Task",
            type: "POST",
            url: "/api/RemoveScheduledItem",
            data: { ID: "RowKey" },
            confirmText: "Do you want to delete this job?",
          },
        ],
      }}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
