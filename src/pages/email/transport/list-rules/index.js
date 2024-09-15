
import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  const pageTitle = "Transport rules";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the transport rules section.</p>
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
