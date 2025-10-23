import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import tabOptions from "../tabOptions";
import { Edit, PlayArrow } from "@mui/icons-material";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CippAddTenantGroupDrawer } from "/src/components/CippComponents/CippAddTenantGroupDrawer";
import { CippApiLogsDrawer } from "/src/components/CippComponents/CippApiLogsDrawer";
import { CippTenantGroupOffCanvas } from "/src/components/CippComponents/CippTenantGroupOffCanvas";
import { Box } from "@mui/material";

const Page = () => {
  const pageTitle = "Tenant Groups";

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
          <CippApiLogsDrawer
            apiFilter="TenantGroups"
            buttonText="View Logs"
            title="Tenant Groups Logs"
          />
        </Box>
      }
      offCanvas={offcanvas}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
