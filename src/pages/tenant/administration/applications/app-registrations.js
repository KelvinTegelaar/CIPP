// this page is going to need some love for accounting for filters: https://github.com/KelvinTegelaar/CIPP/blob/main/src/views/tenant/administration/ListEnterpriseApps.jsx#L83
import { Layout as DashboardLayout } from "../../../../layouts/index.js";
import { TabbedLayout } from "../../../../layouts/TabbedLayout";
import { CippTablePage } from "../../../../components/CippComponents/CippTablePage.jsx";
import { CippFormComponent } from "../../../../components/CippComponents/CippFormComponent.jsx";
import { CertificateCredentialRemovalForm } from "../../../../components/CippComponents/CertificateCredentialRemovalForm.jsx";
import CippPermissionPreview from "../../../../components/CippComponents/CippPermissionPreview.jsx";
import { Launch, Delete, Key, Security, ContentCopy } from "@mui/icons-material";
import { usePermissions } from "../../../../hooks/use-permissions.js";
import tabOptions from "./tabOptions";

const Page = () => {
  const pageTitle = "App Registrations";
  const apiUrl = "/api/ListGraphRequest";

  const { checkPermissions } = usePermissions();
  const canWriteApplication = checkPermissions(["Tenant.Application.ReadWrite"]);

  const actions = [
    {
      icon: <Launch />,
      label: "View App Registration",
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/[appId]/isMSAApp/`,
      color: "info",
      target: "_blank",
      multiPost: false,
      external: true,
    },
    {
      icon: <Launch />,
      label: "View API Permissions",
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/[appId]/isMSAApp/`,
      color: "info",
      target: "_blank",
      multiPost: false,
      external: true,
    },
    {
      icon: <ContentCopy />,
      label: "Create Enterprise App Template (Multi-Tenant)",
      type: "POST",
      color: "info",
      multiPost: false,
      url: "/api/ExecCreateAppTemplate",
      data: {
        AppId: "appId",
        DisplayName: "displayName",
        Type: "application",
      },
      fields: [
        {
          type: "switch",
          name: "Overwrite",
          label: "Overwrite Existing Template",
        },
      ],
      confirmText:
        "Create a deployment template from '[displayName]'? This will copy all permissions and create a reusable template. If you run this from a customer tenant, the App Registration will first be copied to the partner tenant as a multi-tenant app.",
      condition: (row) => canWriteApplication && !row?.applicationTemplateId,
    },
    {
      icon: <ContentCopy />,
      label: "Create Manifest Template (Single-Tenant)",
      type: "POST",
      color: "success",
      multiPost: false,
      url: "/api/ExecAppApprovalTemplate",
      confirmText:
        "Create a manifest template from '[displayName]'? This will create a reusable template that can be deployed as a single-tenant app in any tenant.",
      fields: [
        {
          label: "Template Name",
          name: "TemplateName",
          type: "textField",
          placeholder: "Enter a name for the template",
          required: true,
          validators: {
            required: { value: true, message: "Template name is required" },
          },
        },
      ],
      customDataformatter: (row, action, formData) => {
        const propertiesToRemove = [
          "appId",
          "id",
          "createdDateTime",
          "deletedDateTime",
          "publisherDomain",
          "servicePrincipalLockConfiguration",
          "identifierUris",
          "applicationIdUris",
          "keyCredentials",
          "passwordCredentials",
          "Tenant",
          "CippStatus",
        ];

        const cleanManifest = { ...row };
        propertiesToRemove.forEach((prop) => {
          delete cleanManifest[prop];
        });

        return {
          Action: "Save",
          TemplateName: formData.TemplateName,
          AppType: "ApplicationManifest",
          AppName: row.displayName || row.appId,
          ApplicationManifest: cleanManifest,
        };
      },
      confirmText: "Are you sure you want to create a template from this app registration?",
      condition: (row) =>
        canWriteApplication && row.signInAudience === "AzureADMyOrg" && !row?.applicationTemplateId,
    },
    {
      icon: <Key />,
      label: "Remove Password Credentials",
      type: "POST",
      color: "warning",
      multiPost: false,
      url: "/api/ExecApplication",
      data: {
        Id: "id",
        Type: "applications",
        Action: "RemovePassword",
      },
      children: ({ formHook, row }) => {
        return (
          <CippFormComponent
            name="KeyIds"
            formControl={formHook}
            type="autoComplete"
            label="Select Password Credentials to Remove"
            multiple
            creatable={false}
            validators={{ required: "Please select at least one password credential" }}
            options={
              row?.passwordCredentials?.map((cred) => ({
                label: `${cred.displayName || "Unnamed"} (Expiration: ${new Date(
                  cred.endDateTime,
                ).toLocaleDateString()})`,
                value: cred.keyId,
              })) || []
            }
          />
        );
      },
      confirmText: "Are you sure you want to remove the selected password credentials?",
      condition: (row) => canWriteApplication && row?.passwordCredentials?.length > 0,
    },
    {
      icon: <Security />,
      label: "Remove Certificate Credentials",
      type: "POST",
      color: "warning",
      multiPost: false,
      url: "/api/ExecApplication",
      data: {
        Id: "id",
        Type: "applications",
        Action: "RemoveKey",
      },
      children: ({ formHook, row }) => {
        return <CertificateCredentialRemovalForm formHook={formHook} row={row} />;
      },
      confirmText: "Are you sure you want to remove the selected certificate credentials?",
      condition: (row) => canWriteApplication && row?.keyCredentials?.length > 0,
    },
    {
      icon: <Delete />,
      label: "Delete App Registration",
      type: "POST",
      color: "error",
      multiPost: false,
      url: "/api/ExecApplication",
      data: {
        Id: "id",
        Type: "applications",
        Action: "Delete",
      },
      confirmText:
        "Are you sure you want to delete this application registration? This action cannot be undone.",
      condition: () => canWriteApplication,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "id",
      "appId",
      "createdDateTime",
      "signInAudience",
      "disabledByMicrosoftStatus",
      "replyUrls",
      "passwordCredentials",
      "keyCredentials",
    ],
    actions: actions,
    children: (row) => {
      return (
        <CippPermissionPreview
          applicationManifest={row}
          title="Application Manifest"
          maxHeight="800px"
          showAppIds={true}
        />
      );
    },
  };

  const simpleColumns = [
    "displayName",
    "appId",
    "createdDateTime",
    "signInAudience",
    "web.redirectUris",
    "publisherDomain",
    "passwordCredentials",
    "keyCredentials",
  ];

  const apiParams = {
    Endpoint: "applications",
    $count: true,
    $top: 999,
  };

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl={apiUrl}
      apiData={apiParams}
      apiDataKey="Results"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={simpleColumns}
    />
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
