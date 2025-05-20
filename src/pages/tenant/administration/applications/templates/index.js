import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Edit, Delete, ContentCopy, Add, GitHub } from "@mui/icons-material";
import tabOptions from "../tabOptions";
import { Button } from "@mui/material";
import Link from "next/link";
import { ApiGetCall } from "/src/api/ApiCall";

const Page = () => {
  const pageTitle = "Templates";
  const apiUrl = "/api/ListAppApprovalTemplates";

  // Fetch GitHub integration status
  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const actions = [
    {
      icon: <Edit />,
      label: "Edit Template",
      color: "warning",
      link: "/tenant/administration/applications/templates/edit?template=[TemplateId]&name=[TemplateName]",
    },
    {
      icon: <ContentCopy />,
      label: "Copy Template",
      color: "info",
      link: "/tenant/administration/applications/templates/add?template=[TemplateId]&copy=true&name=[TemplateName]",
    },
    {
      icon: <GitHub />,
      label: "Save to GitHub",
      type: "POST",
      url: "/api/ExecCommunityRepo",
      data: {
        Action: "UploadTemplate",
        GUID: "TemplateId",
        TemplateType: "AppApproval",
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
      icon: <Delete />,
      label: "Delete Template",
      color: "danger",
      url: "/api/ExecAppApprovalTemplate",
      data: {
        Action: "Delete",
        TemplateId: "TemplateId",
      },
      type: "POST",
      confirmText: "Are you sure you want to delete [TemplateName]?",
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "TemplateName",
      "AppId",
      "AppName",
      "PermissionSetName",
      "UpdatedBy",
      "Timestamp",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "TemplateName",
    "AppId",
    "AppName",
    "PermissionSetName",
    "UpdatedBy",
    "Timestamp",
  ];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      queryKey="ListAppApprovalTemplates"
      simpleColumns={simpleColumns}
      tableProps={{ keyField: "TemplateId" }}
      actions={actions}
      offCanvas={offCanvas}
      cardButton={
        <Button
          component={Link}
          href="/tenant/administration/applications/templates/add"
          startIcon={<Add />}
        >
          Add App Approval Template
        </Button>
      }
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
