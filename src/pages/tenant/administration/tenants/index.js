import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useEffect } from "react";

const Page = () => {
  //this page is special and requires us to craft the columns and DashboardLayout
  const pageTitle = "Tenants";

  const simpleColumns = [
    "displayName",
    "defaultDomainName",
    "portal_m365",
    "portal_exchange",
    "portal_entra",
    "portal_teams",
    "portal_azure",
    "portal_intune",
    "portal_security",
    "portal_compliance",
  ];
  return (
    <CippTablePage
      title={pageTitle}
      tenantInTitle={false}
      simpleColumns={simpleColumns}
      apiUrl="/api/ListTenants"
      queryKey="TenantListPage"
      apiData={{
        Mode: "TenantList",
        tenantFilter: null,
      }}
    />
  );
};

// Adding the layout for Dashboard
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
