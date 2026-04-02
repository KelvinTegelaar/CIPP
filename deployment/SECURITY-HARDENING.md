# CIPP Security Hardening

## Overview

CIPP supports three security tiers for Azure infrastructure. The base tier is applied automatically on new deployments. Existing deployments can use the migration script.

## Security Tiers

### Base (always applied, ~$0-5/month)

Applied unconditionally to all new deployments:

| Resource | Hardening |
|----------|-----------|
| **Key Vault** | RBAC authorization, soft delete (90 days), purge protection, firewall (deny + Azure bypass) |
| **Storage** | HTTPS-only, TLS 1.2, no public blob access, firewall (deny + Azure bypass) |
| **Function App** | HTTPS-only, TLS 1.2, FTPS disabled, HTTP/2, managed identity storage auth |
| **RBAC** | Key Vault Secrets User, Storage Blob Data Owner, Queue/Table Data Contributor, Storage Account Contributor |
| **SWA** | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, CORP |

### Network Isolation (`enableNetworkIsolation: true`, +~$31/month)

Adds private networking for Key Vault and Storage:

| Resource | Cost/month |
|----------|-----------|
| VNet (10.0.0.0/16) | Free |
| 4x Private Endpoints (KV, blob, table, queue) | ~$29.20 |
| 4x Private DNS Zones | ~$2.00 |

The Function App stays on the Consumption plan and accesses resources via Azure Services bypass (traffic stays on the Azure backbone — it does not traverse the public internet).

### VNet Integration (`enableVNetIntegration: true`, +~$197/month total)

Upgrades the Function App to Elastic Premium for full VNet integration:

| Resource | Cost/month |
|----------|-----------|
| EP1 Plan (1 vCPU, 3.5 GiB, always-on) | ~$165.71 |
| Private Endpoints + DNS (included from above) | ~$31.20 |

This is only needed if you require the Function App's outbound traffic (to Microsoft Graph, Partner Center, etc.) to route through the VNet. For most deployments, the base tier + network isolation provides sufficient security.

## New Deployments

Set the parameters in your ARM deployment:

```json
{
    "enableNetworkIsolation": { "value": true },
    "enableVNetIntegration": { "value": false }
}
```

Or via Azure CLI:

```bash
az deployment group create \
    --resource-group rg-cipp \
    --template-file deployment/AzureDeploymentTemplate.json \
    --parameters enableNetworkIsolation=true
```

## Existing Deployments

Use the migration script:

```powershell
# Dry run first
./deployment/Migrate-SecurityHardening.ps1 \
    -ResourceGroupName rg-cipp \
    -FunctionAppName cippxyz \
    -WhatIf

# Apply base hardening
./deployment/Migrate-SecurityHardening.ps1 \
    -ResourceGroupName rg-cipp \
    -FunctionAppName cippxyz

# With network isolation
./deployment/Migrate-SecurityHardening.ps1 \
    -ResourceGroupName rg-cipp \
    -FunctionAppName cippxyz \
    -EnableNetworkIsolation
```

The script is idempotent — it detects what's already configured and only applies changes that are needed.

## What Changed

### Storage Auth Migration

The `AzureWebJobsStorage` app setting previously used a connection string with an account key:

```
DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...
```

This has been replaced with managed identity-based auth:

```
AzureWebJobsStorage__accountName=storagename
```

The Function App's system-assigned managed identity is granted the necessary RBAC roles (Blob Data Owner, Queue/Table Data Contributor, Storage Account Contributor).

**Note:** `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING` still uses a connection string because Azure Functions on the Consumption plan requires it for the content share. This is an Azure platform limitation.

### Key Vault Auth Migration

Key Vault access policies have been replaced with RBAC authorization. The Function App's managed identity is assigned the Key Vault Secrets User role.

### Rollback

If the Function App becomes unhealthy after migration, restore the original storage connection string:

```bash
az functionapp config appsettings set \
    -g <resource-group> -n <function-app> \
    --settings "AzureWebJobsStorage=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=..."
az functionapp config appsettings delete \
    -g <resource-group> -n <function-app> \
    --setting-names AzureWebJobsStorage__accountName
```
