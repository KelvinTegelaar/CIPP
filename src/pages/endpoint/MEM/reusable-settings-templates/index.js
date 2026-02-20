import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { Button } from "@mui/material";
import Link from "next/link";
import { AddBox, GitHub, Delete, Edit } from "@mui/icons-material";
import { ApiGetCall } from "../../../../api/ApiCall";

const Page = () => {
  const pageTitle = "Reusable Settings Templates";

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const actions = [
    {
      label: "Edit Template",
      icon: <Edit />,
      link: "/endpoint/MEM/reusable-settings-templates/edit?id=[GUID]",
    },
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
      condition: () => integrations.isSuccess && integrations?.data?.GitHub?.Enabled,
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveIntuneReusableSettingTemplate",
      icon: <Delete />,
      data: {
        ID: "GUID",
      },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    children: (row) => <CippJsonView object={row} type={"intune"} defaultOpen={true} />,
    size: "lg",
  };

  const simpleColumns = ["displayName", "package", "description", "isSynced"];

  return (
    <CippTablePage
      title={pageTitle}
      cardButton={
        <Button component={Link} href="reusable-settings-templates/add" startIcon={<AddBox />}>
          Add Reusable Settings Template
        </Button>
      }
      apiUrl="/api/ListIntuneReusableSettingTemplates"
      tenantInTitle={false}
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
      queryKey="ListIntuneReusableSettingTemplates-table"
    />
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
