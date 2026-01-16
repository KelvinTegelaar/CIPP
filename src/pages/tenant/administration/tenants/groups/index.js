import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import tabOptions from "../tabOptions";
import { Edit, PlayArrow, GroupAdd } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippAddTenantGroupDrawer } from "/src/components/CippComponents/CippAddTenantGroupDrawer";
import { CippApiLogsDrawer } from "/src/components/CippComponents/CippApiLogsDrawer";
import { CippTenantGroupOffCanvas } from "/src/components/CippComponents/CippTenantGroupOffCanvas";
import { CippApiDialog } from "/src/components/CippComponents/CippApiDialog.jsx";
import { Box, Button } from "@mui/material";
import { useDialog } from "/src/hooks/use-dialog.js";

const Page = () => {
  const pageTitle = "Tenant Groups";
  const createDefaultGroupsDialog = useDialog();

  const simpleColumns = ["Name", "Description", "GroupType", "Members"];

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
      icon: <Edit />,
    },
    {
      label: "Run Dynamic Rules",
      icon: <PlayArrow />,
      url: "/api/ExecRunTenantGroupRule",
      type: "POST",
      data: { groupId: "Id" },
      queryKey: "TenantGroupListPage",
      confirmText: "Are you sure you want to run dynamic rules for [Name]?",
      condition: (row) => row.GroupType === "dynamic",
    },
    {
      label: "Delete Group",
      icon: <TrashIcon />,
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
        queryKey="TenantGroupListPage"
        apiDataKey="Results"
        actions={actions}
        cardButton={
          <Box sx={{ display: "flex", gap: 1 }}>
            <CippAddTenantGroupDrawer />
            <Button onClick={createDefaultGroupsDialog.handleOpen} startIcon={<GroupAdd />}>
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
