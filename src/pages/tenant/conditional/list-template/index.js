import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";

const Page = () => {
  const pageTitle = "Available Conditional Access Templates";

  const actions = [
    {
      label: "View Template",
      link: "/tenant/conditional/template-details/[id]",
      multiPost: false,
      color: "success",
    },
    {
      label: "Delete Template",
      type: "GET",
      url: "/api/RemoveCATemplate",
      data: { ID: "GUID" },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["displayName", "GUID"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListCATemplates"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={["displayName", "GUID"]}
      cardButton={
        <Button key="template-lib" href="/cipp/template-library" title="Add Template Library" />
      }
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
