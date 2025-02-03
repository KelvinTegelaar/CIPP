import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import { useSettings } from "/src/hooks/use-settings";
import { EyeIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const pageTitle = "Devices";
  const tenantFilter = useSettings().currentTenant;

  const actions = [
    {
      label: "View in Entra",
      link: `https://entra.microsoft.com/${tenantFilter}/#view/Microsoft_AAD_Devices/DeviceDetailsMenuBlade/~/Properties/objectId/[id]/deviceId/`,
      color: "info",
      icon: <EyeIcon />,
      target: "_blank",
      multiPost: false,
      external: true,
    },
    {
      label: "Enable Device",
      type: "POST",
      url: "/api/ExecDeviceDelete",
      data: {
        ID: "id",
        action: "!Enable",
      },
      confirmText: "Are you sure you want to enable this device?",
      multiPost: false,
    },
    {
      label: "Disable Device",
      type: "POST",
      url: "/api/ExecDeviceDelete",
      data: {
        ID: "id",
        action: "!Disable",
      },
      confirmText: "Are you sure you want to disable this device?",
      multiPost: false,
    },
    {
      label: "Retrieve BitLocker Keys",
      type: "GET",
      url: "/api/ExecGetRecoveryKey",
      data: {
        GUID: "id",
      },
      confirmText: "Are you sure you want to retrieve the BitLocker keys?",
      multiPost: false,
    },
    {
      label: "Delete Device",
      type: "POST",
      url: "/api/ExecDeviceDelete",
      data: {
        ID: "id",
        action: "!Delete",
      },
      confirmText: "Are you sure you want to delete this device?",
      multiPost: false,
    },
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGraphRequest"
      apiData={{
        Endpoint: "devices",
        $format: "application/json",
        $count: true,
      }}
      apiDataKey="Results"
      actions={actions}
      simpleColumns={[
        "displayName",
        "accountEnabled",
        "recipientType",
        "enrollmentType",
        "manufacturer",
        "model",
        "operatingSystem",
        "operatingSystemVersion",
        "profileType",
        "approximateLastSignInDateTime",
      ]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
