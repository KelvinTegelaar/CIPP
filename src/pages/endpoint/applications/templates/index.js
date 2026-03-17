import { useState } from "react";
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Edit, RocketLaunch } from "@mui/icons-material";
import { CippAppTemplateDrawer } from "../../../../components/CippComponents/CippAppTemplateDrawer";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { Box } from "@mui/material";

const Page = () => {
  const pageTitle = "Application Templates";
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);

  const actions = [
    {
      label: "Edit Template",
      icon: <Edit />,
      color: "info",
      noConfirm: true,
      customFunction: (row) => {
        setEditTemplate({ ...row });
        setEditDrawerOpen(true);
      },
    },
    {
      label: "Deploy Template",
      type: "POST",
      url: "/api/ExecDeployAppTemplate",
      icon: <RocketLaunch />,
      color: "info",
      fields: [
        {
          type: "autoComplete",
          name: "selectedTenants",
          label: "Select Tenants",
          multiple: true,
          creatable: false,
          api: {
            url: "/api/ListTenants?AllTenantSelector=true",
            queryKey: "ListTenants-AppTemplateDeploy",
            labelField: (tenant) => `${tenant.displayName} (${tenant.defaultDomainName})`,
            valueField: "defaultDomainName",
            addedField: {
              customerId: "customerId",
              defaultDomainName: "defaultDomainName",
            },
          },
          validators: { required: "Please select at least one tenant" },
        },
        {
          type: "radio",
          name: "AssignTo",
          label: "Override Assignment (optional)",
          options: [
            { label: "Keep template assignment", value: "" },
            { label: "Do not assign", value: "On" },
            { label: "Assign to all users", value: "allLicensedUsers" },
            { label: "Assign to all devices", value: "AllDevices" },
            { label: "Assign to all users and devices", value: "AllDevicesAndUsers" },
            { label: "Assign to Custom Group", value: "customGroup" },
          ],
        },
        {
          type: "textField",
          name: "customGroup",
          label: "Custom Group Names (comma separated, wildcards allowed)",
        },
      ],
      customDataformatter: (row, action, formData) => ({
        templateId: row.GUID,
        selectedTenants: (formData?.selectedTenants || []).map((t) => ({
          defaultDomainName: t.value,
          customerId: t.addedFields?.customerId,
        })),
        AssignTo: formData?.AssignTo || "",
        customGroup: formData?.customGroup || "",
      }),
      confirmText: 'Deploy "[displayName]" ([appCount] apps) to the selected tenants?',
    },
    {
      label: "Delete Template",
      type: "POST",
      url: "/api/RemoveAppTemplate",
      data: { ID: "GUID" },
      confirmText: 'Delete the template "[displayName]"?',
      icon: <TrashIcon />,
      color: "danger",
    },
  ];

  const offCanvas = {
    children: (row) => <CippJsonView object={row} type="intune" defaultOpen={true} />,
    size: "lg",
  };

  return (
    <>
      <CippTablePage
        title={pageTitle}
        tenantInTitle={false}
        apiUrl="/api/ListAppTemplates"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={["displayName", "description", "appCount", "appTypes", "appNames"]}
        queryKey="ListAppTemplates"
        cardButton={
          <Box sx={{ display: "flex", gap: 1 }}>
            <CippAppTemplateDrawer />
          </Box>
        }
      />
      <CippAppTemplateDrawer
        editData={editTemplate}
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setEditTemplate(null);
        }}
      />
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
