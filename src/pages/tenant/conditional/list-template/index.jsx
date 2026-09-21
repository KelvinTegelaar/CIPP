import { Layout as DashboardLayout } from "../../../../layouts/index";
import { CippIcons } from "../../../../utils/icon-registry"
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { Button, Box } from "@mui/material";
import CippJsonView from "../../../../components/CippFormPages/CippJSONView";
import { ApiGetCall } from "../../../../api/ApiCall";
import { CippPolicyImportDrawer } from "../../../../components/CippComponents/CippPolicyImportDrawer.jsx";
import { CippCADeployDrawer } from "../../../../components/CippComponents/CippCADeployDrawer.jsx";
import { CippApiLogsDrawer } from "../../../../components/CippComponents/CippApiLogsDrawer";
import { PermissionButton } from "../../../../utils/permissions";
import { useSettings } from "../../../../hooks/use-settings.js";
import { useState } from "react";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Available Conditional Access Templates";
  const [deployDrawerOpen, setDeployDrawerOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const tenant = useSettings().currentTenant;

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
      icon: <CippIcons.RocketLaunch />,
      color: "success",
    },
    {
      label: "Edit Template",
      link: "/tenant/conditional/list-template/edit?GUID=[GUID]",
      pinned: true,
      icon: <CippIcons.Edit />,
      color: "info",
    },
    {
      label: "Add to package",
      type: "POST",
      url: "/api/ExecSetPackageTag",
      data: { GUID: "GUID" },
      fields: [
        {
          type: "select",
          name: "Package",
          label: "Package Name",
          required: true,
          creatable: true,
          validators: {
            required: { value: true, message: "Package name is required" },
          },
          api: {
            url: "/api/ListCATemplates?mode=Tag",
            queryKey: "ListCATemplates-tag-autocomplete",
            labelField: "label",
            valueField: "value",
          },
        },
      ],
      confirmText: "Select an existing package, or type a new package name.",
      multiPost: true,
      icon: <CippIcons.LocalOffer />,
      color: "info",
    },
    {
      label: "Remove from package",
      type: "POST",
      url: "/api/ExecSetPackageTag",
      data: { GUID: "GUID", Remove: true },
      confirmText: "Are you sure you want to remove the selected template(s) from their package?",
      multiPost: true,
      icon: <CippIcons.LocalOfferOutlined />,
      color: "warning",
    },
    {
      label: "Save to GitHub",
      type: "POST",
      url: "/api/ExecCommunityRepo",
      icon: <CippIcons.GitHub />,
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
      icon: <CippIcons.Delete />,
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
        simpleColumns={["displayName", "source", "package", "GUID"]}
        cardButton={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              component={Link}
              href="/tenant/conditional/list-template/create"
              startIcon={<CippIcons.Add />}
            >
              Create Template
            </Button>
            <CippPolicyImportDrawer mode="ConditionalAccess" />
            <CippApiLogsDrawer
              apiFilter="Conditional|CA Policy|CATemplate|CAPolicy"
              buttonText="View Logs"
              title="Conditional Access Logs"
              PermissionButton={PermissionButton}
              tenantFilter={tenant}
            />
          </Box>
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
