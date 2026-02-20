import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { getCippTranslation } from "../../../../utils/get-cipp-translation";
import { getCippFormatting } from "../../../../utils/get-cipp-formatting";
import { CippPropertyListCard } from "../../../../components/CippCards/CippPropertyListCard";
import { Block, PlayArrow, DeleteForever, Sync, Info } from "@mui/icons-material";
import { Button, SvgIcon, IconButton, Tooltip } from "@mui/material";
import { Stack } from "@mui/system";
import { useDialog } from "../../../../hooks/use-dialog";
import { CippApiDialog } from "../../../../components/CippComponents/CippApiDialog";
import { useSettings } from "../../../../hooks/use-settings";
import { CippQueueTracker } from "../../../../components/CippTable/CippQueueTracker";
import { useState } from "react";

const Page = () => {
  const pageTitle = "Mailbox Rules";
  const currentTenant = useSettings().currentTenant;
  const syncDialog = useDialog();
  const [syncQueueId, setSyncQueueId] = useState(null);

  const isAllTenants = currentTenant === "AllTenants";

  const apiData = {
    UseReportDB: true,
  };

  const simpleColumns = isAllTenants
    ? ["Tenant", "UserPrincipalName", "Name", "Priority", "Enabled", "From", "CacheTimestamp"]
    : ["UserPrincipalName", "Name", "Priority", "Enabled", "From", "CacheTimestamp"];

  const actions = [
    {
      label: "Enable Mailbox Rule",
      type: "POST",
      icon: <PlayArrow />,
      url: "/api/ExecSetMailboxRule",
      data: {
        ruleId: "Identity",
        userPrincipalName: "OperationGuid",
        ruleName: "Name",
        Enable: true,
      },
      condition: (row) => !row.Enabled,
      confirmText: "Are you sure you want to enable this mailbox rule?",
      multiPost: false,
    },
    {
      label: "Disable Mailbox Rule",
      type: "POST",
      icon: <Block />,
      url: "/api/ExecSetMailboxRule",
      data: {
        ruleId: "Identity",
        userPrincipalName: "OperationGuid",
        ruleName: "Name",
        Disable: true,
      },
      condition: (row) => row.Enabled,
      confirmText: "Are you sure you want to disable this mailbox rule?",
      multiPost: false,
    },
    {
      label: "Remove Mailbox Rule",
      type: "POST",
      icon: <DeleteForever />,
      url: "/api/ExecRemoveMailboxRule",
      data: { ruleId: "Identity", userPrincipalName: "OperationGuid", ruleName: "Name" },
      confirmText: "Are you sure you want to remove this mailbox rule?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    children: (data) => {
      const keys = Object.keys(data).filter(
        (key) => !key.includes("@odata") && !key.includes("@data"),
      );
      const properties = [];
      keys.forEach((key) => {
        if (data[key] && data[key].length > 0) {
          properties.push({
            label: getCippTranslation(key),
            value: getCippFormatting(data[key], key),
          });
        }
      });
      return (
        <CippPropertyListCard
          cardSx={{ p: 0, m: -2 }}
          title="Rule Details"
          propertyItems={properties}
          actionItems={actions}
          data={data}
        />
      );
    },
  };

  const pageActions = [
    <Stack key="actions-stack" direction="row" spacing={1} alignItems="center">
      <CippQueueTracker
        queueId={syncQueueId}
        queryKey={`ListMailboxRules-${currentTenant}`}
        title="Mailbox Rules Sync"
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
    </Stack>,
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListMailboxRules"
        apiData={apiData}
        queryKey={`ListMailboxRules-${currentTenant}`}
        simpleColumns={simpleColumns}
        offCanvas={offCanvas}
        actions={actions}
        cardButton={pageActions}
      />
      <CippApiDialog
        createDialog={syncDialog}
        title="Sync Mailbox Rules"
        fields={[]}
        api={{
          type: "GET",
          onSuccess: (result) => {
            if (result?.Metadata?.QueueId) {
              setSyncQueueId(result.Metadata.QueueId);
            }
          },
          url: "/api/ExecCIPPDBCache",
          confirmText: `Run mailbox rules cache sync for ${currentTenant}? This will update mailbox rules data immediately.`,
          relatedQueryKeys: [`ListMailboxRules-${currentTenant}`],
          data: {
            Name: "Mailboxes",
            Types: "Rules",
          },
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
