import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { DeleteOutline, Edit } from "@mui/icons-material";
import tabOptions from "./tabOptions";

const Page = () => {
  const pageTitle = "Tenants";

  const simpleColumns = [
    "displayName",
    "defaultDomainName",
    "portal_m365",
    "portal_exchange",
    "portal_entra",
    "portal_sharepoint",
    "portal_teams",
    "portal_azure",
    "portal_intune",
    "portal_security",
    "portal_compliance",
    "portal_platform",
    "portal_bi",
  ];

  const actions = [
    {
      label: "Edit Tenant",
      link: "/tenant/manage/edit?tenantFilter=[defaultDomainName]",
      icon: <Edit />,
    },
    {
      label: "Configure Backup",
      link: "/tenant/manage/configuration-backup?tenantFilter=[defaultDomainName]",
      icon: <Edit />,
    },
    {
      label: "Delete Capabilities Cache",
      type: "GET",
      url: "/api/RemoveTenantCapabilitiesCache",
      data: { defaultDomainName: "defaultDomainName" },
      confirmText: "Are you sure you want to delete the capabilities cache for this tenant?",
      color: "info",
      icon: <DeleteOutline />,
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
