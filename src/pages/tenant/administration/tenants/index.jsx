import { Layout as DashboardLayout } from "../../../../layouts/index";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippIcons } from "../../../../utils/icon-registry"
import tabOptions from "./tabOptions";

const Page = () => {
  const pageTitle = "Tenants";

  const simpleColumns = [
    "displayName",
    "defaultDomainName",
    "tenantGroups",
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
      pinned: true,
      icon: <CippIcons.Edit />,
    },
    {
      label: "Configure Backup",
      link: "/tenant/manage/configuration-backup?tenantFilter=[defaultDomainName]",
      icon: <CippIcons.Edit />,
    },
    {
      label: "Delete Capabilities Cache",
      type: "POST",
      url: "/api/RemoveTenantCapabilitiesCache",
      data: { defaultDomainName: "defaultDomainName" },
      confirmText: "Are you sure you want to delete the capabilities cache for this tenant?",
      color: "info",
      icon: <CippIcons.Delete />,
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
