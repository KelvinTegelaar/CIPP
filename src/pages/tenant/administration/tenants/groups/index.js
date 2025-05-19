import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import tabOptions from "../tabOptions";
import { Edit } from "@mui/icons-material";
import { Button, SvgIcon } from "@mui/material";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import NextLink from "next/link";

const Page = () => {
  const pageTitle = "Tenant Groups";

  const simpleColumns = ["Name", "Description", "Members"];

  const actions = [
    {
      label: "Edit Group",
      link: "/tenant/administration/tenants/groups/edit?id=[Id]",
      icon: <Edit />,
    },
    {
      label: "Delete Group",
      icon: <TrashIcon />,
      url: "/api/ExecTenantGroup",
      type: "POST",
      data: { action: "Delete", groupId: "Id" },
      queryKey: "TenantGroupListPage",
      confirmText: "Are you sure you want to delete [Name]?",
    }
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
        <Button
          variant="contained"
          color="primary"
          size="small"
          component={NextLink}
          href="/tenant/administration/tenants/groups/add"
          startIcon={
            <SvgIcon fontSize="small">
              <PlusIcon />
            </SvgIcon>
          }
        >
          Add Tenant Group
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
