import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Button } from "@mui/material";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { Delete, GitHub, Edit, RocketLaunch } from "@mui/icons-material";
import { ApiGetCall } from "/src/api/ApiCall";
import { CippPolicyImportDrawer } from "/src/components/CippComponents/CippPolicyImportDrawer.jsx";
import { CippCADeployDrawer } from "/src/components/CippComponents/CippCADeployDrawer.jsx";
import { useState } from "react";

const Page = () => {
  const pageTitle = "Available Conditional Access Templates";
  const [deployDrawerOpen, setDeployDrawerOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const integrations = ApiGetCall({
    url: "/api/ListExtensionsConfig",
    queryKey: "Integrations",
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const handleDeployTemplate = (row) => {
    setSelectedTemplateId(row.GUID);
    setDeployDrawerOpen(true);
  };
  const actions = [
    {
      label: "Deploy Template",
      customFunction: handleDeployTemplate,
      noConfirm: true,
      icon: <RocketLaunch />,
      color: "success",
    },
    {
      label: "Edit Template",
      link: "/tenant/conditional/list-template/edit?GUID=[GUID]",
      icon: <Edit />,
      color: "info",
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
      url: "/api/RemoveCATemplate",
      icon: <Delete />,
      data: { ID: "GUID" },
      confirmText: "Do you want to delete the template?",
      multiPost: false,
    },
  ];

  const offCanvas = {
    children: (row) => <CippJsonView object={row} defaultOpen={true} />,
    size: "xl",
  };
  return (
    <>
      <CippTablePage
        title={pageTitle}
        tenantInTitle={false}
        apiUrl="/api/ListCATemplates"
        queryKey="ListCATemplates-table"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={["displayName", "GUID"]}
        cardButton={
          <>
            <Button key="template-lib" href="/cipp/template-library" title="Add Template Library" />
            <CippPolicyImportDrawer mode="ConditionalAccess" />
          </>
        }
      />
      <CippCADeployDrawer
        open={deployDrawerOpen}
        onClose={() => setDeployDrawerOpen(false)}
        templateId={selectedTemplateId}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
