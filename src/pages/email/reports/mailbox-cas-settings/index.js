import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  return (
    <CippTablePage
      title="Mailbox Client Access Settings"
      apiUrl="/api/ListMailboxCAS"
      simpleColumns={[
        "displayName",
        "primarySmtpAddress",
        "ecpenabled",
        "ewsenabled",
        "imapenabled",
        "mapienabled",
        "owaenabled",
        "popenabled",
        "activesyncenabled",
      ]}
    />
  );
};

// No actions were specified in the original code, so no actions are added here.
// No off-canvas configuration was provided or specified in the original code.

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
