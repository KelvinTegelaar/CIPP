import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.

const Page = () => {
  const pageTitle = "Devices";
  const actions = [
    // these are currently GET requests that should be converted to POST requests.
    {
      label: "Enable Device",
      type: "POST",
      url: "/api/ExecDeviceDelete",
      data: {
        TenantFilter: "TenantFilter",
        ID: "ID",
        Action: "Enable",
      },
      confirmText: "Are you sure you want to enable this device?",
      multiPost: false,
    },
    {
      label: "Disable Device",
      type: "POST",
      url: "/api/ExecDeviceDelete",
      data: {
        TenantFilter: "TenantFilter",
        ID: "ID",
        Action: "Disable",
      },
      confirmText: "Are you sure you want to disable this device?",
      multiPost: false,
    },
    {
      label: "Retrieve Bitlocker Keys",
      type: "POST",
      url: "/api/ExecGetRecoveryKey",
      data: {
        TenantFilter: "TenantFilter",
        GUID: "ID",
      },
      confirmText: "Are you sure you want to retrieve the Bitlocker keys?",
      multiPost: false,
    },
    {
      label: "Delete Device",
      type: "POST",
      url: "/api/ExecDeviceDelete",
      data: {
        TenantFilter: "TenantFilter",
        ID: "ID",
        Action: "Delete",
      },
      confirmText: "Are you sure you want to delete this device?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["createdDateTime", "displayName", "id"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "devices",
        $format: "application/json",
        $orderby: "displayName",
        $count: true,
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "Tenant",
        "CippStatus",
        "displayName",
        "accountEnabled",
        "recipientType",
        "enrollmentType",
        "manufacturer",
        "model",
        "operatingSystem",
        "operatingSystemVersion",
        "profileType",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
