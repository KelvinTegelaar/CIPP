import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { Edit, Delete, ContentCopy, Add } from "@mui/icons-material";
import tabOptions from "../tabOptions";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Permission Sets";
  const apiUrl = "/api/ExecAppPermissionTemplate";

  const actions = [
    {
      icon: <Edit />,
      label: "Edit Permission Set",
      color: "warning",
      link: "/tenant/administration/applications/permission-sets/edit?template=[TemplateId]&name=[TemplateName]",
    },
    {
      icon: <ContentCopy />,
      label: "Copy Permission Set",
      color: "info",
      link: "/tenant/administration/applications/permission-sets/add?template=[TemplateId]&copy=true&name=[TemplateName]",
    },
    {
      icon: <Delete />,
      label: "Delete Permission Set",
      color: "danger",
      url: apiUrl,
      data: {
        Action: "Delete",
        TemplateId: "TemplateId",
      },
      type: "POST",
      confirmText: "Are you sure you want to delete [TemplateName]?",
    },
  ];

  const offCanvas = {
    extendedInfoFields: ["TemplateName", "Permissions", "UpdatedBy", "Timestamp"],
    actions: actions,
  };

  const simpleColumns = ["TemplateName", "Permissions", "UpdatedBy", "Timestamp"];

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      queryKey="ExecAppPermissionTemplate"
      simpleColumns={simpleColumns}
      tableProps={{ keyField: "TemplateId" }}
      actions={actions}
      offCanvas={offCanvas}
      cardButton={
        <Button
          component={Link}
          href="/tenant/administration/applications/permission-sets/add"
          startIcon={<Add />}
        >
          Add Permission Set
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
