import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippTablePage from "/src/components/CippComponents/CippTablePage";

const pageTitle = "GDAP Relationships";

const actions = [
  {
    label: "Start Onboarding",
    link: "/tenant/gdap-management/onboarding/wizard?id=[id]",
    color: "primary",
  },
  {
    label: "Open Relationship in Partner Center",
    link: "https://partner.microsoft.com/en-us/dashboard/commerce2/customers/[customer.tenantId]/adminrelationships/[id]",
    color: "info",
    external: true,
  },
  {
    label: "Enable automatic extension",
    type: "POST",
    url: "/api/ExecAutoExtendGDAP?ID=[id]",
    confirmText: "Are you sure you want to enable auto-extend for this relationship?",
    color: "info",
  },
  {
    label: "Remove Global Administrator from Relationship",
    type: "POST",
    url: "/api/ExecGDAPRemoveGArole?&GDAPID=[id]",
    confirmText: "Are you sure you want to remove Global Administrator from this relationship?",
    color: "danger",
  },
  {
    label: "Terminate Relationship",
    type: "POST",
    url: "/api/ExecDeleteGDAPRelationship?GDAPID=[id]",
    confirmText: "Are you sure you want to terminate this relationship?",
    color: "error",
  },
];

const offCanvas = {
  actions: actions,
};

const simpleColumns = [
  "customer.displayName",
  "displayName",
  "status",
  "createdDateTime",
  "activatedDateTime",
  "endDateTime",
  "autoExtendDuration",
  "accessDetails.unifiedRoles.roleDefinitionId",
];

const apiUrl = "/api/ListGraphRequest";
const apiData = {
  Endpoint: "tenantRelationships/delegatedAdminRelationships",
  tenantFilter: "",
  $top: 300,
};

const Page = () => {
  return (
    <CippTablePage
      title={pageTitle}
      tenantInTitle={false}
      apiUrl={apiUrl}
      apiData={apiData}
      apiDataKey="Results"
      queryKey="ListGDAPRelationships"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
