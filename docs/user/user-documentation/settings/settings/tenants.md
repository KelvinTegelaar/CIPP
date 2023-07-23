---
description: Centralized Tenant Management and Oversight
---

# Tenants

## Overview

The Tenants page serves as a centralized platform for administrators to manage and overview all tenants within the system, providing detailed information about each tenant and facilitating actions related to their exclusion status and permissions.

### Table Fields

The main table on this page contains the following columns:

1. **Name**: The display name of the tenant.
2. **Default Domain**: The default domain name for the tenant.
3. **Relationship Type**: The status of delegated privileges for the tenant. It can show values such as "DAP Only", "GDAP & DAP", "GDAP", "No Access", and "Unknown".
4. **Excluded**: A boolean indicating whether the tenant is excluded.
5. **Exclude Date**: The date the tenant was excluded, if applicable.
6. **Exclude User**: The user who excluded the tenant, if applicable.

### Features and Actions

#### Tenant Exclusion Control

{% hint style="info" %}
CIPP provides the functionality to exclude specific tenants. This means that any action to be taken on these tenants is prevented, and they are hidden from display.
{% endhint %}

To exclude a tenant, locate the corresponding row in the tenant table and click on the eye slash icon in the 'Actions' column. This triggers a confirmation dialog box to verify the action. Once confirmed, a POST request is sent to the `ExecAddExcludeTenant` endpoint listed below, excluding the selected tenant.

#### Removing a Tenant's Exclusion Status

You can remove a tenant's exclusion status by clicking on the eye icon in the "Actions" column of the relevant row. This action calls the `removeExcludeTenant` mutation, which sends a DELETE request to the `ExecRemoveExcludeTenant` endpoint with the tenant's `customerId`. A confirmation dialog box will appear before this action is performed.

#### Refreshing a Tenant's Permissions

You can refresh a tenant's permissions by clicking on the recycle icon in the "Actions" column of the relevant row. This action calls the `refreshPermissions` function, which sends a GET request to the `ExecCPVPermissions` endpoint with the tenant's `customerId` as a query parameter. A confirmation dialog box will appear before this action is performed. This function updates the tenant's permissions, removing old permissions and applying the necessary ones based on the current configuration.

### API Endpoints

The page primarily interacts with the following API endpoints:

`ExecRemoveExcludeTenant`: Handles requests to remove a tenant's exclusion status.

`ExecAddExcludeTenant`: Handles requests to exclude a tenant.

`ExecCPVPermissions`: Handles requests to refresh a tenant's permissions.

`ExecExcludeTenant`: Retrieves a list of all tenants for the table.



