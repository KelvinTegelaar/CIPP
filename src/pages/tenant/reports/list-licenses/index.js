import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Licences Report";
  const apiUrl = "/api/ListLicenses";

  const simpleColumns = [
    "Tenant",
    "License",
    "CountUsed",
    "CountAvailable",
    "TotalLicenses",
    "AssignedUsers",
    "AssignedGroups",
    "TermInfo", // TODO TermInfo is not showing as a clickable json object in the table, like CApolicies does in the mfa report. IDK how to fix it. -Bobby
  ];

  return <CippTablePage title={pageTitle} apiUrl={apiUrl} simpleColumns={simpleColumns} />;
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
