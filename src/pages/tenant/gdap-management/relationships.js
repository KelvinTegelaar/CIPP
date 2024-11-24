import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
const pageTitle = "Relationships";

const actions = [
  {
    label: "Start Onboarding",
    color: "primary",
    link: "/tenant/gdap-management/onboarding/wizard?id=[id]",
  },
  {
    label: "Open Relationship in Partner Center",
    color: "info",
    link: "https://partner.microsoft.com/en-us/dashboard/commerce2/customers/[customer.tenantId]/adminrelationships/[id]",
    external: true,
  },
  {
    label: "Enable automatic extension",
    color: "info",
    modal: true,
    modalUrl: "/api/ExecAutoExtendGDAP?ID=[id]",
    modalMessage: "Are you sure you want to enable auto-extend for this relationship?",
  },
  {
    label: "Remove Global Administrator from Relationship",
    color: "danger",
    modal: true,
    modalUrl: "/api/ExecGDAPRemoveGArole?&GDAPID=[id]",
    modalMessage: "Are you sure you want to remove Global Administrator from this relationship?",
  },
  {
    label: "Terminate Relationship",
    color: "error",
    modal: true,
    modalUrl: "/api/ExecDeleteGDAPRelationship?GDAPID=[id]",
    modalMessage: "Are you sure you want to delete this relationship?",
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
