import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import { RocketLaunch, Book, Check, Block, Delete } from "@mui/icons-material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Connector List";

  const actions = [
    {
      label: "Create template based on connector",
      type: "POST",
      url: "/api/AddExConnectorTemplate",
      icon: <Book />,
      postEntireRow: true,
      confirmText: "Are you sure you want to create a template based on this connector?",
      color: "info",
    },
    {
      label: "Enable Connector",
      type: "POST",
      url: "/api/EditExConnector",
      icon: <Check />,
      condition: (row) => !row.Enabled,
      data: {
        State: "!Enable",
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
      icon: <Block />,
      condition: (row) => row.Enabled,
      data: {
        State: "!Disable",
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
      icon: <Delete />,
      data: {
        GUID: "Guid",
        Type: "cippconnectortype",
      },
      confirmText: "Are you sure you want to delete this connector?",
      color: "danger",
    },
  ];

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

  const offCanvas = {
    extendedInfoFields: simpleColumns,
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListExchangeConnectors"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      cardButton={
        <>
          <Button
            component={Link}
            href="/email/transport/list-connectors/add"
            startIcon={<RocketLaunch />}
          >
            Deploy Connector
          </Button>
        </>
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>;
export default Page;
