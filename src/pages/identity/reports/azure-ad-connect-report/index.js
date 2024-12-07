import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const simpleColumns = [
  "displayName",
  "ObjectType",
  "createdDateTime",
  "onPremisesProvisioningErrors",
];

const apiUrl = "/api/ListAzureADConnectStatus";
const actions = []; // No actions specified in the original code

const offCanvas = null; // No off-canvas details provided

const Page = () => {
  return (
    <CippTablePage
      title="Azure AD Connect Report"
      apiUrl={apiUrl}
      apiData={{
        DataToReturn: "AzureADObjectsInError",
      }}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;

export default Page;
