---
description: >-
  The CPV Permissions Refresh functionality in CIPP is necessary for maintaining
  up-to-date permissions and ensuring smooth operation across managed tenants.
---

# Refreshing a Specific Tenant's Permissions via CPV API

## Overview

CIPP works using the Control Panel Vendor API - Also known as the CPV API. The CPV API is used to add the CIPP application to your managed tenants and allows CIPP to execute actions within these tenants. Every night at 00:00 UTC, permissions are automatically refreshed for all tenants to ensure that the application maintains the latest required access.

By understanding when and how to perform a CPV refresh, administrators can effectively manage permissions and troubleshoot potential issues, ensuring that CIPP continues to operate seamlessly within their Microsoft 365 environment.

## When is a CPV Refresh Necessary?

Sometimes, a manual CPV refresh might be needed in the following scenarios:

* **New Tenant Added:** When you add a new tenant under your management.
* **New GDAP Permissions:** When new GDAP permissions are applied to the CIPP-SAM service account.

## Steps to Perform a CPV Permissions Refresh

1. **Navigate to the Tenants List:**
   * Go to **Settings -> CIPP -> Application Settings**.
   * Click on the **Tenants** tab.
2. **Select the Tenant:**
   * Locate the tenant for which you need to perform the refresh in the list.
   * Click on the **blue refresh icon** in the "Actions" column next to the tenant's name.
3. **Confirm Refresh:**
   * A confirmation modal will appear, asking if you are sure you want to refresh permissions for the specified tenant.
   * Confirm the action to initiate the permissions refresh process.
4. **Review Permissions Applied:**
   * The user executing this task will see which permissions have been applied during the refresh process.

{% hint style="info" %}
**Important Considerations**

* **Automatic vs. Manual Refresh:** While permissions are automatically refreshed nightly, a manual refresh ensures immediate application of changes, such as new tenants or updated permissions.
* **Permission Notifications:** Pay close attention to the permissions that the system indicates have been applied. This is especially crucial if the tenant does not have a specific license available.
{% endhint %}

## What Happens During the Refresh?

Upon initiating a CPV refresh, CIPP sends a request to the tenant to add the CIPP application and its associated permissions. This process includes:

* **Service Principal Management:** The system checks and potentially resets the service principal if needed.
* **Application Permissions Update:** Necessary application permissions are added to ensure CIPP can perform its required functions.
* **Delegated Permissions Update:** Delegated permissions are updated to align with the current needs of the tenant.
