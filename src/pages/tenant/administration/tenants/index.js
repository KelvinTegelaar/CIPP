import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useEffect } from "react";

const Page = () => {
  //this page is special and requires us to craft the columns and DashboardLayout
  const pageTitle = "Tenants";
  const tenantData = ApiGetCall({
    url: "/api/listTenants",
    queryKey: "ListTenants",
  });

  useEffect(() => {
    if (tenantData.isSuccess) {
      tenantData.data.forEach((tenant) => {
        Object.assign(tenant, {
          portal_m365: `https://admin.microsoft.com/Partner/BeginClientSession.aspx?CTID=${tenant.customerId}&CSDEST=o365admincenter`,
          portal_exchange: `https://admin.exchange.microsoft.com/?landingpage=homepage&form=mac_sidebar&delegatedOrg=${tenant.defaultDomainName}`,
          portal_entra: `https://entra.microsoft.com/${tenant.defaultDomainName}`,
          portal_teams: `https://admin.teams.microsoft.com/?delegatedOrg=${tenant.defaultDomainName}`,
          portal_azure: `https://portal.azure.com/${tenant.defaultDomainName}`,
          portal_intune: `https://intune.microsoft.com/${tenant.defaultDomainName}`,
          portal_security: `https://security.microsoft.com/?tid=${tenant.customerId}`,
          portal_compliance: `https://purview.microsoft.com/?tid=${tenant.customerId}`,
          portal_sharepoint: `https://admin.microsoft.com/Partner/beginclientsession.aspx?CTID=${tenant.customerId}&CSDEST=SharePoint`,
        });
      });
    }
  }, [tenantData.isSuccess]);

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
      data={tenantData.data}
    />
  );
};

// Adding the layout for Dashboard
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
