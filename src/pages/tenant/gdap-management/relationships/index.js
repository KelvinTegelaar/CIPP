import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "../tabOptions";
import CippTablePage from "/src/components/CippComponents/CippTablePage";
import { EyeIcon } from "@heroicons/react/24/outline";
import {
  AdminPanelSettings,
  GppBad,
  HourglassBottom,
  OpenInNew,
  PlayArrow,
} from "@mui/icons-material";

const pageTitle = "GDAP Relationships";

const actions = [
  {
    label: "View Relationship",
    link: "/tenant/gdap-management/relationships/relationship?id=[id]",
    color: "primary",
    icon: <EyeIcon />,
  },
  {
    label: "Start Onboarding",
    link: "/tenant/gdap-management/onboarding/start?id=[id]",
    color: "primary",
    icon: <PlayArrow />,
  },
  {
    label: "Open Relationship in Partner Center",
    link: "https://partner.microsoft.com/en-us/dashboard/commerce2/customers/[customer.tenantId]/adminrelationships/[id]",
    color: "info",
    icon: <OpenInNew />,
  },
  {
    label: "Enable automatic extension",
    type: "GET",
    url: "/api/ExecAutoExtendGDAP",
    data: { ID: "id" },
    confirmText: "Are you sure you want to enable auto-extend for this relationship?",
    color: "info",
    icon: <HourglassBottom />,
  },
  {
    label: "Remove Global Administrator from Relationship",
    type: "GET",
    url: "/api/ExecGDAPRemoveGArole",
    data: { GDAPID: "id" },
    confirmText: "Are you sure you want to remove Global Administrator from this relationship?",
    color: "danger",
    icon: <AdminPanelSettings />,
  },
  {
    label: "Terminate Relationship",
    type: "GET",
    url: "/api/ExecDeleteGDAPRelationship",
    data: { GDAPID: "id" },
    confirmText: "Are you sure you want to terminate this relationship?",
    color: "error",
    icon: <GppBad />,
  },
];

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
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
