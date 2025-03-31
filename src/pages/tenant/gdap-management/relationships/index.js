import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import CippGdapActions from "/src/components/CippComponents/CippGdapActions";

const pageTitle = "GDAP Relationships";

const actions = CippGdapActions();

const simpleColumns = [
  "customer.displayName",
  "displayName",
  "status",
  "createdDateTime",
  "activatedDateTime",
  "endDateTime",
  "autoExtendDuration",
  "accessDetails.unifiedRoles",
];

const filters = [
  {
    filterName: "Active",
    value: [{ id: "status", value: "active" }],
    type: "column",
  },
  {
    filterName: "Approval Pending",
    value: [{ id: "status", value: "approvalPending" }],
    type: "column",
  },
  {
    filterName: "Terminating",
    value: [{ id: "status", value: "terminating" }],
    type: "column",
  },
  {
    filterName: "Terminated",
    value: [{ id: "status", value: "terminated" }],
    type: "column",
  },
];

const offCanvas = {
  actions: actions,
  extendedInfoFields: simpleColumns,
};

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
      maxHeightOffset="460px"
      filters={filters}
      defaultSorting={[{ id: "customer.displayName", desc: false }]}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
