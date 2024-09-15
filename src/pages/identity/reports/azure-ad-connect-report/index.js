
import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  const pageTitle = "AAD Connect Report";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the aad connect report section.</p>
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
