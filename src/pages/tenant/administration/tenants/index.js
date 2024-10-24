
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

// Developer note: Portals column logic has been omitted as per instructions. 
// The column mapping should be handled using the get translation file or similar method in the future.

const Page = () => {
  const pageTitle = "Tenants";
  const apiUrl = "/api/ListTenants";
  
  // Columns definition as per the new structure
  const simpleColumns = [
    "displayName",
    "defaultDomainName",
    "customerId",
  ];

  // Developer Note: If portal-specific columns are required, add the portal mapping logic here 
  // or handle it through a future translation file.

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiDataKey="Results"
      simpleColumns={simpleColumns}
      offCanvas={{
        extendedInfoFields: ["displayName", "defaultDomainName", "customerId"],
      }}
      dynamicColumns={false}   // No dynamic column toggling

      // Developer Note: 
      // If there's a requirement to include actions like "Add Tenant", 
      // a Material UI Button can be added here within a cardButton prop.
      // Example:
      // cardButton={
      //   <Button variant="contained" color="primary" href="/tenants/add">
      //     Add Tenant
      //   </Button>
      // }
    />
  );
};

// Adding the layout for Dashboard
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
