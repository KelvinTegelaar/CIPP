import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { Delete } from "@mui/icons-material";

const Page = () => {
  const pageTitle = "Available Conditional Access Templates";

  const actions = [
    {
      label: "Delete Template",
      type: "GET",
      url: "/api/RemoveCATemplate",
      icon: <Delete />,
      data: { ID: "GUID" },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    children: (row) => <CippJsonView object={row} />,
    size: "xl",
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
