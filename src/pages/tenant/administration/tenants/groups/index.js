import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { tabOptions } from "../tabOptions";
import { Edit } from "@mui/icons-material";
import { Button, SvgIcon } from "@mui/material";
import { PlusIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Tenant Groups";

  const simpleColumns = ["groupName", "groupDescription", "groupMembersCount"];

  const actions = [
    {
      label: "Edit Group",
      link: "/tenant/administration/tenants/groups/edit?id=[groupId]",
      icon: <Edit />,
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
        <Button
          variant="contained"
          color="primary"
          size="small"
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
