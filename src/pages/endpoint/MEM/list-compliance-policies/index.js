import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Intune Compliance Policies";

  const actions = [
    {
      label: "Create template based on policy",
      type: "POST",
      url: "/api/AddIntuneTemplate",
      data: {
        TenantFilter: "Tenant",
        ID: "id",
        URLName: "deviceCompliancePolicies",
      },
      confirmText: "Are you sure you want to create a template based on this policy?",
      icon: <BookIcon />, // Placeholder for developer-provided icon
      color: "info",
    },
    {
      label: "Assign to All Users",
      type: "POST",
      url: "/api/ExecAssignPolicy",
      data: {
        AssignTo: "allLicensedUsers",
        TenantFilter: "Tenant",
        ID: "id",
        type: "deviceCompliancePolicies",
      },
      confirmText: "Are you sure you want to assign this policy to all users?",
      icon: <UserIcon />, // Placeholder for developer-provided icon
      color: "info",
    },
    {
      label: "Assign to All Devices",
      type: "POST",
      url: "/api/ExecAssignPolicy",
      data: {
        AssignTo: "AllDevices",
        TenantFilter: "Tenant",
        ID: "id",
        type: "deviceCompliancePolicies",
      },
      confirmText: "Are you sure you want to assign this policy to all devices?",
      icon: <PagerIcon />, // Placeholder for developer-provided icon
      color: "info",
    },
    {
      label: "Assign Globally (All Users / All Devices)",
      type: "POST",
      url: "/api/ExecAssignPolicy",
      data: {
        AssignTo: "AllDevicesAndUsers",
        TenantFilter: "Tenant",
        ID: "id",
        type: "deviceCompliancePolicies",
      },
      confirmText: "Are you sure you want to assign this policy to all users and devices?",
      icon: <GlobeIcon />, // Placeholder for developer-provided icon
      color: "info",
    },
    {
      label: "Delete Policy",
      type: "POST",
      url: "/api/RemovePolicy",
      data: {
        TenantFilter: "Tenant",
        ID: "id",
        URLName: "deviceCompliancePolicies",
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
    "description",
    "lastModifiedDateTime",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        TenantFilter: "Tenant",
        Endpoint: "deviceManagement/deviceCompliancePolicies",
        $orderby: "displayName",
        $count: true,
        $expand: "assignments",
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
