<#
.SYNOPSIS
    Migrates an existing CIPP deployment to the hardened security configuration.

.DESCRIPTION
    Detects the current security state of a CIPP deployment and migrates it to:
    - Key Vault RBAC authorization (from access policies)
    - Key Vault firewall (deny default, bypass Azure services)
    - Key Vault soft delete and purge protection
    - Storage account firewall (deny default, bypass Azure services)
    - Function App managed identity storage auth (from shared key)
    - Function App HTTPS-only, TLS 1.2, FTPS disabled, HTTP/2
    - RBAC role assignments for Function App managed identity

    Optionally deploys network isolation (private endpoints) or VNet integration.

.PARAMETER ResourceGroupName
    The resource group containing the CIPP deployment.

.PARAMETER FunctionAppName
    The name of the CIPP Function App.

.PARAMETER EnableNetworkIsolation
    Deploy VNet with private endpoints for Key Vault and Storage. Adds ~$31 USD/month.

.PARAMETER EnableVNetIntegration
    Upgrade to Elastic Premium EP1 with VNet integration. Implies -EnableNetworkIsolation. Adds ~$197 USD/month.

.PARAMETER SkipValidation
    Skip post-migration health check.

.EXAMPLE
    ./Migrate-SecurityHardening.ps1 -ResourceGroupName rg-cipp -FunctionAppName cippxyz -WhatIf

.EXAMPLE
    ./Migrate-SecurityHardening.ps1 -ResourceGroupName rg-cipp -FunctionAppName cippxyz -EnableNetworkIsolation
