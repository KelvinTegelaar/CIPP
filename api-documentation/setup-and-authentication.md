---
description: API Authentication
---

# Setup & Authentication

## CIPP-API Setup

### Permissions

If you are coming from v7.1.x or earlier, your Function App identity needs the "Contributor" role assigned to itself ([do this with PowerShell](setup-and-authentication.md#update-the-function-app-role-assignment-with-powershell))

1. Sign in to the Azure portal: [https://portal.azure.com/](https://portal.azure.com/)
2. Find your CIPP resource group.
3. Open the main Function App (this would not be an offloaded Function App if you have multiple).
4. In the left-hand menu of the subscription, select "Access control (IAM)".
5. At the top of the Access control (IAM) pane, click "+ Add" .
6. In the drop-down menu, select "Add role assignment".
7. Click on Privileged administrator roles.
8. In the "Role" table, select "Contributor". The Contributor role should allow the identity to create and manage all types of Azure resources but does not allow them to grant access to others.
9. In the "Assign access to" drop-down menu, select "User, group, or service principal".
10. In the "Select" field and type "cipp". As you begin typing, the list of options will narrow and you should see the Managed Identity for your Function App.
11. After you've selected the identity, click "Save" to assign the role.

#### Update the Function App Role Assignments with PowerShell

{% embed url="https://shell.azure.com/powershell" fullWidth="false" %}
This script can be run in Azure Cloud Shell. Click the link to be taken to the Azure Portal.
{% endembed %}

```powershell
$RGName = Read-Host -Prompt "Resource Group Name"
Connect-AzAccount
$Functions = Get-AzResource -ResourceGroupName $RGName -ResourceType 'Microsoft.Web/sites' | Where-Object { $_.Name -match 'cipp' -and $_.Name -notmatch '-' }
$FunctionApp = Get-AzWebApp -ResourceGroupName $Functions.ResourceGroupName -Name $Functions.Name
$Identity = $FunctionApp.Identity.PrincipalId
New-AzRoleAssignment -ObjectId $Identity -RoleDefinitionName 'Contributor' -Scope $FunctionApp.Id
```

### API Client Management

#### **Creating an API Client (App Registration)**

1. Navigate to CIPP > Integrations and click on CIPP-API.
2. Creating an API client:
   1. If you need to create an API Client
      1. Click on Actions > Create New Client.
      2. Fill out the form with the App Name.
   2. If you've already created an App Registration and would like to import it:
      1. Click on Actions > Add Existing Client.
      2. Select the API Client from the list.
   3. Ensure that you Enable the client in order to save it to the Function App authentication settings.
   4. Optionally set the [Custom Role](../user-documentation/cipp/advanced/super-admin/custom-roles.md) and Allowed IP Ranges for additional security.
   5. Submit the form to create the client. Remember to copy the Application secret to a secure location.
3. Once you have the API Client(s) configured, click Actions > Save Azure Configuration, this updates the Function App authentication settings with the new Client IDs.&#x20;

{% hint style="info" %}
The IP Range list supports both IPv4 and IPv6 addresses as standalone IP addresses or in CIDR Notation (e.g. 12.34.56.78/24 or 1.1.1.1).
{% endhint %}

{% hint style="info" %}
Custom Roles will limit which API endpoints each API Client can access. This can be used to limit all API calls to read only for example.
{% endhint %}

#### **Disabling an API client**

1. Navigate to CIPP > Integrations and click on CIPP-API.
2. Find the API client in the table and click on the 3 dots in the Actions column > Edit.
3. Flip the Enabled switch off and click Submit.
4. At the top of the page, go to Actions and click Save Azure Configuration.

#### **Rotating Secrets**

1. Navigate to CIPP > Integrations and click on CIPP-API.
2. Find the API client in the table and click on the 3 dots in the Actions column > Reset Application Secret.
3. Copy the new Secret to a secure location.

***

## Authentication

CIPP uses OAuth authentication to be able to connect to the API using your Application ID and secret. You can use the PowerShell example below to connect to the API

```powershell
$CIPPAPIUrl = "https://yourcippurl.com"
$ApplicationId = "your application ID"
$ApplicationSecret = "your application secret"
$TenantId = "your tenant id"

$AuthBody = @{
    client_id     = $ApplicationId
    client_secret = $ApplicationSecret
    scope         = "api://$($ApplicationId)/.default"
    grant_type    = 'client_credentials'
}
$token = Invoke-RestMethod -Uri "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token" -Method POST -Body $AuthBody

$AuthHeader = @{ Authorization = "Bearer $($token.access_token)" }
Invoke-RestMethod -Uri "$CIPPAPIUrl/api/ListLogs" -Method GET -Headers $AuthHeader -ContentType "application/json"

```

{% hint style="info" %}
If you are making an OAuth connection with any 3rd party service, make use of the copyable fields on the CIPP-API integration page indicated by a blue outline. You will also need the API Scope, get this from the API Client > Actions > Copy API Scope.
{% endhint %}

### Time and rate limits

The API actions have a maximum timeout of 10 minutes. There are no active rate limits, but heavy usage of the API can cause frontend operations to slow down.

## Endpoint documentation

Each page in the user documentation has a list of the endpoints used to load or create data on that specific page

## CIPP API Powershell Module

You can install the CIPP API Powershell module using PowerShell 7.x. The module takes care of all the authentication for you.

```powershell
Install-Module -Name CIPPAPIModule
```

You will first need to set your CIPP API Details using the following command:

```powershell
Set-CIPPAPIDetails -CIPPClientID "YourClientIDGoesHere" -CIPPClientSecret "YourClientSecretGoesHere" -CIPPAPIUrl "https://your.cipp.apiurl" -TenantID "YourTenantID"
```

You can then test its working

```powershell
Get-CIPPLogs
```

Further documentation for the module and each of its available functions can be found [here](https://github.com/BNWEIN/CIPPAPIModule/)

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
