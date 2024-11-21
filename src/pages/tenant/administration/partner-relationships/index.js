import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

// Developer Note: The "Tenant" column should be omitted if tenant is not "AllTenants".
// You may handle tenant filtering or visibility at a higher level if required.

const Page = () => {
  const pageTitle = "Partner Relationships";
  const apiUrl = "/api/ListGraphRequest";

  // Columns definition based on provided structure
  const simpleColumns = [
    "Tenant", // Tenant name
    "TenantInfo.displayName", // Partner name
    "isServiceProvider", // Service provider status
    "isInMultiTenantOrganization", // Multi-tenant status
    "TenantInfo", // Partner information
  ];

  // API Data configuration for the request
  const apiData = {
    Endpoint: "policies/crossTenantAccessPolicy/partners", // API endpoint for partner relationships
    ReverseTenantLookup: true, // Reverse lookup for tenant details
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiDataKey="Results"
      simpleColumns={simpleColumns}
      apiData={apiData} // Corrected API data passed here
      dynamicColumns={false} // No dynamic column toggling
    />
  );
};

// Adding the layout for the dashboard
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
