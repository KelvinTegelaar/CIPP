---
id: prerequisites
title: Prerequisites
description: How to prepare to install an instance of CIPP for your organisation.
slug: /gettingstarted/prerequisites
---

To get started make sure you have the following information ready;

- Your Secure Application Model information
- A [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of [the CIPP GitHub](https://github.com/KelvinTegelaar/CIPP) repository.
- A [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of [the CIPP API GitHub](https://github.com/KelvinTegelaar/CIPP-API) repository.
- An active Azure Subscription.
- A GitHub Personal Access Token. You can find instructions on what you need and the minimum permissions to do this [in Microsoft's Azure Static Web Apps documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/publish-azure-resource-manager?tabs=azure-cli#create-a-github-personal-access-token). You only need the "Create a GitHub Personal Access Token" section.

For the installation and maintenance, it's assumed you have some knowledge of GitHub.

If you haven't setup the Secure Application Model (SAM) use the instructions below and then move onto the next page to configure the permissions for your SAM application.

:::danger Secure Application Model account
It is **strongly** recommended that you use a separate global administrator account for each Secure Application Model application you create. This avoids conflicts that occur when using existing accounts which may be in customer tenants as guest users and provides better tracing in audit logs.

**This service account should be a Global Admin (in your tenant) and given Admin Agent (in partner center)**.
:::

:::tip Setting up the Secure Application Model

- Haven't setup the Secure Application model yet? Check out [this CyberDrain blog post](https://www.cyberdrain.com/connect-to-exchange-online-automated-when-mfa-is-enabled-using-the-secureapp-model/).
- For a step-by-step guide to setting up the Secure Application Model, see [this Gavsto blog post](https://www.gavsto.com/secure-application-model-for-the-layman-and-step-by-step/).

:::

If you just need the script to setup the Secure Application Model (SAM) it's below.

<details><summary>Secure App Model Setup Script</summary>
<p>

```powershell title="New-SAMAzureADApplication.ps1"
Param(
  [Parameter(Mandatory = $false)]
  [switch]$ConfigurePreconsent,
  [Parameter(Mandatory = $true)]
  [string]$DisplayName,
  [Parameter(Mandatory = $false)]
  [string]$TenantId
)

$ErrorActionPreference = "Stop"

# Check if the Azure AD PowerShell module has already been loaded.
if ( ! ( Get-Module AzureAD ) ) {
  # Check if the Azure AD PowerShell module is installed.
  if ( Get-Module -ListAvailable -Name AzureAD ) {
    # The Azure AD PowerShell module is not load and it is installed. This module
    # must be loaded for other operations performed by this script.
    Write-Host -ForegroundColor Green "Loading the Azure AD PowerShell module..."
    Import-Module AzureAD
  } else {
    Install-Module AzureAD
  }
}

try {
  Write-Host -ForegroundColor Green "When prompted please enter the appropriate credentials... Warning: Window might have pop-under in VSCode"
  if([string]::IsNullOrEmpty($TenantId)) {
    Connect-AzureAD | Out-Null
    $TenantId = $(Get-AzureADTenantDetail).ObjectId
  } else {
    Connect-AzureAD -TenantId $TenantId | Out-Null
  }
} catch [Microsoft.Azure.Common.Authentication.AadAuthenticationCanceledException] {
  # The authentication attempt was canceled by the end-user. Execution of the script should be halted.
  Write-Host -ForegroundColor Yellow "The authentication attempt was canceled. Execution of the script will be halted..."
  Exit
} catch {
  # An unexpected error has occurred. The end-user should be notified so that the appropriate action can be taken.
  Write-Error "An unexpected error has occurred. Please review the following error message and try again." `
  "$($Error[0].Exception)"
}

$adAppAccess = [Microsoft.Open.AzureAD.Model.RequiredResourceAccess]@{
  ResourceAppId = "00000002-0000-0000-c000-000000000000";
  ResourceAccess = [Microsoft.Open.AzureAD.Model.ResourceAccess]@{
    Id = "5778995a-e1bf-45b8-affa-663a9f3f4d04";
    Type = "Role"
  },
  [Microsoft.Open.AzureAD.Model.ResourceAccess]@{
    Id = "a42657d6-7f20-40e3-b6f0-cee03008a62a";
    Type = "Scope"
  },
  [Microsoft.Open.AzureAD.Model.ResourceAccess]@{
    Id = "311a71cc-e848-46a1-bdf8-97ff7156d8e6";
    Type = "Scope"
  }
}

$graphAppAccess = [Microsoft.Open.AzureAD.Model.RequiredResourceAccess]@{
  ResourceAppId = "00000003-0000-0000-c000-000000000000";
  ResourceAccess = [Microsoft.Open.AzureAD.Model.ResourceAccess]@{
    Id = "bf394140-e372-4bf9-a898-299cfc7564e5";
    Type = "Role"
  },
  [Microsoft.Open.AzureAD.Model.ResourceAccess]@{
    Id = "7ab1d382-f21e-4acd-a863-ba3e13f7da61";
    Type = "Role"
  }
}

$partnerCenterAppAccess = [Microsoft.Open.AzureAD.Model.RequiredResourceAccess]@{
  ResourceAppId = "fa3d9a0c-3fb0-42cc-9193-47c7ecd2edbd";
  ResourceAccess = [Microsoft.Open.AzureAD.Model.ResourceAccess]@{
    Id = "1cebfa2a-fb4d-419e-b5f9-839b4383e05a";
    Type = "Scope"
  }
}

$SessionInfo = Get-AzureADCurrentSessionInfo

Write-Host -ForegroundColor Green "Creating the Azure AD application and related resources..."

$app = New-AzureADApplication -AvailableToOtherTenants $true -DisplayName $DisplayName -IdentifierUris "https://$($SessionInfo.TenantDomain)/$((New-Guid).ToString())" -RequiredResourceAccess $adAppAccess, $graphAppAccess, $partnerCenterAppAccess -ReplyUrls @("urn:ietf:wg:oauth:2.0:oob","https://login.microsoftonline.com/organizations/oauth2/nativeclient","https://localhost","http://localhost","http://localhost:8400")
$password = New-AzureADApplicationPasswordCredential -ObjectId $app.ObjectId
$spn = New-AzureADServicePrincipal -AppId $app.AppId -DisplayName $DisplayName
$adminAgentsGroup = Get-AzureADGroup -Filter "DisplayName eq 'AdminAgents'"
Add-AzureADGroupMember -ObjectId $adminAgentsGroup.ObjectId -RefObjectId $spn.ObjectId

write-host "Installing PartnerCenter Module." -ForegroundColor Green
install-module PartnerCenter -Force
write-host "Sleeping for 30 seconds to allow app creation on O365" -foregroundcolor green
start-sleep 30
write-host "Please approve General consent form." -ForegroundColor Green
$PasswordToSecureString = $password.value | ConvertTo-SecureString -asPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($($app.AppId),$PasswordToSecureString)
$token = New-PartnerAccessToken -ApplicationId "$($app.AppId)" -Scopes 'https://api.partnercenter.microsoft.com/user_impersonation' -ServicePrincipal -Credential $credential -Tenant $($spn.AppOwnerTenantID) -UseAuthorizationCode
write-host "Please approve Exchange consent form." -ForegroundColor Green
$Exchangetoken = New-PartnerAccessToken -ApplicationId 'a0c73c16-a7e3-4564-9a95-2bdf47383716' -Scopes 'https://outlook.office365.com/.default' -Tenant $($spn.AppOwnerTenantID) -UseDeviceAuthentication
write-host "Last initiation required: Please browse to https://login.microsoftonline.com/$($spn.AppOwnerTenantID)/adminConsent?client_id=$($app.AppId)"
write-host "Press any key after auth. An error report about incorrect URIs is expected!"
[void][System.Console]::ReadKey($true)
Write-Host "================ Secrets ================"
Write-Host "`$ApplicationId         = $($app.AppId)"
Write-Host "`$ApplicationSecret     = $($password.Value)"
Write-Host "`$TenantID              = $($spn.AppOwnerTenantID)"
write-host "`$RefreshToken          = $($token.refreshtoken)" -ForegroundColor Blue
write-host "`$Exchange RefreshToken = $($ExchangeToken.Refreshtoken)" -ForegroundColor Green
Write-Host "================ Secrets ================"
Write-Host "    SAVE THESE IN A SECURE LOCATION     "
```

</p>
</details>

:::caution Consent, Risk and Conditional Access

Setting up SAM tokens for the first time, presents three consent steps. Make sure you consent to all three.

You should make sure that the user account you're using to generate your SAM tokens isn't listed as a [risky user](https://docs.microsoft.com/en-us/azure/active-directory/identity-protection/howto-identity-protection-investigate-risk).

The account you use for your SAM tokens mustn't have an exemption/exclusion from MFA checks resulting from Conditional Access policies.

:::

Now that you have SAM setup, move onto configuring permissions using the Next button below.
