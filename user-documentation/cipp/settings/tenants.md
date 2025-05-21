---
description: Centralized Tenant Management and Oversight
---

# Tenants

The Tenants page is a centralized platform for administrators to oversee and manage all tenants within CIPP. This page provides detailed information about each tenant and facilitates actions related to their exclusion status and permissions.

This page also shows tenants that have been excluded or removed due to the number of errors received.

### Action Buttons

| Action        | Description                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Force Refresh | This will force a refresh of your tenants list. NOTE: Your tenants list may temporarily clear while CIPP rebuilds the list |

### Table Details

The main table on this page displays information relating to all tenants that you have a GDAP relationship with

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Exclude Tenants</td><td>Excludes the selected tenant(s) from being managed by CIPP. They will no longer display in the tenant selector and standards, alerts, etc. will not apply</td><td>true</td></tr><tr><td>Include Tenants</td><td>Removes an exclusion on selected tenant(s)</td><td>true</td></tr><tr><td>Refresh CPV Permissions</td><td>Refreshes the CPV permissions for the selected tenant(s) [<a href="tenants.md#refreshing-a-tenants-permissions">More information</a>]</td><td>true</td></tr><tr><td>Reset CPV Permissions</td><td>Resets the CPV permissions for the selected tenant(s) by deleting the Service Principal and re-adding it [<a href="tenants.md#resetting-a-tenants-cpv-permissions">More information</a>]</td><td>true</td></tr><tr><td>Remove Tenant</td><td></td><td>true</td></tr><tr><td>More Info</td><td>Opens Extended Info flyout</td><td>false</td></tr></tbody></table>

### Refreshing a Tenant's Permissions

CIPP works using the Control Panel Vendor API - Also known as the CPV API. The CPV API is used to add the CIPP application to your managed tenants and allows CIPP to execute actions within these tenants. Each night at 00:00 UTC the permissions are refreshed for all tenants. This makes sure that the application always has the latest set of required access.

For more details, see more about this on the [Refreshing a Tenants Permission](tenants.md#refreshing-a-tenants-permissions) section of our troubleshooting documentation.

### Resetting a Tenant's CPV Permissions

{% hint style="warning" %}
**Note:** The CPV Reset is a powerful tool and should be used only if you cannot manage permissions at all. This action will delete the Service Principal and re-add it, which may be necessary if there are issues with the existing permissions setup.
{% endhint %}

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
