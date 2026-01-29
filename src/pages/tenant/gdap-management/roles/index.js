import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import tabOptions from "../tabOptions";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { AdminPanelSettings, Add, Delete } from "@mui/icons-material";
import Link from "next/link";

const pageTitle = "GDAP Role Mappings";

const actions = [
  {
    label: "Add to Template",
    icon: <Add />,
    type: "POST",
    url: "/api/ExecGDAPRoleTemplate?Action=Add",
    confirmText: "Select a template to add the selected role mapping(s) to.",
    data: {
      GroupName: "GroupName",
      GroupId: "GroupId",
      RoleName: "RoleName",
      roleDefinitionId: "roleDefinitionId",
    },
    fields: [
      {
        type: "autoComplete",
        name: "TemplateId",
        label: "Select a template",
        creatable: true,
        multiple: false,
        api: {
          url: "/api/ExecGDAPRoleTemplate",
          labelField: "TemplateId",
          valueField: "TemplateId",
          dataKey: "Results",
        },
      },
    ],
    multiPost: false,
  },
  {
    label: "Delete Mapping",
    icon: <Delete />,
    type: "POST",
    url: "/api/ExecDeleteGDAPRoleMapping",
    data: {
      GroupId: "GroupId",
    },
    confirmText:
      "Are you sure you want to delete this role mapping? (Note: This does not delete the associated security groups or modify any GDAP relationships.)",
  },
];

const simpleColumns = ["RoleName", "GroupName"];

const apiUrl = "/api/ListGDAPRoles";

const Page = () => {
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      actions={actions}
      simpleColumns={simpleColumns}
      tenantInTitle={false}
      cardButton={
        <Button
          component={Link}
          href="/tenant/gdap-management/roles/add"
          startIcon={<AdminPanelSettings />}
        >
          Map GDAP Roles
        </Button>
      }
      queryKey="ListGDAPRoles"
      maxHeightOffset="460px"
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
