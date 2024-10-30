import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Autopilot Devices";

  const actions = [
    {
      label: "Assign device",
      type: "POST",
      url: "/api/ExecAssignAPDevice",
      data: {
        TenantFilter: "Tenant",
        userid: "id",
        message: "message",
        Device: "id",
      },
      confirmText: "Select the user to assign",
      modalDropdown: {
        url: "/api/listUsers",
        labelField: "userPrincipalName",
        valueField: "id",
        addedField: {
          userPrincipalName: "userPrincipalName",
          addressableUserName: "displayName",
          groupName: "displayName",
        },
      },
      color: "info",
    },
    {
      label: "Delete Device",
      type: "POST",
      url: "/api/RemoveAPDevice",
      data: { ID: "id", tenantFilter: "Tenant" },
      confirmText: "Are you sure you want to delete this device?",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "userPrincipalName",
      "productKey",
      "serialNumber",
      "model",
      "manufacturer",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "displayName",
    "serialNumber",
    "model",
    "manufacturer",
    "groupTag",
    "enrollmentState",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListAPDevices"
      apiData={{
        TenantFilter: "Tenant",
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      additionalButtons={[
        {
          label: "Deploy Autopilot Device",
          href: "/endpoint/autopilot/add-device",
        },
        {
          label: "Sync Devices",
          onClick: () =>
            ExecuteGetRequest({
              path: "/api/ExecSyncAPDevices",
              data: { tenantFilter: "Tenant" },
            }),
          icon: <SyncIcon />, // Placeholder for the sync icon
        },
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
