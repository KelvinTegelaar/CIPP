## Prerequisites

For the installation and maintenance, we assume you have some knowledge of GitHub (or Git in general), and have setup the Secure Application Model prior to install. 

* Haven't setup the Secure Application model yet? Check out [this CyberDrain blog post](https://www.cyberdrain.com/connect-to-exchange-online-automated-when-mfa-is-enabled-using-the-secureapp-model/). 
* For a step-by-step guide to setting up the Secure Application Model, see [this Gavsto blog post](https://www.gavsto.com/secure-application-model-for-the-layman-and-step-by-step/).

??? tip "Just the code."
    If you're just looking for the SAM script - you can find it below:

    ```powershell
    # Fill these in with the details of your Azure AD application.
    $ApplicationID = 'ApplicationID'
    $ApplicationSecret = 'Secret' | Convertto-SecureString -AsPlainText -Force
    $TenantID = 'YourTenantID'
    # You don't need to change anything below here.
    $Credential = New-Object System.Management.Automation.PSCredential($ApplicationId, $ApplicationSecret)
    $token = New-PartnerAccessToken -ApplicationId $ApplicationID -Scopes 'https://api.partnercenter.microsoft.com/user_impersonation' -ServicePrincipal -Credential $Credential -Tenant $TenantID -UseAuthorizationCode
    $Exchangetoken = New-PartnerAccessToken -ApplicationId 'a0c73c16-a7e3-4564-9a95-2bdf47383716' -Scopes 'https://outlook.office365.com/.default' -Tenant $TenantID -UseDeviceAuthentication
    Write-Host "================ Secrets ================"
    Write-Host "`$ApplicationID         = $($ApplicationID)"
    Write-Host "`$ApplicationSecret     = $($ApplicationSecret)"
    Write-Host "`$TenantID              = $($TenantID)"
    Write-Host "`$RefreshToken          = $($token.RefreshToken)" -ForegroundColor Blue
    Write-Host "`$ExchangeRefreshToken  = $($ExchangeToken.Refreshtoken)" -ForegroundColor Green
    Write-Host "================ Secrets ================"
    Write-Host "    SAVE THESE IN A SECURE LOCATION     "
    ```


You'll also need the following permissions for your secure application model, to add permissions follow these instructions:

* Go to the [Azure Portal](https://portal.azure.com).
* Click on [**Azure Active Directory**](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview), now click on [**App Registrations**](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps).
* Find your Secure App Model application. You can search based on the Application ID.
* Go to **API Permissions** and click **Add a permission**.
* Choose “Microsoft Graph” and “Delegated permission” or "Application Permissions"
* Add the permission you need
* Finally, click on “Grant Admin Consent” for Company Name.

## Permissions

For full functionality, you'll need the following permissions for your Secure Application Model. You can remove any permissions if you do not want the application to be able to use that functionality.

!!! info "Duplicate Permissions"
    Some permissions may appear to be duplicated in the Delegated and Application permissions tables below. This is *by design* and you do need to add both permissions!

### Delegated Permissions

You'll need to add the following **Delegated permissions**:

| API / Permissions name                                  | Description                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| Application.Read.All                                    | Read applications                                                 |
| Application.ReadWrite.All                               | Read and write all applications                                   |
| AuditLog.Read.All                                       | Read audit log data                                               |
| Channel.Create                                          | Create channels                                                   |
| Channel.ReadBasic.All                                   | Read the names and descriptions of channels                       |
| ChannelMember.Read.All                                  | Read the members of channels                                      |
| ChannelMember.ReadWrite.All                             | Add and remove members from channels                              |
| ChannelMessage.Delete                                   | Delete users' channel messages                                    |
| ChannelMessage.Edit                                     | Edit users' channel messages                                      |
| ChannelMessage.Read.All                                 | Read users' channel messages                                        |
| ChannelMessage.Send                                     | Send channel messages                                             |
| ChannelSettings.Read.All                                | Read the names, descriptions, and settings of channels            |
| ChannelSettings.ReadWrite.All                           | Read and write the names, descriptions, and settings of channels  |
| ConsentRequest.Read.All                                 | Read consent requests                                             |
| Device.Command                                          | Communicate with user devices                                     |
| Device.Read                                             | Read user devices                                                 |
| Device.Read.All                                         | Read all devices                                                  |
| DeviceManagementApps.ReadWrite.All                      | Read and write Microsoft Intune apps                              |
| DeviceManagementConfiguration.ReadWrite.All             | Read and write Microsoft Intune Device Configuration and Policies |
| DeviceManagementManagedDevices.ReadWrite.All            | Read and write Microsoft Intune devices                           |
| DeviceManagementRBAC.ReadWrite.All                      | Read and write Microsoft Intune RBAC settings                     |
| DeviceManagementServiceConfig.ReadWrite.All             | Read and write Microsoft Intune configuration                     |
| Directory.AccessAsUser.All                              | Access directory as the signed in user                            |
| Domain.Read.All                                         | Read domain data                                                  |
| Group.ReadWrite.All                                     | Read and write all groups                                         |
| GroupMember.ReadWrite.All                               | Read and write group memberships                                  |
| Mail.Send                                               | Send mail as a user                                               |
| Mail.Send.Shared                                        | Send mail on behalf of others                                     |
| Member.Read.Hidden                                      | Read hidden memberships                                           |
| Organization.ReadWrite.All                              | Read and write organization information                           |
| Policy.Read.All                                         | Read your organization's policies                                 |
| Policy.ReadWrite.AuthenticationFlows                    | Read and write authentication flow policies                       |
| Policy.ReadWrite.AuthenticationMethod                   | Read and write authentication method policies                     |
| Policy.ReadWrite.Authorization                          | Read and write your organization's authorization policy           |
| Policy.ReadWrite.ConsentRequest                         | Read and write consent request policy                             |
| Policy.ReadWrite.ConditionalAccess                      | Read and write conditional access policy                          |
| Policy.ReadWrite.DeviceConfiguration                    | Read and write your organization's device configuration policies  |
| PrivilegedAccess.Read.AzureResources                    | Read privileged access to Azure resources                         |
| PrivilegedAccess.ReadWrite.AzureResources               | Read and write privileged access to Azure resources               |
| OpenID permissions - profile                            | View users' basic profile                                         |
| Reports.Read.All                                        | Read all usage reports                                            |
| RoleManagement.ReadWrite.Directory                      | Read and write directory RBAC settings                            |
| SecurityActions.ReadWrite.All                           | Read and update your organization's security actions              |
| SecurityEvents.ReadWrite.All                            | Read and update your organization’s security events               |
| ServiceHealth.Read.All                                  | Read service health                                               |
| ServiceMessage.Read.All                                 | Read service announcement messages                                |
| Sites.ReadWrite.All                                     | Edit or delete items in all site collections                      |
| TeamMember.ReadWrite.All                                | Add and remove members from teams                                 |
| TeamMember.ReadWriteNonOwnerRole.All                    | Add and remove members with non-owner role for all teams          |
| TeamsActivity.Read                                      | Read users' teamwork activity feed                                |
| TeamsActivity.Send                                      | Send a teamwork activity as the user                              |
| TeamsApp.Read                                           | Read users' installed Teams apps                                  |
| TeamsApp.Read.All                                       | Read all installed Teams apps                                     |
| TeamsApp.ReadWrite                                      | Manage users' Teams apps                                          |
| TeamsApp.ReadWrite.All                                  | Manage all Teams apps                                             |
| TeamsAppInstallation.ReadForChat                        | Read installed Teams apps in chats                                |
| TeamsAppInstallation.ReadForTeam                        | Read installed Teams apps in teams                                |
| TeamsAppInstallation.ReadForUser                        | Read users' installed Teams apps                                  |
| TeamsAppInstallation.ReadWriteForChat                   | Manage installed Teams apps in chats                              |
| TeamsAppInstallation.ReadWriteForTeam                   | Manage installed Teams apps in teams                              |
| TeamsAppInstallation.ReadWriteForUser                   | Manage users' installed Teams apps                                |
| TeamsAppInstallation.ReadWriteSelfForChat               | Allow the Teams app to manage itself in chats                     |
| TeamsAppInstallation.ReadWriteSelfForTeam               | Allow the app to manage itself in teams                           |
| TeamsAppInstallation.ReadWriteSelfForUser               | Allow the Teams app to manage itself for a user                   |
| TeamSettings.Read.All                                   | Read teams' settings                                              |
| TeamSettings.ReadWrite.All                              | Read and change teams' settings                                   |
| TeamsTab.Create                                         | Create tabs in Microsoft Teams                                    |
| TeamsTab.Read.All                                       | Read tabs in Microsoft Teams                                      |
| TeamsTab.ReadWrite.All                                  | Read and write tabs in Microsoft Teams                            |
| TeamsTab.ReadWriteForChat                               | Allow the Teams app to manage all tabs in chats                   |
| TeamsTab.ReadWriteForTeam                               | Allow the Teams app to manage all tabs in teams                   |
| TeamsTab.ReadWriteForUser                               | Allow the Teams app to manage all tabs for a user                 |
| Team.Create                                             | Create teams                                                      |
| Team.ReadBasic.All                                      | Read the names and descriptions of teams                          |
| ThreatAssessment.ReadWrite.All                          | Read and write threat assessment requests                         |
| UnifiedGroupMember.Read.AsGuest                         | Read unified group memberships as guest                           |
| User.ManageIdentities.All                               | Manage user identities                                            |
| User.Read                                               | Sign in and read user profile                                     |
| User.ReadWrite.All                                      | Read and write all users' full profiles                           |
| UserAuthenticationMethod.Read.All                       | Read all users' authentication methods                            |
| UserAuthenticationMethod.ReadWrite                      | Read and write user authentication methods                        |
| UserAuthenticationMethod.ReadWrite.All                  | Read and write all users' authentication methods                  |

### Application Permissions

You'll need to add the following **Application permissions**:

| API / Permissions name                                  | Description                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| Channel.Create                                          | Create channels                                                   |
| Channel.ReadBasic.All                                   | Read the names and descriptions of channels                       |
| ChannelMember.Read.All                                  | Read the members of channels                                      |
| ChannelMember.ReadWrite.All                             | Add and remove members from channels                              |
| Device.ReadWrite.All                                    | Read and write devices                                            |
| DeviceManagementApps.ReadWrite.All                      | Read and write Microsoft Intune apps                              |
| DeviceManagementConfiguration.ReadWrite.All             | Read and write Microsoft Intune Device Configuration and Policies |
| DeviceManagementManagedDevices.PrivilegedOperations.All | Perform user-impacting remote actions on Microsoft Intune devices |
| DeviceManagementManagedDevices.Read.All                 | Read Microsoft Intune devices                                     |
| DeviceManagementManagedDevices.ReadWrite.All            | Read and write Microsoft Intune devices                           |
| DeviceManagementRBAC.Read.All                           | Read Microsoft Intune RBAC settings                               |
| DeviceManagementRBAC.ReadWrite.All                      | Read and write Microsoft Intune RBAC settings                     |
| DeviceManagementServiceConfig.Read.All                  | Read Microsoft Intune configuration                               |
| DeviceManagementServiceConfig.ReadWrite.All             | Read and write Microsoft Intune configuration                     |
| Directory.Read.All                                      | Read directory data                                               |
| Group.Create                                            | Create groups                                                     |
| Group.Read.All                                          | Read all groups                                                   |
| Group.ReadWrite.All                                     | Read and write all groups                                         |
| GroupMember.ReadWrite.All                               | Read and write group memberships                                  |
| Mail.Send                                               | Send mail as a user                                               |
| Organization.ReadWrite.All                              | Read and write organization information                           |
| Policy.Read.All                                         | Read your organization's policies                                 |
| Policy.ReadWrite.AuthenticationFlows                    | Read and write authentication flow policies                       |
| Policy.ReadWrite.AuthenticationMethod                   | Read and write authentication method policies                     |
| Policy.ReadWrite.ConsentRequest                         | Read and write consent request policy                             |
| Policy.ReadWrite.ConditionalAccess                      | Read and write conditional access policy                          |
| PrivilegedAccess.ReadWrite.AzureADGroup                 | Read and write privileged access to Azure AD groups               |
| Reports.Read.All                                        | Read all usage reports                                            |
| RoleManagement.ReadWrite.Directory                      | Read and write directory RBAC settings                            |
| SecurityEvents.Read.All                                 | Read your organization’s security events                          |
| Sites.FullControl.All                                   | Have full control of all site collections                         |
| Team.ReadBasic.All                                      | Read the names and descriptions of teams                          |
| TeamMember.ReadWrite.All                                | Add and remove members from teams                                 |
| TeamMember.ReadWriteNonOwnerRole.All                    | Add and remove members with non-owner role for all teams          |
| User.ReadWrite.All                                      | Read and write all users' full profiles                           |
| UserAuthenticationMethod.ReadWrite.All                  | Read and write all users' authentication methods                  |

## Getting started with CIPP

You'll need the following to get started;

* Your Secure Application Model information
* A fork of [the CIPP GitHub](https://github.com/KelvinTegelaar/CIPP) repository.
* A fork of [the CIPP API GitHub](https://github.com/KelvinTegelaar/CIPP-API) repository.
* An active Azure Subscription.
* A GitHub Personal Access Token. You can find instructions on what you need and the minimum permissions to do this [in Microsoft's Azure Static Web Apps documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/publish-azure-resource-manager?tabs=azure-cli#create-a-github-personal-access-token). You only need to follow the "Create a GitHub Personal Access Token" section.

## Automated Installation

After you have completed the prerequisites in the [Getting Started](#getting-started-with-cipp) section above, click the button below to run the automated setup. This does most of the work for you. If you don't want to use the automated installer, use the [manual installation instructions](#manual-instructions-here-be-dragons) below, but be warned that this is really not advised, there's a lot of moving parts where one could make a mistake. You will need to use the manual installation instructions if you wish to host your repo in [Azure DevOps](https://dev.azure.com) or on a [GitLab](https://www.gitlab.com) instance.

[![Deploy To Azure](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.svg?sanitize=true)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fmaster%2FDocumentation%2FAzureDeploymentTemplate.json)

### I can't deploy in my region

This is because the Azure Static Web Apps (SWA) component is global by default (it picks the datacenter closest to you) however some regions don't allow deployment. Regions that allow SWA at the moment are Central US, East US 2, East Asia, West Europe and West US 2.  To work around this use the alternative installation button below. This will deploy the Static Web App in Central US region however the SWA will still be served from your nearest datacenter and other parts of CIPP will be located in the region you chose so you won't notice any latency.

[![Deploy To Azure](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.svg?sanitize=true)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fmaster%2FDocumentation%2FAzureDeploymentTemplate_regionoptions.json)

## Adding users to CIPP

After deployment, go to your resource group in Azure and click on your Static Web App (`cipp-swa-xxxx` if using automatic deployment). Click on Role Management and invite the users you want. Currently we support three roles, `reader`, `editor`, and `admin`. More info about the roles can be found on the [Roles](Roles.md) page.

You should now be able to browse to the custom domain or the default domain, and use the CIPP control panel. 

## It's not working, I'm having issues

For the first 30 minutes or more the application will respond pretty slowly, this is because, among other things, the Function App (CIPP-API) has to download PowerShell modules from Microsoft. We can't make this run any faster at this time. If you have waited for at least 30 minutes and things are still not working restart the Azure Function App (Azure Portal > CIPP Resource Group > Function App > Overview > Restart), this solves 99,9% of all issues. Turn it off, turn it on again. ;)

If you are still stuck, check out the [FAQ](FAQ.md) page and if needed - create an issue [on GitHub](https://github.com/KelvinTegelaar/CIPP/issues) or seek help [on the CIPP Discord](https://discord.gg/cyberdrain)

## Updating CIPP

To update CIPP to a new version see the [updating](Updating.md) section of this documentation.

## Adding a custom domain name

At the moment of deployment, the application will use a randomly generated name. To change this, go to your Resource Group in Azure, click on your Static Web App (`cipp-swa-xxxx` if using automatic deployment) and click on Custom Domains. You'll be able to add your own domain name here. [Microsoft Docs - Set up a custom domain with free certificate in Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/custom-domain?tabs=azure-dns)

## Manual Instructions - Here be Dragons

If you don't want to, or can't, install CIPP automatically you can use the following steps to create the required Azure services manually.

### Create an Azure Function host

Create an Azure Function App and upload the data from the CIPP-API to the Azure Function, or attach it to your fork. Each time we update the central repository you must also update your fork to keep current. 

After creating the Azure function, Enable system managed identity for the Azure Function. [Microsoft Docs - How to use managed identities for App Service and Azure Functions](https://docs.microsoft.com/en-us/azure/app-service/overview-managed-identity?toc=%2Fazure%2Fazure-functions%2Ftoc.json&tabs=powershell)

Give the managed identity "Reader" access on the Azure Subscription. [Microsoft Docs - Assign Azure Roles to a managed identity](https://docs.microsoft.com/en-us/azure/role-based-access-control/role-assignments-portal-managed-identity)

### Create an Azure Key Vault

Create an Azure Key Vault and give the system managed identity access to update, read, and create Secrets. This keyvault will be used to store credentials and tokens for the application. [Microsoft Docs - Assign a Key Vault access policy](https://docs.microsoft.com/en-us/azure/key-vault/general/assign-access-policy?tabs=azure-portal)

### Create an Azure Static Web App

Create a premium Azure Static Web App in the Azure portal and use the CIPP repository fork you've made as the source. Each time an update is executed you must pull the latest changes into your fork and push (deploy) these to the Static Web App. This deployment can be automated with GitHub Actions, Azure DevOps Pipelines or GitLab CI/CD (and/or other CI/CD tools).

After creation, perform the following changes:

* Attach the Function App to the Static Web App. [Microsoft Docs - Bring your own functions to Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/functions-bring-your-own)
