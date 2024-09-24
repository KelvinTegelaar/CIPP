import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
const Page = () => {
  const pageTitle = "Settings";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the settings section.</p>
    </div>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
