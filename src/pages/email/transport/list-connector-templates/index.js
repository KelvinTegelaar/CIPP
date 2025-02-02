import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { Button } from "@mui/material";
import Link from "next/link";
import { RocketLaunch } from "@mui/icons-material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import ConnectorTemplateDetails from "../../../../components/CippComponents/ConnectorTemplateDetails";

const Page = () => {
  const pageTitle = "Exchange Connector Templates";

  const actions = [
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveExConnectorTemplate",
      data: {
        ID: "GUID",
      },
      confirmText: "Do you want to delete the template?",
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    children: (data) => <ConnectorTemplateDetails data={data} />,
    actions: actions,
    size: "lg",
  };

  const simpleColumns = ["name", "cippconnectortype", "GUID"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListExconnectorTemplates"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      titleButton={{
        label: "Add Template",
        href: "/email/connectors/add-connector-templates",
      }}
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

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
