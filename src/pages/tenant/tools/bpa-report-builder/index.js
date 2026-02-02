
import { Layout as DashboardLayout } from "../../../../layouts/index.js";

const Page = () => {
  const pageTitle = "BPA Report Builder";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the bpa report builder section.</p>
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
