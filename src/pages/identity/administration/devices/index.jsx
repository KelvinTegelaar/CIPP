import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import { useSettings } from "../../../../hooks/use-settings";
import { useCippEntraDeviceActions } from "../../../../components/CippComponents/CippEntraDeviceActions.jsx";

const Page = () => {
  const pageTitle = "Devices";
  const tenantFilter = useSettings().currentTenant;

  const actions = useCippEntraDeviceActions();

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

Page.getLayout = (page) => <DashboardLayout tenantGroupSupport={true}>{page}</DashboardLayout>;

export default Page;
