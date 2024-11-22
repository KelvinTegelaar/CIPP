import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Devices";

  const actions = [
    {
      label: "Sync Device",
      type: "POST",
      url: "/api/ExecDeviceAction",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "id",
        Action: "syncDevice",
      },
      confirmText: "Are you sure you want to sync this device?",
    },
    {
      label: "Reboot Device",
      type: "POST",
      url: "/api/ExecDeviceAction",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "id",
        Action: "rebootNow",
      },
      confirmText: "Are you sure you want to reboot this device?",
    },
    {
      label: "Locate Device",
      type: "POST",
      url: "/api/ExecDeviceAction",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "id",
        Action: "locateDevice",
      },
      confirmText: "Are you sure you want to locate this device?",
    },
    {
      label: "Retrieve LAPs password",
      type: "POST",
      url: "/api/ExecGetLocalAdminPassword",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "azureADDeviceId",
      },
      confirmText: "Are you sure you want to retrieve the local admin password?",
    },
    {
      label: "Rotate Local Admin Password",
      type: "POST",
      url: "/api/ExecDeviceAction",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "id",
        Action: "RotateLocalAdminPassword",
      },
      confirmText: "Are you sure you want to rotate the password for this device?",
    },
    {
      label: "Retrieve Bitlocker Keys",
      type: "POST",
      url: "/api/ExecGetRecoveryKey",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "azureADDeviceId",
      },
      confirmText: "Are you sure you want to retrieve the Bitlocker keys?",
    },
    {
      label: "Windows Defender Full Scan",
      type: "POST",
      url: "/api/ExecDeviceAction",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "id",
        Action: "WindowsDefenderScan",
        quickScan: false,
      },
      confirmText: "Are you sure you want to perform a full scan on this device?",
    },
    {
      label: "Windows Defender Quick Scan",
      type: "POST",
      url: "/api/ExecDeviceAction",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "id",
        Action: "WindowsDefenderScan",
        quickScan: true,
      },
      confirmText: "Are you sure you want to perform a quick scan on this device?",
    },
    {
      label: "Update Windows Defender",
      type: "POST",
      url: "/api/ExecDeviceAction",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "id",
        Action: "windowsDefenderUpdateSignatures",
      },
      confirmText:
        "Are you sure you want to update the Windows Defender signatures for this device?",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["deviceName", "userPrincipalName"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListDevices"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "deviceName",
        "userPrincipalName",
        "complianceState",
        "manufacturer",
        "model",
        "operatingSystem",
        "osVersion",
        "enrolledDateTime",
        "managedDeviceOwnerType",
        "deviceEnrollmentType",
        "joinType",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
