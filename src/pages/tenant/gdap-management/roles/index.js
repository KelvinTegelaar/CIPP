import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import Link from "next/link";

const pageTitle = "GDAP Role List";

const actions = [
  {
    label: "Delete Mapping",
    modal: true,
    modalUrl: "/api/ExecDeleteGDAPRoleMapping?&GroupId=[GroupId]",
    modalMessage:
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
        <Button component={Link} href="/gdap-management/roles/add">
          Map GDAP Roles
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
