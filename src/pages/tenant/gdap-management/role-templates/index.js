import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const pageTitle = "GDAP Role Templates";

const actions = [
  {
    label: "Delete Template",
    url: "/api/ExecGDAPRoleTemplate",
    data: { GroupId: "GroupId", action: "Delete" },
    confirmText:
      "Are you sure you want to delete this role mapping? (Note: This does not delete the associated security groups or modify any GDAP relationships.)",
  },
];

const simpleColumns = ["TemplateId", "RoleMappings"];
const apiUrl = "/api/ExecGDAPRoleTemplate";

const Page = () => {
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiDataKey="Results"
      actions={actions}
      simpleColumns={simpleColumns}
      tenantInTitle={false}
      cardButton={
        <Button component={Link} href="/tenant/gdap-management/role-templates/add">
          Add Template
        </Button>
      }
      queryKey="ListGDAPRoleTemplates"
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
