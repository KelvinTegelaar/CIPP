import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Group Templates";

  const actions = [
    {
      label: "View Template",
      type: "OFFCANVAS",
      offCanvasType: "GroupTemplate",
      data: {
        GUID: "GUID",
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
      actions={actions}
      cardButton={
        <>
          <Button component={Link} href="group-templates/add">
            Add Group Template
          </Button>
          <Button component={Link} href="group-templates/deploy">
            Deploy Group Template
          </Button>
        </>
      }
      offCanvas={offCanvas}
      simpleColumns={["Displayname", "Description", "groupType", "GUID"]}
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
