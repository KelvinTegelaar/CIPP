// this page is going to need some love for accounting for filters: https://github.com/KelvinTegelaar/CIPP/blob/main/src/views/tenant/administration/ListEnterpriseApps.jsx#L83
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CippFormComponent } from "/src/components/CippComponents/CippFormComponent.jsx";
import { CertificateCredentialRemovalForm } from "/src/components/CippComponents/CertificateCredentialRemovalForm.jsx";
import { Launch, Delete, Edit, Key, Security, Block, CheckCircle } from "@mui/icons-material";
import { usePermissions } from "/src/hooks/use-permissions.js";
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
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/[appId]`,
      color: "info",
      target: "_blank",
      multiPost: false,
      external: true,
    },
    {
      icon: <Launch />,
      label: "View API Permissions",
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/[appId]`,
      color: "info",
      target: "_blank",
      multiPost: false,
      external: true,
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
                  cred.endDateTime
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
      "requiredResourceAccess",
      "web",
      "api",
      "passwordCredentials",
      "keyCredentials",
    ],
    actions: actions,
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
    $select:
      "id,appId,displayName,createdDateTime,signInAudience,disabledByMicrosoftStatus,web,api,requiredResourceAccess,publisherDomain,replyUrls,passwordCredentials,keyCredentials",
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
