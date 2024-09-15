
import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  const pageTitle = "Tenant Allow/Block Lists";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the tenant allow/block lists section.</p>
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
