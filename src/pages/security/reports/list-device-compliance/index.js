import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Device Compliance";

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        endpoint: "devices",
        $top: "999",
      }}
      apiDataKey="Results"
      simpleColumns={[
        "displayName",
        "isCompliant",
        "isManaged",
        "accountEnabled",
        "trustType",
        "complianceExpirationDateTime",
        "approximateLastSignInDateTime",
        "hostnames",
        "model",
        "lastSyncDateTime",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
