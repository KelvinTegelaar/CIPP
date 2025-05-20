import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Edit, Delete, ContentCopy, Add } from "@mui/icons-material";
import tabOptions from "../tabOptions";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Templates";
  const apiUrl = "/api/ListAppDeploymentTemplates";

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
      icon: <Delete />,
      label: "Delete Template",
      color: "danger",
      url: "/api/ExecAppDeploymentTemplate",
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
      queryKey="ListAppDeploymentTemplates"
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
