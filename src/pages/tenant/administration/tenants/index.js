import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button, SvgIcon } from "@mui/material";
import { AddBusinessOutlined, Edit } from "@mui/icons-material";
import tabOptions from "./tabOptions";
import NextLink from "next/link";

const Page = () => {
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

  const actions = [
    {
      label: "Edit Tenant",
      link: "/tenant/administration/tenants/edit?id=[customerId]",
      icon: <Edit />,
    },
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
      actions={actions}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
