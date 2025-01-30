import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { AddBox, RocketLaunch, Delete } from "@mui/icons-material";
import Link from "next/link";
import { CippCodeBlock } from "../../../../components/CippComponents/CippCodeBlock";

const Page = () => {
  const pageTitle = "Group Templates";

  const actions = [
    {
      label: "Delete Template",
      type: "GET",
      url: "/api/RemoveGroupTemplate",
      icon: <Delete />,
      data: {
        ID: "GUID",
      },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    children: (row) => <CippCodeBlock type="editor" code={JSON.stringify(row, null, 2)} />,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListGroupTemplates"
      actions={actions}
      cardButton={
        <>
          <Button component={Link} href="group-templates/add" startIcon={<AddBox />}>
            Add Group Template
          </Button>
          <Button component={Link} href="group-templates/deploy" startIcon={<RocketLaunch />}>
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
