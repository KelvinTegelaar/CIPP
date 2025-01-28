import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Teams Activity List";

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListTeamsActivity?type=TeamsUserActivityUser"
      simpleColumns={["UPN", "LastActive", "MeetingCount", "CallCount", "TeamsChat"]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
