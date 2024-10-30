import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";

const Page = () => {
  const pageTitle = "Exchange Connector Templates";

  const actions = [
    {
      label: "View Template",
      icon: <EyeIcon />, // Placeholder for view icon
      color: "success",
      offCanvas: true,
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveExConnectorTemplate",
      data: {
        ID: "GUID",
      },
      confirmText: "Do you want to delete the template?",
      icon: <TrashIcon />, // Placeholder for delete icon
      color: "danger",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["name", "cippconnectortype", "GUID"],
    actions: actions,
  };

  const simpleColumns = ["name", "cippconnectortype", "GUID"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListExconnectorTemplates"
      apiData={{
        TenantFilter: "Tenant",
      }}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      titleButton={{
        label: "Add Template",
        href: "/email/connectors/add-connector-templates",
      }}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
