import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { TabbedLayout } from "../../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../../components/CippComponents/CippTablePage.jsx";
import { Edit, Delete, ContentCopy, Add } from "@mui/icons-material";
import tabOptions from "../tabOptions";
import { Button } from "@mui/material";
import Link from "next/link";
import { CippPermissionSetDrawer } from "../../../../../components/CippComponents/CippPermissionSetDrawer";
import { useRef } from "react";

const Page = () => {
  const pageTitle = "Permission Sets";
  const apiUrl = "/api/ExecAppPermissionTemplate";
  const tableRef = useRef();

  const handlePermissionSetSuccess = () => {
    // Refresh the table after successful create/edit
    if (tableRef.current) {
      tableRef.current.refreshData();
    }
  };

  const actions = [
    {
      icon: <Edit />,
      label: "Edit Permission Set",
      color: "warning",
      customComponent: (row, { drawerVisible, setDrawerVisible }) => (
        <CippPermissionSetDrawer
          isEditMode={true}
          templateId={row.TemplateId}
          onSuccess={handlePermissionSetSuccess}
          drawerVisible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
        />
      ),
      multiPost: false,
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
      ref={tableRef}
      title={pageTitle}
      apiUrl={apiUrl}
      queryKey="ExecAppPermissionTemplate"
      simpleColumns={simpleColumns}
      tableProps={{ keyField: "TemplateId" }}
      actions={actions}
      offCanvas={offCanvas}
      cardButton={
        <CippPermissionSetDrawer
          buttonText="Add Permission Set"
          isEditMode={false}
          onSuccess={handlePermissionSetSuccess}
        />
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
