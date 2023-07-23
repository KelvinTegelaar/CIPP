---
description: Centralized Tenant Management and Oversight
---

# Tenants

### Overview

The Tenants page is a centralized platform for administrators to oversee and manage all tenants within the system. This page provides detailed information about each tenant and facilitates actions related to their exclusion status and permissions.

### Table Fields

The main table on this page displays the following columns:

<table><thead><tr><th width="203">Field Name</th><th>Description</th></tr></thead><tbody><tr><td>Name</td><td>The display name of the tenant.</td></tr><tr><td>Default Domain</td><td>The default domain name for the tenant.</td></tr><tr><td>Relationship Type</td><td>The status of delegated privileges for the tenant. Possible values include "DAP Only", "GDAP &#x26; DAP", "GDAP", "No Access", and "Unknown".</td></tr><tr><td>Excluded</td><td>A boolean field indicating whether the tenant is excluded.</td></tr><tr><td>Exclude Date</td><td>The date when the tenant was excluded, if applicable.</td></tr><tr><td>Exclude User</td><td>The user who excluded the tenant, if applicable.</td></tr></tbody></table>

### Features and Actions

#### Tenant Exclusion Control

{% hint style="info" %}
CIPP allows administrators to exclude specific tenants. Excluded tenants are hidden from display and are unaffected by actions within CIPP.
{% endhint %}

To exclude a tenant:

1. Find the tenant's row in the table.
2. Click on the eye slash icon in the "Actions" column to trigger a confirmation dialog.
3. Confirm the action to send a POST request to the `ExecAddExcludeTenant` endpoint. The selected tenant is then excluded.

#### Removing a Tenant's Exclusion Status

Administrators can remove a tenant's exclusion status by:

1. Locating the tenant's row in the table.
2. Clicking on the eye icon in the "Actions" column.
3. This action sends a DELETE request to the `ExecRemoveExcludeTenant` endpoint, effectively including the tenant back in.

#### Refreshing a Tenant's Permissions

Administrators can refresh a tenant's permissions by:

1. Finding the tenant's row in the table.
2. Clicking on the recycle icon in the "Actions" column.
3. This action sends a GET request to the `ExecCPVPermissions` endpoint. This function updates the tenant's permissions by removing old permissions and applying the necessary ones based on the current configuration.

### Additional Functionality

The Tenants page also provides export and filter functionalities. The 'Export' button allows you to download a CSV file of the tenant table for offline use or analysis. The 'Filter' dropdown lets you filter the tenants displayed in the table based on whether they are excluded or included.

### API Endpoints

The page interacts with the following API endpoints:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecCPVPermissions" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

* `ExecAddExcludeTenant`
* `ExecRemoveExcludeTenant`
