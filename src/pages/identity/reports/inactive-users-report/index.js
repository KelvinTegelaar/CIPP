
import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  const pageTitle = "Inactive Users";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the inactive users section.</p>
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
