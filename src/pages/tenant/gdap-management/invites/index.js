import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import Link from "next/link";

const pageTitle = "GDAP Invites";
const simpleColumns = ["Timestamp", "RowKey", "InviteUrl", "OnboardingUrl", "RoleMappings"];
const apiUrl = "/api/ListGDAPInvite";

const Page = () => {
  return (
    <CippTablePage
      cardButton={
        <Button component={Link} href="/tenant/gdap-management/invites/add" startIcon={<Add />}>
          New Invite
        </Button>
      }
      title={pageTitle}
      apiUrl={apiUrl}
      simpleColumns={simpleColumns}
      tenantInTitle={false}
      queryKey="ListGDAPInvite"
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
