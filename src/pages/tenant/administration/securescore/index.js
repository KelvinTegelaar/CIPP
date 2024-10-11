import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import { useSecureScore } from "../../../../hooks/use-securescore";
const Page = () => {
  const pageTitle = "Settings";
  const secureScore = useSecureScore();
  console.log(secureScore);
  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the thingy section.</p>
    </div>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
