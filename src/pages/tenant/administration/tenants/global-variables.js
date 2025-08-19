import tabOptions from "./tabOptions";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippCustomVariables from "/src/components/CippComponents/CippCustomVariables.jsx";

const Page = () => {
  return <CippCustomVariables id="AllTenants" />;
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
