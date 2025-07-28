import { Button } from "@mui/material";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Layout as DashboardLayout } from "/src/layouts/index.js"; // had to add an extra path here because I added an extra folder structure. We should switch to absolute pathing so we dont have to deal with relative.
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import Link from "next/link";
import { CopyAll, Delete, AddBox, Edit, GitHub } from "@mui/icons-material";
import { ApiGetCall, ApiPostCall } from "../../../../../api/ApiCall";
import tabOptions from "../tabOptions.json";

const Page = () => {
  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const pageTitle = "Drift Templates";
  const actions = [
    {
      label: "Edit Template",
      link: "/tenant/standards/template?id=[GUID]",
      icon: <Edit />,
      color: "success",
      target: "_self",
    },
    {
      label: "Clone & Edit Template",
      link: "/tenant/standards/template?id=[GUID]&clone=true",
      icon: <CopyAll />,
      color: "success",
      target: "_self",
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
      url: "/api/RemoveStandardTemplate",
      icon: <Delete />,
      data: {
        ID: "GUID",
      },
      confirmText: "Are you sure you want to delete [templateName]?",
      multiPost: false,
    },
  ];
  const conversionApi = ApiPostCall({ relatedQueryKeys: "listStandardTemplates" });

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/listStandardTemplates?type=drift"
      tenantInTitle={false}
      cardButton={
        <Button component={Link} href="../template" startIcon={<AddBox />}>
          Add Template
        </Button>
      }
      actions={actions}
      simpleColumns={["templateName", "updatedAt", "updatedBy"]}
      queryKey="listStandardTemplates-drift"
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
