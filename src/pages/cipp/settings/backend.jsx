import { Container } from "@mui/material";
import { CippIcons } from "../../../utils/icon-registry";
import { Grid } from "@mui/system";
import { TabbedLayout } from "../../../layouts/TabbedLayout";
import { Layout as DashboardLayout } from "../../../layouts/index";
import tabOptions from "./tabOptions";
import { ApiGetCall } from "../../../api/ApiCall.jsx";
import { CippBackendCard } from "../../../components/CippSettings/CippBackendCard";
import { CippCodeBlock } from "../../../components/CippComponents/CippCodeBlock";
import { usePermissions } from "../../../hooks/use-permissions";

const Page = () => {
  const backendComponents = ApiGetCall({
    url: "/api/ExecBackendURLs",
    queryKey: "ExecBackendURLs",
  });
  // CIPP-NG runs as a container web app on an App Service plan; a legacy instance is a function
  // app plus a static web app. The cards and shell commands follow whichever this instance is.
  const { isNg } = usePermissions();
  const results = backendComponents?.data?.Results;
  const shell = (code) => <CippCodeBlock language="powershell" code={code} />;

  const commonCards = [
    {
      id: "ResourceGroup",
      name: "Resource Group",
      description:
        "The Resource group contains all the CIPP resources in your tenant, except the SAM Application",
    },
    {
      id: "KeyVault",
      name: "Key Vault",
      description:
        "The key vault allows you to retrieve saved authentication details. By default you do not have access.",
    },
  ];

  const legacyCards = [
    {
      id: "SWARoles",
      name: "Static Web App (Role Management)",
      description:
        "The Static Web App Role Management allows you to invite other users to the application and manage their permissions.",
    },
    {
      id: "FunctionDeployment",
      name: "Function App (Deployment Center)",
      description:
        "The Function App Deployment Center allows you to monitor your deployment history and connect to GitHub for CI/CD.",
    },
    {
      id: "FunctionConfig",
      name: "Function App (Configuration)",
      description:
        "The Function App Configuration allows you to configure your function app settings.",
    },
    {
      id: "FunctionApp",
      name: "Function App (Overview)",
      description:
        "The Function App Overview allows you to monitor your function app's performance and usage. You can also stop and start the function app here.",
    },
  ];

  // Same ARM site as the legacy function app, so the overview/configuration links are shared.
  const ngCards = [
    {
      id: "FunctionApp",
      name: "Web App (Overview)",
      description:
        "The Web App Overview shows the container's status, performance and usage. You can also stop, start and restart the instance here.",
    },
    {
      id: "FunctionConfig",
      name: "Web App (Configuration)",
      description:
        "The Web App Configuration holds the application settings (environment variables) for this instance.",
    },
    {
      id: "AppServicePlan",
      name: "App Service Plan",
      description:
        "The App Service Plan provides the compute for the web app. Scale it up or out here.",
    },
  ];

  const legacyCommands = {
    FunctionAppConfig: shell(
      `$Function = Get-AzFunctionApp -ResourceGroupName ${results?.RGName} -Name ${results?.FunctionName}; $Function | select Name, Status, Location, Runtime, ApplicationSettings`
    ),
    FunctionAppDeployment: shell(
      `$FunctionDeployment = az webapp deployment source show --resource-group ${results?.RGName} --name ${results?.FunctionName} | ConvertFrom-Json; $FunctionDeployment | Select-Object repoUrl, branch, isGitHubAction, isManualIntegration, githubActionConfiguration`
    ),
    WatchFunctionLogs: shell(
      `az webapp log tail --name ${results?.FunctionName} --resource-group ${results?.RGName}`
    ),
    StaticWebAppConfig: shell(
      `$SWA = Get-AzStaticWebApp -ResourceGroupName ${results?.RGName} -Name ${results?.SWAName}; $SWA | Select-Object Name, CustomDomain, DefaultHostname, RepositoryUrls`
    ),
    ListCIPPUsers: shell(
      `Get-AzStaticWebAppUser -ResourceGroupName ${results?.RGName} -Name ${results?.SWAName} -AuthProvider all | Select-Object DisplayName, Role`
    ),
  };

  const ngCommands = {
    WebAppConfig: shell(
      `$WebApp = Get-AzWebApp -ResourceGroupName ${results?.RGName} -Name ${results?.FunctionName}; $WebApp | Select-Object Name, State, Location, Kind`
    ),
    ContainerConfig: shell(
      `az webapp config container show --resource-group ${results?.RGName} --name ${results?.FunctionName}`
    ),
    WatchWebAppLogs: shell(
      `az webapp log tail --name ${results?.FunctionName} --resource-group ${results?.RGName}`
    ),
  };

  const cloudShellCard = {
    id: "CloudShell",
    name: "Cloud Shell",
    description: "Launch an Azure Cloud Shell Window",
    linkProps: {
      onClick: (e) => {
        e.preventDefault();
        window.open(
          "https://shell.azure.com/powershell",
          "_blank",
          "toolbar=no,scrollbars=yes,resizable=yes,menubar=no,location=no,status=no"
        );
      },
    },
    offcanvas: true,
    offcanvasTitle: "Command Reference",
    offcanvasIcon: <CippIcons.CommandLineIcon />,
    offcanvasData: isNg ? ngCommands : legacyCommands,
  };

  const backendInfo = [...commonCards, ...(isNg ? ngCards : legacyCards), cloudShellCard];

  return (
    <Container sx={{ pt: { xs: 0, md: 3 }, px: { xs: 1.5, md: 3 } }} maxWidth="xl">
      <Grid container spacing={2}>
        {backendInfo.map((item) => (
          <Grid size={{ lg: 4, md: 6, sm: 12, xs: 12 }} key={item.id}>
            <CippBackendCard backendComponents={backendComponents} item={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
);

export default Page;
