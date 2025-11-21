// this page is going to need some love for accounting for filters: https://github.com/KelvinTegelaar/CIPP/blob/main/src/views/tenant/administration/ListEnterpriseApps.jsx#L83
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { CippTablePage } from "/src/components/CippComponents/CippTablePage.jsx";
import { CippFormComponent } from "/src/components/CippComponents/CippFormComponent.jsx";
import { CertificateCredentialRemovalForm } from "/src/components/CippComponents/CertificateCredentialRemovalForm.jsx";
import {
  Launch,
  Delete,
  Edit,
  Key,
  Security,
  Block,
  CheckCircle,
  ContentCopy,
  RocketLaunch,
} from "@mui/icons-material";
import { usePermissions } from "/src/hooks/use-permissions.js";
import tabOptions from "./tabOptions";
import { Button } from "@mui/material";
import Link from "next/link";

const Page = () => {
  const pageTitle = "Enterprise Applications";
  const apiUrl = "/api/ListGraphRequest";

  const { checkPermissions } = usePermissions();
  const canWriteApplication = checkPermissions(["Tenant.Application.ReadWrite"]);

  const actions = [
    {
      icon: <Launch />,
      label: "View Application",
      link: `https://entra.microsoft.com/[Tenant]/#view/Microsoft_AAD_IAM/ManagedAppMenuBlade/~/Overview/objectId/[id]/appId/[appId]`,
      color: "info",
      target: "_blank",
      multiPost: false,
      external: true,
    },
    {
      icon: <ContentCopy />,
      label: "Create Template from App",
      type: "POST",
      color: "info",
      multiPost: false,
      url: "/api/ExecCreateAppTemplate",
      data: {
        AppId: "appId",
        DisplayName: "displayName",
        Type: "servicePrincipal",
      },
      confirmText:
        "Create a deployment template from '[displayName]'? This will copy all permissions and create a reusable template.",
      condition: (row) => canWriteApplication && row?.signInAudience === "AzureADMultipleOrgs",
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
        Type: "servicePrincipals",
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
        Type: "servicePrincipals",
        Action: "RemoveKey",
      },
      children: ({ formHook, row }) => {
        return <CertificateCredentialRemovalForm formHook={formHook} row={row} />;
      },
      confirmText: "Are you sure you want to remove the selected certificate credentials?",
      condition: (row) => canWriteApplication && row?.keyCredentials?.length > 0,
    },
    {
      icon: <Block />,
      label: "Disable Service Principal",
      type: "POST",
      color: "warning",
      multiPost: false,
      url: "/api/ExecApplication",
      data: {
        Id: "id",
        Type: "servicePrincipals",
        Action: "Update",
        Payload: {
          accountEnabled: false,
        },
      },
      confirmText:
        "Are you sure you want to disable this service principal? Users will not be able to sign in to this application.",
      condition: (row) => canWriteApplication && row?.accountEnabled === true,
    },
    {
      icon: <CheckCircle />,
      label: "Enable Service Principal",
      type: "POST",
      color: "success",
      multiPost: false,
      url: "/api/ExecApplication",
      data: {
        Id: "id",
        Type: "servicePrincipals",
        Action: "Update",
        Payload: {
          accountEnabled: true,
        },
      },
      confirmText: "Are you sure you want to enable this service principal?",
      condition: (row) => canWriteApplication && row?.accountEnabled === false,
    },
    {
      icon: <Delete />,
      label: "Delete Service Principal",
      type: "POST",
      color: "error",
      multiPost: false,
      url: "/api/ExecApplication",
      data: {
        Id: "id",
        Type: "servicePrincipals",
        Action: "Delete",
      },
      confirmText:
        "Are you sure you want to delete this service principal? This will remove the application from this tenant but will not affect the app registration.",
      condition: () => canWriteApplication,
    },
  ];

  const offCanvas = {
    extendedInfoFields: [
      "displayName",
      "createdDateTime",
      "accountEnabled",
      "publisherName",
      "replyUrls",
      "appOwnerOrganizationId",
      "tags",
      "passwordCredentials",
      "keyCredentials",
    ],
    actions: actions,
  };

  const simpleColumns = [
    "info.logoUrl",
    "displayName",
    "appId",
    "accountEnabled",
    "createdDateTime",
    "publisherName",
    "homepage",
    "passwordCredentials",
    "keyCredentials",
  ];

  const apiParams = {
    Endpoint: "servicePrincipals",
    $select:
      "id,appId,displayName,createdDateTime,accountEnabled,homepage,publisherName,signInAudience,replyUrls,verifiedPublisher,info,api,appOwnerOrganizationId,tags,passwordCredentials,keyCredentials",
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
      cardButton={
        <>
          <Button component={Link} href="/tenant/tools/appapproval" startIcon={<RocketLaunch />}>
            Deploy Template
          </Button>
        </>
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
