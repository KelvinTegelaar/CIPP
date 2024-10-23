import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const pageTitle = "GDAP Invite List";

const simpleColumns = [
  "Timestamp",
  "RowKey",
  "InviteUrl",
  "OnboardingUrl",
  "RoleMappings",
];

const apiUrl = "/api/ListGDAPInvite";

const Page = () => {
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiDataKey="Results"
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
