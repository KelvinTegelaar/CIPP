import { Alert } from "@mui/material";
import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippDataTable } from "../../../../components/CippTable/CippDataTable";
import { useCippReportDB } from "../../../../components/CippComponents/CippReportDBControls";
import { getIntuneDeviceActions } from "../../../../components/CippComponents/CippIntuneDeviceActions.jsx";
import { ApiGetCall } from "../../../../api/ApiCall";
import { useSettings } from "../../../../hooks/use-settings";
import { isMultiTenant } from "../../../../utils/tenant-selection";
import { getCippError } from "../../../../utils/get-cipp-error";

const DEVICE_ACTION_LABELS = [
  "View Device",
  "View in Intune",
  "Sync Device",
  "Add to Group",
  "Run Remediation Script",
];

const DetectedAppDevices = ({ row, tenant, cached }) => {
  const tenantFilter = isMultiTenant(tenant) ? row?.Tenant : tenant;
  const devices = ApiGetCall({
    url: "/api/ListDetectedAppDevices",
    data: { tenantFilter, AppID: row?.id, ...(cached ? { UseReportDB: true } : {}) },
    queryKey: `ListDetectedAppDevices-${tenantFilter}-${row?.id}-${cached}`,
    waiting: Boolean(tenantFilter && row?.id),
    toast: false,
  });
  // Device rows carry their tenant so actions and links target it under All Tenants or a group
  const rows = Array.isArray(devices.data)
    ? devices.data.map((device) => ({ ...device, Tenant: tenantFilter }))
    : [];
  const actions = getIntuneDeviceActions({ tenantFilter }).filter((action) =>
    DEVICE_ACTION_LABELS.includes(action.label)
  );

  if (devices.isError) {
    return (
      <Alert severity="warning" variant="outlined">
        {getCippError(devices.error) || "Could not load the devices for this app."}
      </Alert>
    );
  }

  return (
    <CippDataTable
      noCard
      title={`Devices with ${row?.displayName ?? "this app"}${row?.version ? ` ${row.version}` : ""}`}
      data={rows}
      isFetching={devices.isFetching}
      refreshFunction={() => devices.refetch()}
      actions={actions}
      simpleColumns={[
        "deviceName",
        "userPrincipalName",
        "operatingSystem",
        "osVersion",
        "complianceState",
        "lastSyncDateTime",
      ]}
    />
  );
};

const Page = () => {
  const pageTitle = "Discovered Apps";
  const tenant = useSettings().currentTenant;

  const reportDB = useCippReportDB({
    apiUrl: "/api/ListDetectedApps",
    queryKey: "ListDetectedApps",
    cacheName: "DetectedApps",
    syncTitle: "Sync Discovered Apps",
    syncConfirmText:
      "Sync Discovered Apps? Intune has to build the app inventory export first: a sync requests it if none is waiting, and syncing again a few minutes later reads it.",
    serverPagination: true,
  });

  // Columns to be displayed in the table
  const simpleColumns = [
    ...reportDB.cacheColumns.filter((c) => c === "Tenant"),
    "displayName",
    "version",
    "deviceCount",
    "platform",
    "publisher",
    // The cached app inventory export has no size
    ...(reportDB.useReportDB ? [] : ["sizeInByte"]),
    ...reportDB.cacheColumns.filter((c) => c !== "Tenant"),
  ];

  // Predefined filters
  const filterList = [
    {
      filterName: "Windows Apps",
      value: [{ id: "platform", value: "windows" }],
      type: "column",
    },
    {
      filterName: "macOS Apps",
      value: [{ id: "platform", value: "macOS" }],
      type: "column",
    },
    {
      filterName: "iOS Apps",
      value: [{ id: "platform", value: "ios" }],
      type: "column",
    },
    {
      filterName: "Android Apps",
      value: [{ id: "platform", value: "android" }],
      type: "column",
    },
  ];

  const offCanvas = {
    size: "lg",
    children: (row) => (
      <DetectedAppDevices row={row} tenant={tenant} cached={reportDB.useReportDB} />
    ),
  };

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        queryKey={reportDB.resolvedQueryKey}
        simpleColumns={simpleColumns}
        defaultSorting={[{ id: "displayName", desc: false }]}
        filters={filterList}
        offCanvas={offCanvas}
        offCanvasOnRowClick={true}
        dataSourceControls={reportDB.controls}
      />
      {reportDB.syncDialog}
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout tenantGroupSupport={true}>{page}</DashboardLayout>;

export default Page;
