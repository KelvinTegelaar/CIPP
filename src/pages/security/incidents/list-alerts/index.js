import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { Refresh } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "List Alerts";

  const actions = [
    {
      label: "Set status to in progress",
      type: "POST",
      url: "/api/ExecSetSecurityAlert",
      data: {
        TenantFilter: "Tenant",
        GUID: "RawResult.id",
        Status: "inProgress",
        Vendor: "RawResult.vendorInformation.vendor",
        provider: "RawResult.vendorInformation.provider",
      },
      confirmText: "Are you sure you want to set the status to in progress?",
      color: "info",
    },
    {
      label: "Set status to resolved",
      type: "POST",
      url: "/api/ExecSetSecurityAlert",
      data: {
        TenantFilter: "Tenant",
        GUID: "RawResult.id",
        Status: "resolved",
        Vendor: "RawResult.vendorInformation.vendor",
        provider: "RawResult.vendorInformation.provider",
      },
      confirmText: "Are you sure you want to set the status to resolved?",
      color: "info",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "EventDateTime",
      "Title",
      "Category",
      "Status",
      "Severity",
      "Tenant",
      "InvolvedUsers.userPrincipalName",
    ],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ExecAlertsList"
      apiData={{
        tenantFilter: "TenantFilter",
      }}
      apiDataKey="MSResults"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={[
        "EventDateTime",
        "Tenant",
        "Title",
        "Severity",
        "Status",
      ]}
      cardButton={
        <Button
          startIcon={<Refresh />}
          size="small"
          onClick={() => execAlertsList({ tenantFilter: "TenantFilter" })}
          disabled={isFetching}
        >
          Refresh
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
