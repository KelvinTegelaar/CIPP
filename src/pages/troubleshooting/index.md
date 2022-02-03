# Troubleshooting

Below are some of the common issues that users have had from initial deployment, updating and general usage.

Note that these steps have been added from the community - if you notice any mistakes, please either edit this page or get in touch via the [Discord server](https://discord.gg/Cyberdrain).  Please note the [Contributor Code of Conduct](/docs/dev/#contributor-code-of-conduct).

## Token Testing Script

<details><summary>Token Test Script</summary>

```powershell title="Test-SecureApplicationModelTokens.ps1"
### User Input Variables ###

### Enter the details of your Secure Access Model Application below ###
$ApplicationId           = '<YOUR APPLICATION ID>'
$ApplicationSecret       = '<YOUR APPLICATION SECRET>' | ConvertTo-SecureString -AsPlainText -Force
$MyTenant                = '<YOUR TENANT ID / DOMAIN>'
$RefreshToken            = '<YOUR REFRESH TOKEN>'
$ExchangeRefreshToken    = '<YOUR EXCHANGE REFRESH TOKEN>'

### Stop editing here ###

function Get-GraphToken($tenantid, $scope, $AsApp, $AppID, $erefreshToken, $ReturnRefresh) {
    if (!$scope) { $scope = 'https://graph.microsoft.com/.default' }

    $AuthBody = @{
        client_id     = $ApplicationId
        client_secret = $ApplicationSecret
        scope         = $Scope
        refresh_token = $eRefreshToken
        grant_type    = "refresh_token"
                    
    }

    if ($null -ne $AppID -and $null -ne $erefreshToken) {
        $AuthBody = @{
            client_id     = $appid
            refresh_token = $eRefreshToken
            scope         = $Scope
            grant_type    = "refresh_token"
        }
    }

    if (!$tenantid) { $tenantid = $env:tenantid }
    $AccessToken = (Invoke-RestMethod -Method post -Uri "https://login.microsoftonline.com/$($tenantid)/oauth2/v2.0/token" -Body $Authbody -ErrorAction Stop)
    if ($ReturnRefresh) { $header = $AccessToken } else { $header = @{ Authorization = "Bearer $($AccessToken.access_token)" } }

    return $header
}
function Connect-GraphAPI {
    [CmdletBinding()]
    Param
    (
        [parameter(Position = 0, Mandatory = $false)]
        [ValidateNotNullOrEmpty()][String]$ApplicationId,
        
        [parameter(Position = 1, Mandatory = $false)]
        [ValidateNotNullOrEmpty()][String]$ApplicationSecret,
        
        [parameter(Position = 2, Mandatory = $true)]
        [ValidateNotNullOrEmpty()][String]$TenantID,

        [parameter(Position = 3, Mandatory = $false)]
        [ValidateNotNullOrEmpty()][String]$RefreshToken

    )
    Write-Verbose "Removing old token if it exists"
    $Script:GraphHeader = $null
    Write-Verbose "Logging into Graph API"
    try {
        if ($ApplicationId) {
            Write-Verbose "   using the entered credentials"
            $script:ApplicationId = $ApplicationId
            $script:ApplicationSecret = $ApplicationSecret
            $script:RefreshToken = $RefreshToken
            $AuthBody = @{
                client_id     = $ApplicationId
                client_secret = $ApplicationSecret
                scope         = 'https://graph.microsoft.com/.default'
                refresh_token = $RefreshToken
                grant_type    = "refresh_token"
                
            }
            
        }
        else {
            Write-Verbose "   using the cached credentials"
            $AuthBody = @{
                client_id     = $script:ApplicationId
                client_secret = $Script:ApplicationSecret
                scope         = 'https://graph.microsoft.com/.default'
                refresh_token = $script:RefreshToken
                grant_type    = "refresh_token"
                
            }
        }
        $AccessToken = (Invoke-RestMethod -Method post -Uri "https://login.microsoftonline.com/$($tenantid)/oauth2/v2.0/token" -Body $Authbody -ErrorAction Stop).access_token

        $Script:GraphHeader = @{ Authorization = "Bearer $($AccessToken)" }
    }
    catch {
        Write-Host "Could not log into the Graph API for tenant $($TenantID): $($_.Exception.Message)" -ForegroundColor Red
    }

}

Write-Host "Starting test of the standard Refresh Token" -ForegroundColor Green

try {
    Write-Host "Attempting to retrieve an Access Token" -ForegroundColor Green
    Connect-GraphAPI -ApplicationId $ApplicationId -ApplicationSecret $ApplicationSecret -RefreshToken $RefreshToken -TenantID $MyTenant
}
catch {
    $ErrorDetails = if ($_.ErrorDetails.Message) {
        $ErrorParts = $_.ErrorDetails.Message | ConvertFrom-Json
        "[$($ErrorParts.error)] $($ErrorParts.error_description)"
    }
    else {
        $_.Exception.Message
    }
    Write-Host "Unable to generate access token. The detailed error information, if returned was: $($ErrorDetails)" -ForegroundColor Red
}

try {
    Write-Host "Attempting to retrieve all tenants you have delegated permission to" -ForegroundColor Green
    $Tenants = (Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/contracts?`$top=999" -Method GET -Headers $script:GraphHeader).value
}
catch {
    $ErrorDetails = if ($_.ErrorDetails.Message) {
        $ErrorParts = $_.ErrorDetails.Message | ConvertFrom-Json
        "[$($ErrorParts.error)] $($ErrorParts.error_description)"
    }
    else {
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
    Write-Progress -Activity "Checking Tenant - Refresh Token" -Status "Progress -> Checking $($Tenant.defaultDomainName)" -PercentComplete $i -CurrentOperation TenantLoop
    If ($i -eq 0) { Write-Host "Starting Refresh Token Loop Tests" }
    $i = $i + $IncrementAmount

    try {
        Connect-GraphAPI -ApplicationId $ApplicationId -ApplicationSecret $ApplicationSecret -RefreshToken $RefreshToken -TenantID $Tenant.customerId
    }
    catch {
        $ErrorDetails = if ($_.ErrorDetails.Message) {
            $ErrorParts = $_.ErrorDetails.Message | ConvertFrom-Json
            "[$($ErrorParts.error)] $($ErrorParts.error_description)"
        }
        else {
            $_.Exception.Message
        }
        Write-Host "Unable to connect to graph API for $($Tenant.defaultDomainName). The detailed error information, if returned was: $($ErrorDetails)" -ForegroundColor Red
        $ErrorCount++
        continue
    }


    try {
        $Result = (Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/users" -Method GET -Headers $script:GraphHeader).value
    }
    catch {
        $ErrorDetails = if ($_.ErrorDetails.Message) {
            $ErrorParts = $_.ErrorDetails.Message | ConvertFrom-Json
            "[$($ErrorParts.error)] $($ErrorParts.error_description)"
        }
        else {
            $_.Exception.Message
        }
        Write-Host "Unable to get users from $($Tenant.defaultDomainName) in Refresh Token Test. The detailed error information, if returned was: $($ErrorDetails)" -ForegroundColor Red
        $ErrorCount++
    }
    
}

Write-Host "Standard Graph Refresh Token Test: $TenantCount total tenants, with $ErrorCount failures"
Write-Host "Now attempting to test the Exchange Refresh Token"

# Setup some variables for use in the foreach. Pay no attention to the man behind the curtain....
$j = 0
$ExcErrorCount = 0

foreach ($Tenant in $Tenants) {
    Write-Progress -Activity "Checking Tenant - Exchange Refresh Token" -Status "Progress -> Checking $($Tenant.defaultDomainName)" -PercentComplete $j -CurrentOperation TenantLoop
    If ($j -eq 0) { Write-Host "Starting Exchange Refresh Token Test" }
    $j = $j + $IncrementAmount

    try {
        $upn = "notRequired@required.com"
        $tokenvalue = ConvertTo-SecureString (Get-GraphToken -AppID 'a0c73c16-a7e3-4564-9a95-2bdf47383716' -ERefreshToken $ExchangeRefreshToken -Scope 'https://outlook.office365.com/.default' -Tenantid $Tenant.defaultDomainName).Authorization -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($upn, $tokenValue)
        $session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri "https://ps.outlook.com/powershell-liveid?DelegatedOrg=$($tenant.defaultDomainName)&BasicAuthToOAuthConversion=true" -Credential $credential -Authentication Basic -AllowRedirection -ErrorAction Continue
        $session = Import-PSSession $session -ea Silentlycontinue -AllowClobber -CommandName "Get-OrganizationConfig"
        $org = Get-OrganizationConfig
        $null = Get-PSSession | Remove-PSSession
    }
    catch {
        $ErrorDetails = if ($_.ErrorDetails.Message) {
            $ErrorParts = $_.ErrorDetails.Message | ConvertFrom-Json
            "[$($ErrorParts.error)] $($ErrorParts.error_description)"
        }
        else {
            $_.Exception.Message
        }
        Write-Host "Tenant: $($Tenant.defaultDomainName)-----------------------------------------------------------------------------------------------------------" -ForegroundColor Yellow
        Write-Host "Failed to Connect to Exchange for $($Tenant.defaultDomainName). The detailed error information, if returned was: $($ErrorDetails)" -ForegroundColor Red        
        $ExcErrorCount++
    }
}

Write-Host "Exchange Refresh Token Test: $TenantCount total tenants, with $ExcErrorCount failures"
Write-Host "All Tests Finished"
```

</details>

This script is taken from Gavin Stone's [excellent blog post on setting up the Secure Application Model](https://www.gavsto.com/secure-application-model-for-the-layman-and-step-by-step/).

This script does not test the CIPP configuration, only that the tokens you are pasting into this script are correct.  

It is possible that you may have pasted the tokens incorrectly into the deployment fields.

## Refresh Secure Application  Model Tokens

<details><summary>Refresh Token Script</summary>

```powershell title="Update-SecureApplicationModelTokens.ps1"
### User Input Variables ###

### Enter the details of your Secure Access Model Application below ###

$ApplicationId           = '<YOUR APPLICATION ID>'
$ApplicationSecret       = '<YOUR APPLICATION SECRET>' | ConvertTo-SecureString -AsPlainText -Force
$TenantID                = '<YOUR TENANT ID>'

### Create credential object using UserEntered(ApplicationID) and UserEntered(ApplicationSecret) ###

$Credential = New-Object System.Management.Automation.PSCredential($ApplicationId, $ApplicationSecret)

### Splat Params required for Updating Refresh Token ###

$UpdateRefreshTokenParamaters = @{
    ApplicationID        = $ApplicationId
    ApplicationSecret    = $ApplicationSecret
    Tenant               = $TenantID
    Scopes               = 'https://api.partnercenter.microsoft.com/user_impersonation'
    Credential           = $Credential
    UseAuthorizationCode = $true
}

### Splat Params required for Updating Exchange Refresh Token ###

$UpdateExchangeTokenParamaters = @{
    ApplicationID           = 'a0c73c16-a7e3-4564-9a95-2bdf47383716'
    Scopes                  = 'https://outlook.office365.com/.default'
    Tenant                  = $TenantID
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
Write-Host "`$TenantID              = $($TenantID)"
Write-Host "`$RefreshToken          = $($Token.refreshtoken)" -ForegroundColor Blue
Write-Host "`$ExchangeRefreshToken  = $($ExchangeToken.Refreshtoken)" -ForegroundColor Green
Write-Host "================ Secrets ================"
Write-Host "    SAVE THESE IN A SECURE LOCATION     "
```

</details>

1. Go to Settings
1. Click on **Backend**
1. Click on **Go to Key Vault**
1. Click on **Access Policies**
1. Click on **Add Access Policy**
1. Add your own user with "Secret Management" permissions.
1. Go back to Secrets.
1. Update the tokens as required by creating new versions.
1. Clear the [token cache](#clear-token-cache).

## Clear Token Cache

1. Go to Settings
1. Click on **Backend**
1. Click on **Go to Function App Configuration**
1. At each item that has the source *Key Vault* there should be a green checkbox. If there is no green checkbox, restart the function app and try in 30 minutes
1. For the items *RefreshToken* and *ExchangeRefreshToken* rename each item
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

To protect CIPP as a private resource, that is only accessible over a VPN or IP whitelisting you can use Private Endpoint Connections.

To enable Private Endpoints you must already have an Azure VNET available, and understand how VNets work.

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

If your Azure Tenant requires admin approval for user apps, add consent by following the below steps:

1. Go to to [Azure Enterprise Applications](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AllApps)
1. Find *Azure Static Websites*
1. Grant Admin Consent for all

This will allow the users the ability to grant their own access now
