<p align="center"><a href="https://cyberdrain.com" target="_blank" rel="noopener noreferrer"><img src="../assets/img/CyberDrain.png" alt="CyberDrain Logo"></a></p>

# Prerequisites

For the installation and maintenance, we assume you have some knowledge of Github, and have setup the Secure Application Model prior to install. Haven't setup the Secure Application model yet? Check out [this](https://www.cyberdrain.com/connect-to-exchange-online-automated-when-mfa-is-enabled-using-the-secureapp-model/) script. For a step-by-step guide of how setting up the Secure Application Model, see [this](https://www.gavsto.com/secure-application-model-for-the-layman-and-step-by-step/).

You'll also need the following permissions for your secure application model, to add permissions follow these instructions:

- Go to the Azure Portal.
- Click on Azure Active Directory, now click on “App Registrations”.
- Find your Secure App Model application. You can search based on the ApplicationID.
- Go to “API Permissions” and click Add a permission.
- Choose “Microsoft Graph” and “Delegated permission” or "Application Permissions"
- Add the permission you need.
- Finally, click on “Grant Admin Consent” for Company Name.

## Permissions

For full functionality, you'll need the following permissions for your Secure Application Model. You can remove any permissions if you do not want the application to be able to use that functionality.

| API / Permissions name                                  | Type                   | Description                                                       |
| ------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------- |
| Application.Read.All                                    | Delegated              | Read applications                                                 |
| Application.ReadWrite.All                               | Delegated              | Read and write all applications                                   |
| AuditLog.Read.All                                       | Delegated              | Read audit log data                                               |
| Channel.Create                                          | Delegated, Application | Create channels                                                   |
| Channel.ReadBasic.All                                   | Delegated, Application | Read the names and descriptions of channels                       |
| ChannelMember.Read.All                                  | Delegated, Application | Read the members of channels                                      |
| ChannelMember.ReadWrite.All                             | Delegated, Application | Add and remove members from channels                              |
| Device.Command                                          | Delegated              | Communicate with user devices                                     |
| Device.Read                                             | Delegated              | Read user devices                                                 |
| Device.Read.All                                         | Delegated              | Read all devices                                                  |
| Device.ReadWrite.All                                    | Application            | Read and write devices                                            |
| DeviceManagementApps.ReadWrite.All                      | Delegated, Application | Read and write Microsoft Intune apps                              |
| DeviceManagementConfiguration.ReadWrite.All             | Delegated, Application | Read and write Microsoft Intune Device Configuration and Policies |
| DeviceManagementManagedDevices.PrivilegedOperations.All | Application            | Perform user-impacting remote actions on Microsoft Intune devices |
| DeviceManagementManagedDevices.Read.All                 | Application            | Read Microsoft Intune devices                                     |
| DeviceManagementManagedDevices.ReadWrite.All            | Delegated, Application | Read and write Microsoft Intune devices                           |
| DeviceManagementRBAC.Read.All                           | Application            | Read Microsoft Intune RBAC settings                               |
| DeviceManagementRBAC.ReadWrite.All                      | Delegated, Application | Read and write Microsoft Intune RBAC settings                     |
| DeviceManagementServiceConfig.Read.All                  | Application            | Read Microsoft Intune configuration                               |
| DeviceManagementServiceConfig.ReadWrite.All             | Delegated, Application | Read and write Microsoft Intune configuration                     |
| Directory.AccessAsUser.All                              | Delegated              | Access directory as the signed in user                            |
| Directory.Read.All                                      | Application            | Read directory data                                               |
| Domain.Read.All                                         | Delegated              | Read domain data                            |
| Group.Create                                            | Application            | Create groups                                                     |
| Group.Read.All                                          | Application            | Read all groups                                                   |
| Group.ReadWrite.All                                     | Delegated, Application | Read and write all groups                                         |
| GroupMember.ReadWrite.All                               | Delegated, Application | Read and write group memberships                                  |
| Mail.Send                                               | Delegated, Application | Send mail as a user                                               |
| Mail.Send.Shared                                        | Delegated              | Send mail on behalf of others                                     |
| Member.Read.Hidden                                      | Delegated              | Read hidden memberships                                           |
| Organization.ReadWrite.All                              | Delegated, Application | Read and write organization information                           |
| Policy.Read.All                                         | Delegated, Application | Read your organization's policies                                 |
| Policy.ReadWrite.AuthenticationFlows                    | Delegated, Application | Read and write authentication flow policies                       |
| Policy.ReadWrite.AuthenticationMethod                   | Delegated, Application | Read and write authentication method policies                     |
| Policy.ReadWrite.Authorization                          | Delegated              | Read and write your organization's authorization policy           |
| Policy.ReadWrite.ConsentRequest                         | Delegated, Application | Read and write consent request policy                             |
| Policy.ReadWrite.ConditionalAccess                      | Delegated, Application | Read and write conditional access policy
| Policy.ReadWrite.DeviceConfiguration                    | Delegated              | Read and write your organization's device configuration policies  |
| PrivilegedAccess.Read.AzureResources                    | Delegated              | Read privileged access to Azure resources                         |
| PrivilegedAccess.ReadWrite.AzureADGroup                 | Application            | Read and write privileged access to Azure AD groups               |
| PrivilegedAccess.ReadWrite.AzureResources               | Delegated              | Read and write privileged access to Azure resources               |
| OpenID permissions - profile                            | Delegated              | View users' basic profile                                         |
| Reports.Read.All                                        | Delegated, Application | Read all usage reports                                            |
| RoleManagement.ReadWrite.Directory                      | Delegated, Application | Read and write directory RBAC settings                            |
| SecurityActions.ReadWrite.All                           | Delegated              | Read and update your organization's security actions              |
| SecurityEvents.Read.All                                 | Application            | Read your organization’s security events                          |
| SecurityEvents.ReadWrite.All                            | Delegated              | Read and update your organization’s security events               |
| Sites.FullControl.All                                   | Application            | Have full control of all site collections                         |
| Sites.ReadWrite.All                                     | Delegated              | Edit or delete items in all site collections                      |
| Team.Create                                             | Delegated              | Create teams                                                      |
| Team.ReadBasic.All                                      | Delegated, Application | Read the names and descriptions of teams                          |
| TeamMember.ReadWrite.All                                | Delegated, Application | Add and remove members from teams                                 |
| TeamMember.ReadWriteNonOwnerRole.All                    | Delegated, Application | Add and remove members with non-owner role for all teams          |
| User.ManageIdentities.All                               | Delegated              | Manage user identities                                            |
| User.ReadWrite.All                                      | Delegated, Application | Read and write all users' full profiles                           |
| UserAuthenticationMethod.Read.All                       | Delegated              | Read all users' authentication methods                            |
| UserAuthenticationMethod.ReadWrite                      | Delegated              | Read and write user authentication methods                        |
| UserAuthenticationMethod.ReadWrite.All                  | Delegated, Application | Read and write all users' authentication methods.                 


