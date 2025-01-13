import CippMessageViewerPage from "../../../../components/CippComponents/CippMessageViewer";
import { Layout as DashboardLayout } from "/src/layouts/index.js";

const Page = () => {
  return <CippMessageViewerPage />;
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
