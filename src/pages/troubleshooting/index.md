---
title: Troubleshooting
description: Find out the common fixes to problems that other users have had before!
---

Below are some of the common issues that users have had from initial deployment, updating and general usage.

Note that these steps have been added from the community - if you notice any mistakes, please either edit this page or get in touch
via the [Discord server](https://discord.gg/Cyberdrain).  Please note the [Contributor Code of Conduct found here](/docs/dev/#contributor-code-of-conduct)

## Token Testing Script

[Test your tokens with this script](https://www.gavsto.com/secure-application-model-for-the-layman-and-step-by-step/)

This script does not test the CIPP configuration, only that the tokens 
you are pasting into this script are correct.  

It is possible that you may have pasted the tokens incorrectly into the 
deployment fields. 


## Refresh Secure Access Model Tokens

[Refresh your tokens with this script:](https://www.cyberdrain.com/automating-with-powershell-getting-new-secure-app-model-tokens/)

```powershell title="Update-SecureAcessModelTokens.ps1"
$ApplicationId = 'ApplicationID'
$ApplicationSecret = 'Secret' | Convertto-SecureString -AsPlainText -Force
$TenantID = 'YourTenantID'
$credential = New-Object System.Management.Automation.PSCredential($ApplicationId, $ApplicationSecret)
$token = New-PartnerAccessToken -ApplicationId $ApplicationID -Scopes 'https://api.partnercenter.microsoft.com/user_impersonation' -ServicePrincipal -Credential $credential -Tenant $TenantID -UseAuthorizationCode
$Exchangetoken = New-PartnerAccessToken -ApplicationId 'a0c73c16-a7e3-4564-9a95-2bdf47383716' -Scopes 'https://outlook.office365.com/.default' -Tenant $TenantID -UseDeviceAuthentication
Write-Host "================ Secrets ================"
Write-Host "`$ApplicationId         = $($applicationID)"
Write-Host "`$ApplicationSecret     = $($ApplicationSecret)"
Write-Host "`$TenantID              = $($tenantid)"
write-host "`$RefreshToken          = $($token.refreshtoken)" -ForegroundColor Blue
write-host "`$ExchangeRefreshToken  = $($ExchangeToken.Refreshtoken)" -ForegroundColor Green
Write-Host "================ Secrets ================"
Write-Host "    SAVE THESE IN A SECURE LOCATION     "
```

1. Go to CIPP
1. Go to Settings
1. Click on **Backend**
1. Click on **Go to Key Vault**
1. Click on **Access Policies**
1. Click on **Add Access Policy**
1. Add your own user with "Secret Management" permissions.
1. Go back to Secrets.
1. Update the tokens as required by creating new versions.
1. Clear the cache for tokens. If you don't know how to do this, type "!ClearTokenCache"

## Clear Token Cache

1. Go to CIPP
1. Go to Settings
1. Click on **Backend**
1. Click on **Go to Function App Configuration**
1. At each item that has the source *Key Vault* there should be a green checkbox
If there is no green checkbox, restart the function app and try in 30 minutes
1. For each item with a green checkbox, click on **Edit**
1. Rename the item

> e.g *RefreshToken2*

1. Click **Save**
1. Click on **Overview** in the side menu
1. Stop the app & wait 5 minutes.
1. Start the app
1. Go back to **Configuration** in the side menu.
1. Reset the token names to their original values

> e.g *RefreshToken*

1. Stop the app once more for 5 minutes then start it again. 

The token cache should be cleared

## Service Principal

Sometimes Azure has intermittent issues with applying service principals to AAD.

If this is the only error during deployment, follow the below steps:

1. Go to the [Subscription in the Azure Portal](https://portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade)
1. Click on **Access Control (IAM)**
1. Click **Add**
1. Click on **Add Role Assignment**
1. Give the Azure function service principal *reader* role

## Private Endpoint

To protect CIPP as a private resource, that is only accessible over a VPN or IP
whitelisting you can use Private Endpoint Connections. 

To enable Private Endpoints you must already have an Azure VNET available, and understand how VNET  work. 

1. Go to CIPP
1. Go to Settings
1. Click on **Backend**
1. Click on **Go to role management**
1. Click on **Private Endpoints**
1. Click on **Add**
1. Setup your vnet information

CIPP is now no longer internet accessible

## Conditional Access

To add Conditional Access to CIPP, follow the below steps:

1. Go to your [Conditional Access Policies](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ConditionalAccessBlade/Policies)
1. Select which users to apply the policy to, default suggestion is *"All Users"*
1. Click on **Azure Static Web Apps** as the included app under "Cloud Apps or actions"
1. Configure any condition you want. 

> e.g Trusted Locations, specific IPs, specific platforms, etc

1. At Access Controls you must enable *Grant, with MFA access*.
1. Click on **Save**

Your app is now protected with Conditional Access.

## Admin Consent

If you Azure Tenant requires admin approval for user apps, add consent by 
following the below steps:

1. Go to to [Azure Enterprise Applications](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AllApps)
1. Find *Azure Static Websites*
1. Grant Admin Consent for all

This will allow the users the ability to grant their own access now

