import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const simpleColumns = ["Tenant", "Name", "ApplicationID", "ObjectID", "Scope", "StartTime"];

const apiUrl = "/api/ListOAuthApps";
const pageTitle = "Consented Applications";

const Page = () => {
  return <CippTablePage title={pageTitle} apiUrl={apiUrl} simpleColumns={simpleColumns} />;
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