#>
[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
param(
    [Parameter(Mandatory)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory)]
    [string]$FunctionAppName,

    [switch]$EnableNetworkIsolation,
    [switch]$EnableVNetIntegration,
    [switch]$SkipValidation
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($EnableVNetIntegration) { $EnableNetworkIsolation = $true }

# --- Discovery ---
Write-Host "`n=== CIPP Security Migration ===" -ForegroundColor Cyan
Write-Host "Resource Group: $ResourceGroupName"
Write-Host "Function App:   $FunctionAppName`n"

# Discover resources
$funcApp = az functionapp show --resource-group $ResourceGroupName --name $FunctionAppName | ConvertFrom-Json
if (-not $funcApp) { throw "Function App '$FunctionAppName' not found in '$ResourceGroupName'" }

$principalId = $funcApp.identity.principalId
if (-not $principalId) { throw "Function App does not have a managed identity enabled" }

$kvName = (az keyvault list --resource-group $ResourceGroupName --query "[0].name" -o tsv)
if (-not $kvName) { throw "No Key Vault found in '$ResourceGroupName'" }

$storageName = (az storage account list --resource-group $ResourceGroupName --query "[0].name" -o tsv)
if (-not $storageName) { throw "No Storage Account found in '$ResourceGroupName'" }

Write-Host "Key Vault:      $kvName"
Write-Host "Storage:        $storageName"
Write-Host "MI Principal:   $principalId`n"

# --- Current State ---
Write-Host "=== Current State ===" -ForegroundColor Yellow

$kv = az keyvault show --name $kvName --resource-group $ResourceGroupName | ConvertFrom-Json
$kvRbac = $kv.properties.enableRbacAuthorization
$kvSoftDelete = $kv.properties.enableSoftDelete
$kvPurgeProtect = $kv.properties.enablePurgeProtection
$kvFirewall = $kv.properties.networkAcls.defaultAction
$kvPolicyCount = ($kv.properties.accessPolicies | Measure-Object).Count

$storage = az storage account show --name $storageName --resource-group $ResourceGroupName | ConvertFrom-Json
$storageFirewall = $storage.networkRuleSet.defaultAction
$storageTls = $storage.minimumTlsVersion
$storageHttps = $storage.enableHttpsTrafficOnly

$appSettings = az functionapp config appsettings list --resource-group $ResourceGroupName --name $FunctionAppName | ConvertFrom-Json
$hasOldStorage = ($appSettings | Where-Object { $_.name -eq 'AzureWebJobsStorage' }).value -match 'AccountKey='
$hasMiStorage = ($appSettings | Where-Object { $_.name -eq 'AzureWebJobsStorage__accountName' }) -ne $null

Write-Host "KV RBAC:          $(if ($kvRbac) { 'Enabled' } else { 'Disabled (needs migration)' })"
Write-Host "KV Soft Delete:   $(if ($kvSoftDelete) { 'Enabled' } else { 'Disabled (will enable)' })"
Write-Host "KV Purge Protect: $(if ($kvPurgeProtect) { 'Enabled' } else { 'Disabled (will enable)' })"
Write-Host "KV Firewall:      $(if ($kvFirewall -eq 'Deny') { 'Enabled' } else { 'Allow (will restrict)' })"
Write-Host "KV Access Policies: $kvPolicyCount $(if ($kvPolicyCount -gt 0 -and $kvRbac) { '(legacy, will remove)' })"
Write-Host "Storage Firewall: $(if ($storageFirewall -eq 'Deny') { 'Enabled' } else { 'Allow (will restrict)' })"
Write-Host "Storage TLS:      $storageTls"
Write-Host "Storage HTTPS:    $storageHttps"
Write-Host "Storage Auth:     $(if ($hasMiStorage) { 'Managed Identity' } elseif ($hasOldStorage) { 'Shared Key (will migrate)' } else { 'Unknown' })"
Write-Host "HTTPS Only:       $($funcApp.httpsOnly)"
Write-Host "FTPS:             $($funcApp.siteConfig.ftpsState)"
Write-Host "HTTP/2:           $($funcApp.siteConfig.http20Enabled)`n"

# --- Migration ---
Write-Host "=== Applying Security Hardening ===" -ForegroundColor Green

# 1. RBAC role assignments (must happen BEFORE enabling RBAC on KV)
$subId = (az account show --query id -o tsv)
$kvScope = "/subscriptions/$subId/resourceGroups/$ResourceGroupName/providers/Microsoft.KeyVault/vaults/$kvName"
$storageScope = "/subscriptions/$subId/resourceGroups/$ResourceGroupName/providers/Microsoft.Storage/storageAccounts/$storageName"

$roles = @(
    @{ Role = 'Key Vault Secrets User'; Scope = $kvScope }
    @{ Role = 'Storage Blob Data Owner'; Scope = $storageScope }
    @{ Role = 'Storage Queue Data Contributor'; Scope = $storageScope }
    @{ Role = 'Storage Table Data Contributor'; Scope = $storageScope }
    @{ Role = 'Storage Account Contributor'; Scope = $storageScope }
)

foreach ($r in $roles) {
    $existing = az role assignment list --assignee $principalId --role $r.Role --scope $r.Scope | ConvertFrom-Json
    if ($existing.Count -eq 0) {
        if ($PSCmdlet.ShouldProcess("$($r.Role) on $($r.Scope)", "Assign RBAC role")) {
            Write-Host "  Assigning: $($r.Role)"
            az role assignment create --role $r.Role --assignee-object-id $principalId --assignee-principal-type ServicePrincipal --scope $r.Scope -o none
        }
    } else {
        Write-Host "  Already assigned: $($r.Role)"
    }
}

# 2. Key Vault hardening
if (-not $kvRbac) {
    if ($PSCmdlet.ShouldProcess($kvName, "Enable RBAC authorization")) {
        Write-Host "  Enabling KV RBAC..."
        az keyvault update --name $kvName --resource-group $ResourceGroupName --enable-rbac-authorization true -o none
    }
}

if ($kvFirewall -ne 'Deny') {
    if ($PSCmdlet.ShouldProcess($kvName, "Enable KV firewall (Deny + AzureServices bypass)")) {
        Write-Host "  Enabling KV firewall..."
        az keyvault update --name $kvName --resource-group $ResourceGroupName --default-action Deny --bypass AzureServices -o none
    }
}

if (-not $kvSoftDelete) {
    if ($PSCmdlet.ShouldProcess($kvName, "Enable soft delete")) {
        Write-Host "  Enabling soft delete..."
        az keyvault update --name $kvName --resource-group $ResourceGroupName --enable-soft-delete true -o none
    }
}

if (-not $kvPurgeProtect) {
    if ($PSCmdlet.ShouldProcess($kvName, "Enable purge protection")) {
        Write-Host "  Enabling purge protection..."
        az keyvault update --name $kvName --resource-group $ResourceGroupName --enable-purge-protection true -o none
    }
}

# Remove legacy access policies if RBAC is now enabled
if ($kvPolicyCount -gt 0) {
    if ($PSCmdlet.ShouldProcess($kvName, "Remove $kvPolicyCount legacy access policies")) {
        Write-Host "  Removing legacy access policies..."
        az keyvault update --name $kvName --resource-group $ResourceGroupName --set "properties.accessPolicies=[]" -o none
    }
}

# 3. Storage hardening
if ($storageFirewall -ne 'Deny') {
    if ($PSCmdlet.ShouldProcess($storageName, "Enable storage firewall (Deny + AzureServices bypass)")) {
        Write-Host "  Enabling storage firewall..."
        az storage account update --name $storageName --resource-group $ResourceGroupName --default-action Deny --bypass AzureServices -o none
    }
}

if ($storageTls -ne 'TLS1_2') {
    if ($PSCmdlet.ShouldProcess($storageName, "Set minimum TLS to 1.2")) {
        az storage account update --name $storageName --resource-group $ResourceGroupName --min-tls-version TLS1_2 -o none
    }
}

# 4. Function App hardening
if (-not $funcApp.httpsOnly) {
    if ($PSCmdlet.ShouldProcess($FunctionAppName, "Enable HTTPS only")) {
        az functionapp update --resource-group $ResourceGroupName --name $FunctionAppName --set httpsOnly=true -o none
    }
}

if ($funcApp.siteConfig.ftpsState -ne 'Disabled') {
    if ($PSCmdlet.ShouldProcess($FunctionAppName, "Disable FTPS")) {
        az functionapp config set --resource-group $ResourceGroupName --name $FunctionAppName --ftps-state Disabled -o none
    }
}

if (-not $funcApp.siteConfig.http20Enabled) {
    if ($PSCmdlet.ShouldProcess($FunctionAppName, "Enable HTTP/2")) {
        az functionapp config set --resource-group $ResourceGroupName --name $FunctionAppName --http20-enabled true -o none
    }
}

if ($funcApp.siteConfig.minTlsVersion -ne '1.2') {
    if ($PSCmdlet.ShouldProcess($FunctionAppName, "Set minimum TLS to 1.2")) {
        az functionapp config set --resource-group $ResourceGroupName --name $FunctionAppName --min-tls-version 1.2 -o none
    }
}

# 5. Migrate storage auth to managed identity
if ($hasOldStorage -and -not $hasMiStorage) {
    if ($PSCmdlet.ShouldProcess($FunctionAppName, "Migrate AzureWebJobsStorage to managed identity")) {
        Write-Host "  Migrating storage auth to managed identity..."
        az functionapp config appsettings set --resource-group $ResourceGroupName --name $FunctionAppName --settings "AzureWebJobsStorage__accountName=$storageName" -o none
        az functionapp config appsettings delete --resource-group $ResourceGroupName --name $FunctionAppName --setting-names AzureWebJobsStorage -o none
    }
}

# 6. Set secret expiry dates (90 days)
$expiry = (Get-Date).AddDays(90).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
$secrets = @('applicationid', 'applicationsecret', 'refreshtoken', 'tenantid')
foreach ($secret in $secrets) {
    $existing = az keyvault secret show --vault-name $kvName --name $secret --query "attributes.expires" -o tsv 2>$null
    if (-not $existing) {
        if ($PSCmdlet.ShouldProcess("$kvName/$secret", "Set 90-day expiry")) {
            Write-Host "  Setting expiry on secret: $secret"
            az keyvault secret set-attributes --vault-name $kvName --name $secret --expires $expiry -o none 2>$null
        }
    }
}

# --- Optional: Network Isolation ---
if ($EnableNetworkIsolation) {
    Write-Host "`n=== Deploying Network Isolation ===" -ForegroundColor Green
    Write-Host "  This will add ~`$31 USD/month (4 private endpoints + 4 DNS zones)"

    $vnetName = "vnet-$FunctionAppName"

    if ($PSCmdlet.ShouldProcess($ResourceGroupName, "Deploy VNet, private endpoints, and DNS zones")) {
        # VNet
        Write-Host "  Creating VNet..."
        az network vnet create --resource-group $ResourceGroupName --name $vnetName --location (az group show --name $ResourceGroupName --query location -o tsv) --address-prefix 10.0.0.0/16 -o none
        az network vnet subnet create --resource-group $ResourceGroupName --vnet-name $vnetName --name snet-private-endpoints --address-prefix 10.0.1.0/24 --disable-private-endpoint-network-policies true -o none

        if ($EnableVNetIntegration) {
            az network vnet subnet create --resource-group $ResourceGroupName --vnet-name $vnetName --name snet-functions --address-prefix 10.0.2.0/24 -o none
        }

        # Private endpoints and DNS zones
        $kvId = (az keyvault show --name $kvName --resource-group $ResourceGroupName --query id -o tsv)
        $storageId = (az storage account show --name $storageName --resource-group $ResourceGroupName --query id -o tsv)

        $endpoints = @(
            @{ Name = "pe-$FunctionAppName-kv"; ResourceId = $kvId; GroupId = 'vault'; DnsZone = 'privatelink.vaultcore.azure.net'; ZoneName = 'keyvault' }
            @{ Name = "pe-$FunctionAppName-blob"; ResourceId = $storageId; GroupId = 'blob'; DnsZone = 'privatelink.blob.core.windows.net'; ZoneName = 'blob' }
            @{ Name = "pe-$FunctionAppName-table"; ResourceId = $storageId; GroupId = 'table'; DnsZone = 'privatelink.table.core.windows.net'; ZoneName = 'table' }
            @{ Name = "pe-$FunctionAppName-queue"; ResourceId = $storageId; GroupId = 'queue'; DnsZone = 'privatelink.queue.core.windows.net'; ZoneName = 'queue' }
        )

        foreach ($ep in $endpoints) {
            Write-Host "  Creating: $($ep.Name)..."

            # DNS zone
            $existingZone = az network private-dns zone show --resource-group $ResourceGroupName --name $ep.DnsZone 2>$null
            if (-not $existingZone) {
                az network private-dns zone create --resource-group $ResourceGroupName --name $ep.DnsZone -o none
                az network private-dns link vnet create --resource-group $ResourceGroupName --zone-name $ep.DnsZone --name "$vnetName-link" --virtual-network $vnetName --registration-enabled false -o none
            }

            # Private endpoint
            az network private-endpoint create --resource-group $ResourceGroupName --name $ep.Name --vnet-name $vnetName --subnet snet-private-endpoints --private-connection-resource-id $ep.ResourceId --group-id $ep.GroupId --connection-name "pec-$($ep.GroupId)" --location (az group show --name $ResourceGroupName --query location -o tsv) -o none
            az network private-endpoint dns-zone-group create --resource-group $ResourceGroupName --endpoint-name $ep.Name --name default --private-dns-zone $ep.DnsZone --zone-name $ep.ZoneName -o none
        }
    }
}

# --- Optional: VNet Integration ---
if ($EnableVNetIntegration) {
    Write-Host "`n=== Upgrading to EP1 + VNet Integration ===" -ForegroundColor Green
    Write-Host "  This will add ~`$166 USD/month (EP1 Elastic Premium plan)"

    if ($PSCmdlet.ShouldProcess($FunctionAppName, "Upgrade to EP1 and enable VNet integration")) {
        $planName = (az functionapp show --resource-group $ResourceGroupName --name $FunctionAppName --query appServicePlanId -o tsv).Split('/')[-1]
        Write-Host "  Upgrading plan $planName to EP1..."
        az appservice plan update --name $planName --resource-group $ResourceGroupName --sku EP1 -o none

        Write-Host "  Enabling VNet integration..."
        $subnetId = (az network vnet subnet show --resource-group $ResourceGroupName --vnet-name "vnet-$FunctionAppName" --name snet-functions --query id -o tsv)
        az functionapp vnet-integration add --resource-group $ResourceGroupName --name $FunctionAppName --vnet "vnet-$FunctionAppName" --subnet snet-functions -o none
    }
}

# --- Validation ---
if (-not $SkipValidation) {
    Write-Host "`n=== Post-Migration Validation ===" -ForegroundColor Cyan

    $funcApp = az functionapp show --resource-group $ResourceGroupName --name $FunctionAppName | ConvertFrom-Json
    $funcCount = (az functionapp function list --resource-group $ResourceGroupName --name $FunctionAppName | ConvertFrom-Json).Count

    Write-Host "Function App State:    $($funcApp.state)"
    Write-Host "Functions Loaded:      $funcCount"
    Write-Host "HTTPS Only:            $($funcApp.httpsOnly)"
    Write-Host "Min TLS:               $($funcApp.siteConfig.minTlsVersion)"
    Write-Host "FTPS:                  $($funcApp.siteConfig.ftpsState)"
    Write-Host "HTTP/2:                $($funcApp.siteConfig.http20Enabled)"

    if ($funcApp.state -ne 'Running' -or $funcCount -eq 0) {
        Write-Warning "Function App may not be healthy! State: $($funcApp.state), Functions: $funcCount"
        Write-Host "`nRollback commands:" -ForegroundColor Red
        Write-Host "  # Restore shared key storage auth:"
        Write-Host "  az functionapp config appsettings set -g $ResourceGroupName -n $FunctionAppName --settings 'AzureWebJobsStorage=<original-connection-string>'"
        Write-Host "  az functionapp config appsettings delete -g $ResourceGroupName -n $FunctionAppName --setting-names AzureWebJobsStorage__accountName"
        Write-Host "  # Re-enable KV access policies (if needed):"
        Write-Host "  az keyvault update --name $kvName -g $ResourceGroupName --enable-rbac-authorization false"
    } else {
        Write-Host "`nMigration completed successfully!" -ForegroundColor Green
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Base hardening:        Applied"
if ($EnableNetworkIsolation) { Write-Host "Network isolation:     Deployed (~`$31/month)" }
if ($EnableVNetIntegration) { Write-Host "VNet integration:      Deployed (~`$197/month total)" }
Write-Host ""
