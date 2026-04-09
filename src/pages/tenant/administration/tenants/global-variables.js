import tabOptions from "./tabOptions";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import CippCustomVariables from "../../../../components/CippComponents/CippCustomVariables.jsx";
import CippPageCard from "../../../../components/CippCards/CippPageCard.jsx";

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
