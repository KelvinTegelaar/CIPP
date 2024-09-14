import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";

const Page = () => {
  const pageTitle = "Group Templates";

  const actions = [
    {
      label: "View Template",
      type: "OFFCANVAS",
      offCanvasType: "GroupTemplate",
      data: {
        GUID: "GUID", // Pass the GUID dynamically
      },
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveGroupTemplate",
      data: {
        ID: "GUID",
      },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["Displayname", "Description", "GUID"],
    actions: actions,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGroupTemplates"
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={["Displayname", "Description", "groupType", "GUID"]}
      titleButton={{
        href: "/identity/administration/group-add-template", // Add Group Template Button
        title: "Add Group Template",
      }}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
