---
id: troubleshooting
title: Troubleshooting
description: Troubleshooting information for issues with CIPP.
slug: /troubleshooting
---

Below are some common issues that users have had from initial deployment, updating and general usage.

Note that these steps come from the community - if you notice any mistakes, please either edit this page or get in touch via the [Discord server](https://discord.gg/Cyberdrain).  Please note the [Contributor Code of Conduct](/docs/dev/#contributor-code-of-conduct).

## Token Testing Script

<details><summary>Token Test Script</summary>

```powershell title="Test-SecureApplicationModelTokens.ps1"
### User Input Variables ###

### Enter the details of your Secure Access Model Application below ###
$ApplicationId = '<YOUR APPLICATION ID>'
$ApplicationSecret = '<YOUR APPLICATION SECRET>'
$RefreshToken = '<YOUR REFRESH TOKEN>'
$ExchangeRefreshToken = '<YOUR EXCHANGE REFRESH TOKEN>'
$MyTenant = '<YOUR TENANT ID>'
### STOP EDITING HERE ###

function Get-GraphToken($TenantId, $Scope, $AsApp, $AppId, $eRefreshToken, $ReturnRefresh) {
    if (!$scope) { $scope = 'https://graph.microsoft.com/.default' }
    $AuthBody = @{
        client_id     = $ApplicationId
        client_secret = $ApplicationSecret
        scope         = $Scope
        refresh_token = $eRefreshToken
        grant_type    = 'refresh_token'               
    }
    if ($null -ne $AppId -and $null -ne $eRefreshToken) {
        $AuthBody = @{
            client_id     = $AppId
            refresh_token = $eRefreshToken
            scope         = $Scope
            grant_type    = 'refresh_token'
        }
    }
    if (!$TenantId) { $TenantId = $ENV:TenantId }
    $AccessToken = (Invoke-RestMethod -Method post -Uri "https://login.microsoftonline.com/$($TenantId)/oauth2/v2.0/token" -Body $Authbody -ErrorAction Stop)
    if ($ReturnRefresh) { $Header = $AccessToken } else { $Header = @{ Authorization = "Bearer $($AccessToken.access_token)" } }

    return $header
}
function Connect-graphAPI {
    [CmdletBinding()]
    Param
    (
        [parameter(Position = 0, Mandatory = $false)]
        [ValidateNotNullOrEmpty()][String]$ApplicationId,
         
        [parameter(Position = 1, Mandatory = $false)]
        [ValidateNotNullOrEmpty()][String]$ApplicationSecret,
         
        [parameter(Position = 2, Mandatory = $true)]
        [ValidateNotNullOrEmpty()][String]$TenantId,
 
        [parameter(Position = 3, Mandatory = $false)]
        [ValidateNotNullOrEmpty()][String]$RefreshToken
 
    )
    Write-Verbose 'Removing old token if it exists'
    $Script:GraphHeader = $null
    Write-Verbose 'Logging into Graph API'
    try {
        if ($ApplicationId) {
            Write-Verbose '   using the entered credentials'
            $script:ApplicationId = $ApplicationId
            $script:ApplicationSecret = $ApplicationSecret
            $script:RefreshToken = $RefreshToken
            $AuthBody = @{
                client_id     = $ApplicationId
                client_secret = $ApplicationSecret
                scope         = 'https://graph.microsoft.com/.default'
                refresh_token = $RefreshToken
                grant_type    = 'refresh_token'  
            }   
        } else {
            Write-Verbose '   using the cached credentials'
            $AuthBody = @{
                client_id     = $script:ApplicationId
                client_secret = $Script:ApplicationSecret
                scope         = 'https://graph.microsoft.com/.default'
                refresh_token = $script:RefreshToken
                grant_type    = 'refresh_token' 
            }
        }
        $AccessToken = (Invoke-RestMethod -Method post -Uri "https://login.microsoftonline.com/$($TenantId)/oauth2/v2.0/token" -Body $Authbody -ErrorAction Stop).access_token
        $Script:GraphHeader = @{ Authorization = "Bearer $($AccessToken)" }
    } catch {
        Write-Host "Could not log into the Graph API for tenant $($TenantID): $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host 'Starting test of the standard Refresh Token' -ForegroundColor Green
try {
    Write-Host 'Attempting to retrieve an Access Token' -ForegroundColor Green
    Connect-graphAPI -ApplicationId $ApplicationId -ApplicationSecret $ApplicationSecret -RefreshToken $RefreshToken -TenantID $MyTenant
} catch {
    $ErrorDetails = if ($_.ErrorDetails.Message) {
        $ErrorParts = $_.ErrorDetails.Message | ConvertFrom-Json
        "[$($ErrorParts.error)] $($ErrorParts.error_description)"
    } else {
        $_.Exception.Message
    }
    Write-Host "Unable to generate access token. The detailed error information, if returned was: $($ErrorDetails)" -ForegroundColor Red
}
try {
    Write-Host 'Attempting to retrieve all tenants you have delegated permission to' -ForegroundColor Green
    $Tenants = (Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/contracts?`$top=999" -Method GET -Headers $script:GraphHeader).value
} catch {
    $ErrorDetails = if ($_.ErrorDetails.Message) {
        $ErrorParts = $_.ErrorDetails.Message | ConvertFrom-Json
        "[$($ErrorParts.error)] $($ErrorParts.error_description)"
    } else {
        $_.Exception.Message
    }
    Write-Host "Unable to retrieve tenants. The detailed error information, if returned was: $($ErrorDetails)" -ForegroundColor Red
}
# Setup some variables for use in the foreach. Pay no attention to the man behind the curtain....
$TenantCount = $Tenants.Count
$IncrementAmount = 100 / $TenantCount
$i = 0
$ErrorCount = 0
Write-Host "$TenantCount tenants found, attempting to loop through each to test access to each individual tenant" -ForegroundColor Green
# Loop through every tenant we have, and attempt to interact with it with Graph
foreach ($Tenant in $Tenants) {
    Write-Progress -Activity 'Checking Tenant - Refresh Token' -Status "Progress -> Checking $($Tenant.defaultDomainName)" -PercentComplete $i -CurrentOperation TenantLoop
    If ($i -eq 0) { Write-Host 'Starting Refresh Token Loop Tests' }
    $i = $i + $IncrementAmount
    try {
        Connect-graphAPI -ApplicationId $ApplicationId -ApplicationSecret $ApplicationSecret -RefreshToken $RefreshToken -TenantID $Tenant.customerid
    } catch {
        $ErrorDetails = if ($_.ErrorDetails.Message) {
            $ErrorParts = $_.ErrorDetails.Message | ConvertFrom-Json
            "[$($ErrorParts.error)] $($ErrorParts.error_description)"
        } else {
            $_.Exception.Message
        }
        Write-Host "Unable to connect to graph API for $($Tenant.defaultDomainName). The detailed error information, if returned was: $($ErrorDetails)" -ForegroundColor Red
        $ErrorCount++
        continue
    }
    try {
        $Result = (Invoke-RestMethod -Uri 'https://graph.microsoft.com/v1.0/users' -Method GET -Headers $script:GraphHeader).value
    } catch {
        $ErrorDetails = if ($_.ErrorDetails.Message) {
            $ErrorParts = $_.ErrorDetails.Message | ConvertFrom-Json
            "[$($ErrorParts.error)] $($ErrorParts.error_description)"
        } else {
            $_.Exception.Message
        }
        Write-Host "Unable to get users from $($Tenant.defaultDomainName) in Refresh Token Test. The detailed error information, if returned was: $($ErrorDetails)" -ForegroundColor Red
        $ErrorCount++
    } 
}
Write-Host "Standard Graph Refresh Token Test: $TenantCount total tenants, with $ErrorCount failures"
Write-Host 'Now attempting to test the Exchange Refresh Token'
# Setup some variables for use in the foreach. Pay no attention to the man behind the curtain....
$j = 0
$ExcErrorCount = 0
foreach ($Tenant in $Tenants) {
    Write-Progress -Activity 'Checking Tenant - Exchange Refresh Token' -Status "Progress -> Checking $($Tenant.defaultDomainName)" -PercentComplete $j -CurrentOperation TenantLoop
    If ($j -eq 0) { Write-Host 'Starting Exchange Refresh Token Test' }
    $j = $j + $IncrementAmount

    try {
        $UPN = 'notRequired@required.com'
        $TokenValue = ConvertTo-SecureString (Get-GraphToken -AppID 'a0c73c16-a7e3-4564-9a95-2bdf47383716' -ERefreshToken $ExchangeRefreshToken -Scope 'https://outlook.office365.com/.default' -Tenantid $Tenant.defaultDomainName).Authorization -AsPlainText -Force
        $Credential = New-Object System.Management.Automation.PSCredential($UPN, $TokenValue)
        $Session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri "https://ps.outlook.com/powershell-liveid?DelegatedOrg=$($Tenant.defaultDomainName)&BasicAuthToOAuthConversion=true" -Credential $credential -Authentication Basic -AllowRedirection -ErrorAction Continue
        $Session = Import-PSSession $Session -ea Silentlycontinue -AllowClobber -CommandName 'Get-OrganizationConfig'
        $Org = Get-OrganizationConfig
        $null = Get-PSSession | Remove-PSSession
    } catch {
        $ErrorDetails = if ($_.ErrorDetails.Message) {
            $ErrorParts = $_.ErrorDetails.Message | ConvertFrom-Json
            "[$($ErrorParts.error)] $($ErrorParts.error_description)"
        } else {
            $_.Exception.Message
        }
        Write-Host "Tenant: $($Tenant.defaultDomainName)-----------------------------------------------------------------------------------------------------------" -ForegroundColor Yellow
        Write-Host "Failed to Connect to Exchange for $($Tenant.defaultDomainName). The detailed error information, if returned was: $($ErrorDetails)" -ForegroundColor Red        
        $ExcErrorCount++
    }
}
Write-Host "Exchange Refresh Token Test: $TenantCount total tenants, with $ExcErrorCount failures"
Write-Host 'All Tests Finished'
```

</details>

This script comes from Gavin Stone's [excellent blog post on setting up the Secure Application Model](https://www.gavsto.com/secure-application-model-for-the-layman-and-step-by-step/).

This script doesn't test the CIPP configuration, only that the tokens you are pasting into this script are correct.  

It's possible that you may have pasted the tokens incorrectly into the deployment fields.

## Refresh Secure Application  Model Tokens

<details><summary>Refresh Token Script</summary>

:::caution PowerShell Version

This script requires the PartnerCenter module to generate the Secure Application Model tokens. At the moment it is only compatible with PowerShell 5.1.

:::

```powershell title="Update-SecureApplicationModelTokens.ps1"
### User Input Variables ###

