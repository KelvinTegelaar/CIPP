import tabOptions from "./tabOptions";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import CippCustomVariables from "/src/components/CippComponents/CippCustomVariables.jsx";
import CippPageCard from "/src/components/CippCards/CippPageCard.jsx";

const Page = () => {
  return (
    <CippPageCard title="Global Variables" hideTitleText={true}>
      <CippCustomVariables id="AllTenants" />
    </CippPageCard>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
