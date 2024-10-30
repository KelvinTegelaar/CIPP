import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "App Protection & Configuration Policies";

  const actions = [
    {
      label: "Create template based on policy",
      type: "POST",
      url: "/api/AddIntuneTemplate",
      data: {
        TenantFilter: "Tenant",
        ID: "id",
        URLName: "managedAppPolicies",
      },
      confirmText: "Are you sure you want to create a template based on this policy?",
      icon: <BookIcon />, // Placeholder for developer-provided icon
      color: "info",
    },
    {
      label: "Delete Policy",
      type: "POST",
      url: "/api/RemovePolicy",
      data: {
        TenantFilter: "Tenant",
        ID: "id",
        URLName: "managedAppPolicies",
      },
      confirmText: "Are you sure you want to delete this policy?",
      icon: <TrashIcon />, // Placeholder for developer-provided icon
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "createdDateTime",
      "displayName",
      "lastModifiedDateTime",
      "PolicyTypeName",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "isAssigned",
    "lastModifiedDateTime",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        TenantFilter: "Tenant",
        Endpoint: "deviceAppManagement/managedAppPolicies",
        $orderby: "displayName",
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
