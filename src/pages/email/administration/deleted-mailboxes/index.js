import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Deleted Mailboxes";

  const simpleColumns = ["displayName", "mail", "companyName", "onPremisesSyncEnabled"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListMailboxes?SoftDeletedMailbox=true"
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
