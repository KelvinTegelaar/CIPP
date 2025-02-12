import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { AddBox, RocketLaunch, Delete, GitHub } from "@mui/icons-material";
import Link from "next/link";
import { CippCodeBlock } from "../../../../components/CippComponents/CippCodeBlock";
import { ApiGetCall } from "/src/api/ApiCall";

const Page = () => {
  const pageTitle = "Group Templates";
  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
  });
  const actions = [
    {
      label: "Save to GitHub",
      type: "POST",
      url: "/api/ExecCommunityRepo",
      icon: <GitHub />,
      data: {
        Action: "UploadTemplate",
        GUID: "GUID",
      },
      fields: [
        {
          label: "Repository",
          name: "FullName",
          type: "select",
          api: {
            url: "/api/ListCommunityRepos",
            data: {
              WriteAccess: true,
            },
            queryKey: "CommunityRepos-Write",
            dataKey: "Results",
            valueField: "FullName",
            labelField: "FullName",
          },
          multiple: false,
          creatable: false,
          required: true,
          validators: {
            required: { value: true, message: "This field is required" },
          },
        },
        {
          label: "Commit Message",
          placeholder: "Enter a commit message for adding this file to GitHub",
          name: "Message",
          type: "textField",
          multiline: true,
          required: true,
          rows: 4,
        },
      ],
      confirmText: "Are you sure you want to save this template to the selected repository?",
      condition: () => integrations.isSuccess && integrations?.data?.GitHub.Enabled,
    },
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
