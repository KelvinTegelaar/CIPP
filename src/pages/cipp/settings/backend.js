import { Container } from "@mui/material";
import { Grid } from "@mui/system";
import { TabbedLayout } from "/src/layouts/TabbedLayout";
import { Layout as DashboardLayout } from "/src/layouts/index.js";
import tabOptions from "./tabOptions";
import { ApiGetCall } from "/src/api/ApiCall.jsx";
import { CippBackendCard } from "/src/components/CippSettings/CippBackendCard";
import { CippCodeBlock } from "/src/components/CippComponents/CippCodeBlock";
import { CommandLineIcon } from "@heroicons/react/24/outline";

const Page = () => {
  const backendComponents = ApiGetCall({
    url: "/api/ExecBackendURLs",
    queryKey: "ExecBackendURLs",
  });
  const backendInfo = [
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
    {
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
      offcanvasIcon: <CommandLineIcon />,
      offcanvasData: {
        FunctionAppConfig: (
          <CippCodeBlock
            language="powershell"
            code={`$Function = Get-AzFunctionApp -ResourceGroupName ${backendComponents?.data?.Results?.RGName} -Name ${backendComponents?.data?.Results?.FunctionName}; $Function | select Name, Status, Location, Runtime, ApplicationSettings`}
          />
        ),
        FunctionAppDeployment: (
          <CippCodeBlock
            language="powershell"
            code={`$FunctionDeployment = az webapp deployment source show --resource-group ${backendComponents?.data?.Results?.RGName} --name ${backendComponents?.data?.Results?.FunctionName} | ConvertFrom-Json; $FunctionDeployment | Select-Object repoUrl, branch, isGitHubAction, isManualIntegration, githubActionConfiguration`}
          />
        ),
        WatchFunctionLogs: (
          <CippCodeBlock
            language="powershell"
            code={`az webapp log tail --name ${backendComponents?.data?.Results?.FunctionName} --resource-group ${backendComponents?.data?.Results?.RGName}`}
          />
        ),
        StaticWebAppConfig: (
          <CippCodeBlock
            language="powershell"
            code={`$SWA = Get-AzStaticWebApp -ResourceGroupName ${backendComponents?.data?.Results?.RGName} -Name ${backendComponents?.data?.Results?.SWAName}; $SWA | Select-Object Name, CustomDomain, DefaultHostname, RepositoryUrls`}
          />
        ),
        ListCIPPUsers: (
          <CippCodeBlock
            language="powershell"
            code={`Get-AzStaticWebAppUser -ResourceGroupName ${backendComponents?.data?.Results?.RGName} -Name ${backendComponents?.data?.Results?.SWAName} -AuthProvider all | Select-Object DisplayName, Role`}
          />
        ),
      },
    },
  ];
  return (
    <Container sx={{ pt: 3 }} maxWidth="xl">
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
