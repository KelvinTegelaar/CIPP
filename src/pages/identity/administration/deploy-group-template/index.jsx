import { Layout as DashboardLayout } from "../../../../layouts/index";

const Page = () => {
  const pageTitle = "Deploy Group Template";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the deploy group template.</p>
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;