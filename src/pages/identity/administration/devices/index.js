import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import { useSettings } from "../../../../hooks/use-settings";
import { Visibility, CheckCircleOutline, Block, VpnKey, DeleteForever } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Devices";
  const tenantFilter = useSettings().currentTenant;

  const actions = [
    {
      label: "View in Entra",
      link: `https://entra.microsoft.com/${tenantFilter}/#view/Microsoft_AAD_Devices/DeviceDetailsMenuBlade/~/Properties/objectId/[id]/deviceId/`,
      color: "info",
      icon: <Visibility />,
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
      condition: (row) => !row.accountEnabled,
      icon: <CheckCircleOutline />,
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
      condition: (row) => row.accountEnabled,
      icon: <Block />,
    },
    {
      label: "Retrieve BitLocker Keys",
      type: "POST",
      url: "/api/ExecGetRecoveryKey",
      data: {
        GUID: "deviceId",
      },
      confirmText: "Are you sure you want to retrieve the BitLocker keys?",
      multiPost: false,
      icon: <VpnKey />,
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
      icon: <DeleteForever />,
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
      queryKey={`EntraDevices-${tenantFilter}`}
      actions={actions}
      simpleColumns={[
        "displayName",
        "accountEnabled",
        "trustType",
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
