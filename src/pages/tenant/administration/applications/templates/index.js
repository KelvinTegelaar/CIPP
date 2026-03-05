import { Layout as DashboardLayout } from "../../../../../layouts/index.js";
import { TabbedLayout } from "../../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../../components/CippComponents/CippTablePage.jsx";
import CippPermissionPreview from "../../../../../components/CippComponents/CippPermissionPreview.jsx";
import { Edit, Delete, ContentCopy, Add, GitHub, RocketLaunch } from "@mui/icons-material";
import tabOptions from "../tabOptions";
import { ApiGetCall } from "../../../../../api/ApiCall";
import { Button } from "@mui/material";
import { Stack } from "@mui/system";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Application Templates";
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
    extendedInfoFields: ["TemplateName", "AppType", "AppId", "AppName", "UpdatedBy", "Timestamp"],
    actions: actions,
    children: (row) => {
      // Default to EnterpriseApp for backward compatibility with older templates
      const appType = row.AppType || "EnterpriseApp";

      // Determine the title based on app type
      let title = "Permission Preview";
      if (appType === "GalleryTemplate") {
        title = "Gallery Template Info";
      } else if (appType === "ApplicationManifest") {
        title = "Application Manifest";
      }

      return (
        <CippPermissionPreview
          permissions={appType === "EnterpriseApp" ? row.Permissions : null}
          title={title}
          galleryTemplate={
            appType === "GalleryTemplate"
              ? {
                  label: row.AppName || "Unknown App",
                  value: row.GalleryTemplateId || row.AppId,
                  addedFields: {
                    displayName: row.AppName,
                    applicationId: row.AppId,
                    // Use saved gallery information if available, otherwise provide defaults
                    ...(row.GalleryInformation || {
                      description: `Gallery template for ${row.AppName || "application"}`,
                      publisher: "Microsoft Gallery",
                      categories: ["Application"],
                      supportedSingleSignOnModes: ["saml", "password", "oidc"],
                      supportedProvisioningTypes: ["sync"],
                    }),
                  },
                }
              : null
          }
          applicationManifest={appType === "ApplicationManifest" ? row.ApplicationManifest : null}
          maxHeight="800px"
          showAppIds={true}
        />
      );
    },
  };

  const columns = [
    {
      name: "TemplateName",
      label: "Template Name",
      sortable: true,
    },
    {
      name: "AppType",
      label: "Type",
      sortable: true,
      formatter: (row) => {
        // Default to EnterpriseApp for backward compatibility with older templates
        const appType = row.AppType || "EnterpriseApp";
        if (appType === "GalleryTemplate") {
          return "Gallery Template";
        } else if (appType === "ApplicationManifest") {
          return "Application Manifest";
        } else {
          return "Enterprise App";
        }
      },
    },
    {
      name: "AppId",
      label: "App ID",
      sortable: true,
    },
    {
      name: "AppName",
      label: "App Name",
      sortable: true,
    },
    {
      name: "PermissionSetName",
      label: "Permission Set",
      sortable: true,
      formatter: (row) => {
        // Default to EnterpriseApp for backward compatibility with older templates
        const appType = row.AppType || "EnterpriseApp";
        if (appType === "GalleryTemplate") {
          return "Auto-Consent";
        } else if (appType === "ApplicationManifest") {
          return "Manifest-Defined";
        } else {
          return row.PermissionSetName || "-";
        }
      },
    },
    {
      name: "UpdatedBy",
      label: "Updated By",
      sortable: true,
    },
    {
      name: "Timestamp",
      label: "Last Updated",
      sortable: true,
    },
  ];

  const simpleColumns = [
    "TemplateName",
    "AppType",
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
      tenantInTitle={false}
      queryKey="ListAppApprovalTemplates"
      columns={columns}
      simpleColumns={simpleColumns}
      tableProps={{ keyField: "TemplateId" }}
      actions={actions}
      offCanvas={offCanvas}
      cardButton={
        <Stack direction="row" spacing={2}>
          <Button
            component={Link}
            href="/tenant/administration/applications/templates/add"
            startIcon={<Add />}
            sx={{ mr: 1 }}
          >
            Add Template
          </Button>
          <Button
            component={Link}
            href="/tenant/tools/appapproval"
            startIcon={<RocketLaunch />}
            sx={{ mr: 1 }}
          >
            Deploy Template
          </Button>
        </Stack>
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