### Enter the details of your Secure Access Model Application below ###

$ApplicationId           = '<YOUR APPLICATION ID>'
$ApplicationSecret       = '<YOUR APPLICATION SECRET>'
$TenantId                = '<YOUR TENANT ID>'

### STOP EDITING HERE ###

### Create credential object using UserEntered(ApplicationID) and UserEntered(ApplicationSecret) ###

$Credential = New-Object System.Management.Automation.PSCredential($ApplicationId, ($ApplicationSecret | ConvertTo-SecureString -AsPlainText -Force))

### Splat Params required for Updating Refresh Token ###

$UpdateRefreshTokenParamaters = @{
    ApplicationID        = $ApplicationId
    Tenant               = $TenantId
    Scopes               = 'https://api.partnercenter.microsoft.com/user_impersonation'
    Credential           = $Credential
    UseAuthorizationCode = $true
    ServicePrincipal     = $true
}

### Splat Params required for Updating Exchange Refresh Token ###

$UpdateExchangeTokenParamaters = @{
    ApplicationID           = 'a0c73c16-a7e3-4564-9a95-2bdf47383716'
    Scopes                  = 'https://outlook.office365.com/.default'
    Tenant                  = $TenantId
    UseDeviceAuthentication = $true
}

### Create new Refresh Token using previously splatted paramaters ###

