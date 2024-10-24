import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const pageTitle = "GDAP Relationship List";

const actions = [
  {
    label: "Start Onboarding",
    color: "primary",
    link:
      "/tenant/administration/tenant-onboarding-wizard?tableFilter=Complex: id eq [id]",
  },
  {
    label: "Open Relationship in Partner Center",
    color: "info",
    link:
      "https://partner.microsoft.com/en-us/dashboard/commerce2/customers/[customer.tenantId]/adminrelationships/[id]",
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
    color: "danger",
    modal: true,
    icon: <FontAwesomeIcon icon={faTrashAlt} className="me-2" />,
    modalUrl: "/api/ExecDeleteGDAPRelationship?GDAPID=[id]",
    modalMessage: "Are you sure you want to delete this relationship?",
  },
];

const offCanvas = {
  extendedInfoFields: ["InviteUrl", "accessDetails.unifiedRoles.roleDefinitionId"],
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
  $top: 300,
};

const Page = () => {
  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiData={apiData}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
