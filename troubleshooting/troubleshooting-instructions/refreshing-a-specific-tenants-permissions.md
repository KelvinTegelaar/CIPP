---
description: >-
  Details about performing a CPV refresh on your tenants, what it does, and when
  this is necessary.
---

# Refreshing a Specific Tenant's Permissions

CIPP works using the Control Panel Vendor API - Also known as the CPV API. The CPV API is used to add the CIPP application to your managed tenants and allows CIPP to execute actions within these tenants. Each night at 00:00 UTC the permissions are refreshed for all tenants. This makes sure that the application always has the latest set of required access.

Sometimes, pressing the CPV Refresh button might be required when a new tenant is added, or a new GDAP permission is applied to the CIPP-SAM service account. Administrators can refresh a tenant's permissions and perform a CPV permissions refresh for a specific tenant in CIPP by following these steps:

* Navigate to Settings -> CIPP -> Application Settings.
* Click on the Tenants tab.
* Find the tenant for which you need to perform the refresh in the list
* Click on the blue refresh icon in the "Actions" column.
* The user executing this task will see which permissions have been applied.

{% hint style="info" %}
Upon refresh, CIPP sends a request to the tenant to add the CIPP application and its permissions to it. This will attempt to apply all permissions, even if a tenant does not have a specific license available. Pay attention to the permissions the refresh informs you have been applied.
{% endhint %}
