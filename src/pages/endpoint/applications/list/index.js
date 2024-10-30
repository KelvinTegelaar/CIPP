import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Applications";

  const actions = [
    {
      label: "Assign to All Users",
      type: "POST",
      url: "/api/ExecAssignApp",
      data: {
        AssignTo: "AllUsers",
        TenantFilter: "Tenant",
        ID: "id",
      },
      confirmText: "Are you sure you want to assign this app to all users?",
      icon: <UserIcon />, // Placeholder icon for developer customization
      color: "info",
    },
    {
      label: "Assign to All Devices",
      type: "POST",
      url: "/api/ExecAssignApp",
      data: {
        AssignTo: "AllDevices",
        TenantFilter: "Tenant",
        ID: "id",
      },
      confirmText: "Are you sure you want to assign this app to all devices?",
      icon: <PagerIcon />, // Placeholder icon for developer customization
      color: "info",
    },
    {
      label: "Assign Globally (All Users / All Devices)",
      type: "POST",
      url: "/api/ExecAssignApp",
      data: {
        AssignTo: "Both",
        TenantFilter: "Tenant",
        ID: "id",
      },
      confirmText: "Are you sure you want to assign this app to all users and devices?",
      icon: <GlobeIcon />, // Placeholder icon for developer customization
      color: "info",
    },
    {
      label: "Delete Application",
      type: "POST",
      url: "/api/RemoveApp",
      data: {
        TenantFilter: "Tenant",
        ID: "id",
      },
      confirmText: "Are you sure you want to delete this application?",
      icon: <TrashIcon />, // Placeholder icon for developer customization
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "installExperience.runAsAccount",
      "installExperience.deviceRestartBehavior",
      "isAssigned",
      "createdDateTime",
      "lastModifiedDateTime",
      "isFeatured",
      "publishingState",
      "dependentAppCount",
      "rules.0.ruleType",
      "rules.0.fileOrFolderName",
      "rules.0.path",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "publishingState",
    "installCommandLine",
    "uninstallCommandLine",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListApps"
      apiData={{
        TenantFilter: "Tenant",
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      additionalButtons={[
        {
          label: "Add Choco app",
          href: "/endpoint/applications/add-choco-app",
        },
        {
          label: "Add Store app",
          href: "/endpoint/applications/add-winget-app",
        },
        {
          label: "Add Office app",
          href: "/endpoint/applications/add-office-app",
        },
        {
          label: "Add MSP app",
          href: "/endpoint/applications/add-rmm-app",
        },
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