$Token = New-PartnerAccessToken @UpdateRefreshTokenParamaters

### Create new Exchange Refresh Token using previously splatted paramaters ###

$Exchangetoken = New-PartnerAccessToken @UpdateExchangeTokenParamaters 

### Output Refresh Tokens and Exchange Refresh Tokens ###

Write-Host "================ Secrets ================"
Write-Host "`$ApplicationId         = $($ApplicationId)"
Write-Host "`$ApplicationSecret     = $($ApplicationSecret)"
Write-Host "`$TenantID              = $($TenantId)"
Write-Host "`$RefreshToken          = $($Token.refreshtoken)" -ForegroundColor Blue
Write-Host "`$ExchangeRefreshToken  = $($ExchangeToken.Refreshtoken)" -ForegroundColor Green
Write-Host "================ Secrets ================"
Write-Host "     SAVE THESE IN A SECURE LOCATION     "
```

</details>

1. Go to Settings
1. Select **Backend**
1. Select **Go to Key Vault**
1. Select **Access Policies**
1. Select **Add Access Policy**
1. Add your own user with "Secret Management" permissions.
1. Go back to Secrets.
1. Update the tokens as required by creating new versions.
1. Clear the [token cache](#clear-token-cache).

## Clear Token Cache

1. Go to Settings
1. Select **Backend**
1. Select **Go to Function App Configuration**
1. At each item that has the source *Key Vault* there should be a green checkbox. If there is no green checkbox, restart the function app and try in 30 minutes
1. For the items *RefreshToken* and *ExchangeRefreshToken* rename each item, for example to *RefreshToken2*
1. Select **Save**
1. Select **Overview** in the side menu
1. Stop the app & wait 5 minutes.
1. Start the app
1. Go back to **Configuration** in the side menu.
1. Reset the token names to their original values, for example back to *RefreshToken*
1. Stop the app once more for 5 minutes then start it again.

The tokens should no longer be in the cache.

## Service Principal

Sometimes Azure has intermittent issues with applying service principals to AAD.

If this is the only error during deployment, follow the below steps:

1. Go to the [Subscription in the Azure Portal](https://portal.azure.com/#blade/Microsoft_Azure_Billing/SubscriptionsBlade)
1. Select **Access Control (IAM)**
1. Select **Add**
1. Select **Add Role Assignment**
1. Give the Azure function service principal *reader* role

## Multi-Factor Authentication Troubleshooting

Here are a few things it's important to know about MFA and it's effects on the Secure Application Model (SAM) and CIPP:

1. The account you use to generate your SAM tokens for CIPP must have Microsoft (Azure AD) MFA enabled, it can't use third-party MFA.
1. You can't have the `Allow users to remember multi-factor authentication on devices they trust` option enabled in the [classic MFA admin portal](https://account.activedirectory.windowsazure.com/UserManagement/MfaSettings.aspx). In either customer or the partner tenant.
1. You can't have trusted locations or other Conditional Access Policy settings applicable to the account you use to generate your SAM tokens for CIPP.
