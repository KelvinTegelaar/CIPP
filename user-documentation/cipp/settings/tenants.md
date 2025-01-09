---
description: Centralized Tenant Management and Oversight
---

# Tenants

## Overview

The Tenants page is a centralized platform for administrators to oversee and manage all tenants within CIPP. This page provides detailed information about each tenant and facilitates actions related to their exclusion status and permissions.

This page also shows tenants that have been excluded, or removed due to the amount of errors received.

## Table Fields

The main table on this page displays the following columns:

<table><thead><tr><th width="203">Field Name</th><th>Description</th></tr></thead><tbody><tr><td>Name</td><td>The display name of the tenant.</td></tr><tr><td>Default Domain</td><td>The default domain name for the tenant.</td></tr><tr><td>Relationship Type</td><td>The status of delegated privileges for the tenant. Possible values include "DAP Only", "GDAP &#x26; DAP", "GDAP", "No Access", and "Unknown".</td></tr><tr><td>Excluded</td><td>A boolean field indicating whether the tenant is excluded.</td></tr><tr><td>Exclude Date</td><td>The date when the tenant was excluded, if applicable.</td></tr><tr><td>Exclude User</td><td>The user who excluded the tenant, if applicable.</td></tr></tbody></table>

## Features and Actions

### Actions List on the Tenants Tab

The actions available in the "Actions" column for each tenant include:

* **Exclude Tenants:** Excludes selected tenants from display and actions.
* **Include Tenants:** Includes selected tenants back into the management list.
* **Refresh CPV Permissions:** Refreshes the CPV permissions for the selected tenants.
* **Reset CPV Permissions:** Resets the CPV permissions for the selected tenants by deleting the Service Principal and re-adding it.

### Tenant Exclusion Control

{% hint style="info" %}
CIPP allows administrators to exclude specific tenants. Excluded tenants are hidden from display and are unaffected by actions within CIPP.
{% endhint %}

To exclude a tenant:

1. Find the tenant's row in the table.
2. Click on the eye slash icon in the "Actions" column to trigger a confirmation dialog.
3. Confirm the action, this excludes the tenant from showing up in the tenant selector and any actions applied to it.

### Removing a Tenant's Exclusion Status

Administrators can remove a tenant's exclusion status by:

1. Locating the tenant's row in the table.
2. Clicking on the eye icon in the "Actions" column.
3. confirm the action, this includes the tenant and makes it show up in the tenant selector and have actions applied to it again.

### Refreshing a Tenant's Permissions

CIPP works using the Control Panel Vendor API - Also known as the CPV API. The CPV API is used to add the CIPP application to your managed tenants and allows CIPP to execute actions within these tenants. Each night at 00:00 UTC the permissions are refreshed for all tenants. This makes sure that the application always has the latest set of required access.

Sometimes, pressing the CPV Refresh button might be required when a new tenant is added or a new GDAP permission is applied to the CIPP-SAM service account. Administrators can refresh a tenant's permissions by:

1. Finding the tenant's row in the table.
2. Clicking on the blue refresh icon in the "Actions" column.
3. Confirming the action to initiate the permissions refresh process.

For more details, see more about this on the [Refreshing a Tenants Permission](tenants.md#refreshing-a-tenants-permissions) section of our troubleshooting documentation.

### Resetting a Tenant's CPV Permissions

{% hint style="warning" %}
**Note:** The CPV Reset is a powerful tool and should be used only if you cannot manage permissions at all. This action will delete the Service Principal and re-add it, which may be necessary if there are issues with the existing permissions setup.
{% endhint %}

**To reset a tenant's CPV permissions:**

1. Select the tenant(s) for which you need to reset permissions.
2. Go to the bulk actions menu and choose "CPV Reset".
3. Confirm the action to reset the CPV permissions, which will delete and re-add the Service Principal.

## Filtering Tenants

You can filter tenants based on their exclusion status:

* **Excluded Tenants:** Filtered by the condition "Excluded eq true."
* **Included Tenants:** Filtered by the condition "Excluded eq false."

## Additional Functionality

The Tenants page also provides export and filter functionalities:

* **Export:** Download a CSV file of the tenant table for offline use or analysis.
* **Filter:** Use the 'Filter' dropdown to display tenants based on whether they are excluded or included.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
