import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";

const simpleColumns = [
  "displayName",
  "ObjectType",
  "createdDateTime",
  "onPremisesProvisioningErrors",
];

const apiUrl = "/api/ListAzureADConnectStatus";

const Page = () => {
  return (
    <CippTablePage
      title="Microsoft Entra Connect Report"
      apiUrl={apiUrl}
      apiData={{
        DataToReturn: "AzureADObjectsInError",
      }}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
