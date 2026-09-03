import { Layout as DashboardLayout } from "../../../../../layouts/index";
import { CippIcons } from "../../../../../utils/icon-registry"
import { TabbedLayout } from "../../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../../components/CippComponents/CippTablePage.jsx";
import tabOptions from "../tabOptions";
import { CippAddTenantGroupDrawer } from "../../../../../components/CippComponents/CippAddTenantGroupDrawer";
import { CippApiLogsDrawer } from "../../../../../components/CippComponents/CippApiLogsDrawer";
import { CippTenantGroupOffCanvas } from "../../../../../components/CippComponents/CippTenantGroupOffCanvas";
import { CippApiDialog } from "../../../../../components/CippComponents/CippApiDialog.jsx";
import { Box, Button } from "@mui/material";
import { useDialog } from "../../../../../hooks/use-dialog.js";
import { useState } from "react"

const Page = () => {
  const pageTitle = "Tenant Groups";
  const createDefaultGroupsDialog = useDialog();
  const [showUsage, setShowUsage] = useState(false);

  const simpleColumns = showUsage
    ? ["Name", "Description", "GroupType", "Members", "Usage"]
    : ["Name", "Description", "GroupType", "Members"];

  const offcanvas = {
    children: (row) => {
      return <CippTenantGroupOffCanvas data={row} />;
    },
    size: "xl",
  };
  const actions = [
    {
      label: "Edit Group",
      link: "/tenant/administration/tenants/groups/edit?id=[Id]",
      pinned: true,
      icon: <CippIcons.Edit />,
    },
    {
      label: "Run Dynamic Rules",
      icon: <CippIcons.PlayArrow />,
      url: "/api/ExecRunTenantGroupRule",
      type: "POST",
      data: { groupId: "Id" },
      queryKey: "TenantGroupListPage",
      confirmText: "Are you sure you want to run dynamic rules for [Name]?",
      condition: (row) => row.GroupType === "dynamic",
    },
    {
      label: "Delete Group",
      icon: <CippIcons.Delete />,
      url: "/api/ExecTenantGroup",
      type: "POST",
      data: { action: "Delete", groupId: "Id" },
      queryKey: "TenantGroupListPage",
      confirmText: "Are you sure you want to delete [Name]?",
    },
  ];

  return (
    <>
      <CippTablePage
        title={pageTitle}
        tenantInTitle={false}
        simpleColumns={simpleColumns}
        apiUrl="/api/ListTenantGroups"
        apiData={{ includeUsage: showUsage }}
        queryKey={showUsage ? "TenantGroupListPage-usage" : "TenantGroupListPage"}
        apiDataKey="Results"
        actions={actions}
        cardButton={
          <Box sx={{ display: "flex", gap: 1 }}>
            <CippAddTenantGroupDrawer />
            <Button onClick={() => setShowUsage(!showUsage)} startIcon={<CippIcons.ViewList />}>
              {showUsage ? "Hide Usage" : "Show Usage"}
            </Button>
            <Button onClick={createDefaultGroupsDialog.handleOpen} startIcon={<CippIcons.GroupAdd />}>
              Create Default Groups
            </Button>
            <CippApiLogsDrawer
              apiFilter="TenantGroups"
              buttonText="View Logs"
              title="Tenant Groups Logs"
            />
          </Box>
        }
        offCanvas={offcanvas}
      />
      <CippApiDialog
        title="Create Default Groups"
        createDialog={createDefaultGroupsDialog}
        api={{
          type: "POST",
          url: "/api/ExecCreateDefaultGroups",
          data: {},
          confirmText:
            "Are you sure you want to create default tenant groups? This will create a selection of groups we recommend by default to use as templates.",
        }}
        queryKey="TenantGroupListPage"
      />
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
