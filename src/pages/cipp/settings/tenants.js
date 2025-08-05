import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import tabOptions from "./tabOptions";
import { CippTenantTable } from "../../../components/CippWizard/CippTenantTable";

const Page = () => {
  const pageTitle = "Tenants - Backend";

  return <CippTenantTable title={pageTitle} tenantInTitle={false} showExcludeButtons={true} />;
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);
export default Page;
