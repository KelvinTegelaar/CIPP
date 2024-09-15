
import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  const pageTitle = "Configuration Backup";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the configuration backup section.</p>
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
