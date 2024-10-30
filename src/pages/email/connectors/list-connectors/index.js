import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Connector List";

  const actions = [
    {
      label: "Create template based on connector",
      type: "POST",
      url: "/api/AddExConnectorTemplate",
      data: {},
      confirmText: "Are you sure you want to create a template based on this connector?",
      color: "info",
    },
    {
      label: "Enable Connector",
      type: "POST",
      url: "/api/EditExConnector",
      data: {
        State: "Enable",
        TenantFilter: "Tenant",
        GUID: "Guid",
        Type: "cippconnectortype",
      },
      confirmText: "Are you sure you want to enable this connector?",
      color: "info",
    },
    {
      label: "Disable Connector",
      type: "POST",
      url: "/api/EditExConnector",
      data: {
        State: "Disable",
        TenantFilter: "Tenant",
        GUID: "Guid",
        Type: "cippconnectortype",
      },
      confirmText: "Are you sure you want to disable this connector?",
      color: "info",
    },
    {
      label: "Delete Connector",
      type: "POST",
      url: "/api/RemoveExConnector",
      data: {
        TenantFilter: "Tenant",
        GUID: "Guid",
        Type: "cippconnectortype",
      },
      confirmText: "Are you sure you want to delete this connector?",
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["Name", "Comment", "Enabled", "cippconnectortype", "ConnectorType"],
    actions: actions,
  };

  const simpleColumns = [
    "Name",
    "Enabled",
    "Comment",
    "cippconnectortype",
    "TlsSenderCertificateName",
    "SenderIPAddresses",
    "IsTransportRuleScoped",
    "SmartHosts",
    "TlsSettings",
    "TlsDomain",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListExchangeConnectors"
      apiData={{
        TenantFilter: "Tenant",
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      titleButton={{
        label: "Deploy Connector",
        href: "/email/connectors/deploy-connector",
      }}
      /* Developer Note:
      This component includes filter configurations that should be added in the 
      future when filter functionality is integrated. Filters include:
      - Enabled connectors
      - Disabled connectors
      - Inbound connectors
      - Outbound connectors
      - Transport rule connectors
      - Non-transport rule connectors
      */
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
