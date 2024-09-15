
import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  const pageTitle = "Shared Mailbox with Enabled Account";

  return (
    <div>
      <h1>{pageTitle}</h1>
      <p>This is a placeholder page for the shared mailbox with enabled account section.</p>
    </div>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