## Getting started

You'll need the following to get started;

- Your Secure Application Model information
- A fork of [this](https://github.com/KelvinTegelaar/CIPP) repo
- A fork of [this](https://github.com/KelvinTegelaar/CIPP-API) repo
- An active Azure Subscription
- A GitHub personal access token. You can find instructions on what you need and the minimum permissions to do this [here](https://docs.microsoft.com/en-us/azure/static-web-apps/publish-azure-resource-manager?tabs=azure-cli#create-a-github-personal-access-token). You only need to follow the "Create a GitHub personal access token" section

# Automated setup

Click here to run the automated setup. This does most of the work for you. If you don't want to use the automated installer, use the instructions below, but be warned that this is really not advised, there's a lot of moving parts where one could make a mistake.

[![Deploy To Azure](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.svg?sanitize=true)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fmaster%2FDocumentation%2FAzureDeploymentTemplate.json)

The first 20 minutes the application can respond pretty slow, this is due to downloading some PowerShell modules from Microsoft. I can't make that any faster but just note before you get started. :)

For updating the application, check out our updating document [here](/documentation/updating.md)

## It's not working, I'm having issues

Before you create an issue, please restart both the Static Web App and Azure Function host, this solves 99,9% of all issues. Turn it off, turn it on again. ;)

Another option is that you've deployed your Secure Application Model incorrectly. You must use the script in the blog above to be 100% sure it has been created as expected. You can use the script below to check what's going on.

```powershell
$ApplicationId = 'xxxx-xxxx-xxx-xxxx-xxxx'
$ApplicationSecret = 'TheSecretTheSecrey' | ConvertTo-SecureString -AsPlainText -Force
$TenantID = 'YourTenantID'
$RefreshToken = 'RefreshToken'
$ExchangeRefreshToken = 'ExchangeRefreshToken'
$upn = 'UPN-Used-To-Generate-Tokens'
$credential = New-Object System.Management.Automation.PSCredential($ApplicationId, $ApplicationSecret)
 
$aadGraphToken = New-PartnerAccessToken -ApplicationId $ApplicationId -Credential $credential -RefreshToken $refreshToken -Scopes 'https://graph.windows.net/.default' -ServicePrincipal -Tenant $tenantID
$graphToken = New-PartnerAccessToken -ApplicationId $ApplicationId -Credential $credential -RefreshToken $refreshToken -Scopes 'https://graph.microsoft.com/.default' -ServicePrincipal -Tenant $tenantID
 
Connect-MsolService -AdGraphAccessToken $aadGraphToken.AccessToken -MsGraphAccessToken $graphToken.AccessToken
$customers = Get-MsolPartnerContract -All
foreach ($customer in $customers) {
    try {
        $Baseuri = "https://graph.microsoft.com/beta"
        $CustGraphToken = New-PartnerAccessToken -ApplicationId $ApplicationId -Credential $credential -RefreshToken $refreshToken -Scopes "https://graph.microsoft.com/.default" -ServicePrincipal -Tenant $customer.customerid
        $Header = @{
            Authorization = "Bearer $($CustGraphToken.AccessToken)"
        }
        $SecureDefaultsState = (Invoke-RestMethod -Uri "$baseuri/policies/identitySecurityDefaultsEnforcementPolicy" -Headers $Header -Method get -ContentType "application/json")

    }
    catch {
        Write-Error "Could not connect to Graph API for $($customer.DefaultDomainName). $_"
    }
    try {

        $token = New-PartnerAccessToken -ApplicationId 'a0c73c16-a7e3-4564-9a95-2bdf47383716'-RefreshToken $ExchangeRefreshToken -Scopes 'https://outlook.office365.com/.default' -Tenant $customer.TenantId
        $tokenValue = ConvertTo-SecureString "Bearer $($token.AccessToken)" -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($upn, $tokenValue)
        $customerId = $customer.DefaultDomainName
        $session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri "https://ps.outlook.com/powershell-liveid?DelegatedOrg=$($customerId)&BasicAuthToOAuthConversion=true" -Credential $credential -Authentication Basic -AllowRedirection
        $session = Import-PSSession $session
        #From here you can enter your own commands
        $Exchange = get-mailbox
        #end of commands
        $PSSession = Remove-PSSession $session
    }
    catch {
        Write-Error "Could not connect to Exchange for $($customer.DefaultDomainName). $_"
    }
}
```

## I can't deploy in my region

This is most likely because of the Azure Static Web Apps component. This component is global by default (it picks the datacenter closest to you.) but some regions don't allow deployment. Use the alternative installation button. This will deploy in Central US; but the app will still be located in your nearest datacenter so you won't notice any latency.

[![Deploy To Azure](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.svg?sanitize=true)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fmaster%2FDocumentation%2FAzureDeploymentTemplate_regionoptions.json)
# Adding a custom domain name

At the moment of deployment, the application will use a randomly generated name. To change this, go to your Resource Group in Azure, click on cipp-swa-xxxx and click on Custom Domains. You'll be able to add your own domain name here.
# Adding users to allow the usage of the CIPP

After deployment, go to your resource group in Azure and click on cipp-swa-xxxx. Click on Role Management and invite the users you want. Currently we only support the "reader" role, so make sure you enter that in the roles field.

# Manual instructions
## Create Azure Function host

Create an Azure Function and upload the data from the CIPP-API to the Azure Function, or attach it to your fork. Each time we update the central repository you must also update your fork to keep current. 

After creating the Azure function, Enable the system managed identity for the Azure Function.

Give the managed identity "Reader" access on the subscription

## Create an Azure Keyvault

Create an Azure Keyvault and give the system managed identity access to update, read, and create Secrets. This keyvault will be used to store credentials and tokens for the application.

## Create an Azure Static Web App

Create a Premium Azure Static WebApp in the Azure portal and use the CIPP Repo fork you've made as the source. Each time an update is executed you must create a pull based on the latest version to upgrade the frontend.

After creation, perform the following changes:
- Attach the Function App to the functions
- Add your own custom domain name

You should now be able to browse to the custom domain or the default domain, and use the CIPP control panel.
