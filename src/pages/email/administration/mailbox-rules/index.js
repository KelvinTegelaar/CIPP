import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Mailbox Rules";

  return <CippTablePage title={pageTitle} apiUrl="/api/ListMailboxRules" />;
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
