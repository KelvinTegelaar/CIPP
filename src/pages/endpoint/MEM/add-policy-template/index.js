import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  const pageTitle = "Add Policy Template";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This no longer exists.</p>
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
