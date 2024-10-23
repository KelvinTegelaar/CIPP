import { Layout as DashboardLayout } from "/src/layouts/index.js";
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
      apiDataKey="Results"
      actions={actions}
      simpleColumns={simpleColumns}
      cardButton={
        <Button component={Link} href="/tenant/administration/gdap-role-wizard">
          Map GDAP Roles
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
