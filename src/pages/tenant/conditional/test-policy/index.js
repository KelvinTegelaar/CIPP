import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  const pageTitle = "CA Policy Tester";

  return (
    <div>
      <h1>{pageTitle}</h1>
      SCRATCHED, this is now in users overview.
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
