---
id: settings
title: Settings
slug: /usingcipp/settings/settings
description: View and amend the settings for your CIPP instance.
---

# Settings

From the Settings section of the menu you can find the Settings page where you can:

* Access diagnostic info
* Find helpful links to administrative tools
* Run access or permission checks
* Change configurable settings and more

### Details

#### Permissions Settings

You can use the "Run permissions check" button to check that your CIPP Azure AD Application has the correct permissions assigned. This now also performs a check of the correct MFA claims.

#### Tenant, Best Practice and Domain Analyser Cache

{% hint style="warning" %}
Performance & Data Clearing this cache can severely impact performance of your CIPP instance and will also remove any personal settings such as the selected theme.&#x20;
{% endhint %}

You can clear the cached information used by the tenant selector, best practices analyser and domain analyser features.

#### Tenant Access Check

You can check that the required access and configuration is in place for specific tenants using the tenant selector and "Run access check" button.

If your tenant access checks are failing please see the [Troubleshooting](../../../../troubleshooting/) page for help.

#### Domain Name System Resolver

You can switch providers to either Google, Cloudflare or Quad9 for your domain analyser results.

#### Excluded Tenants

You can add tenants to the excluded tenant list to prevent CIPP from taking any action on these tenants in addition to removing them from display.

#### Access backend

You can get the URLs to access backend features directly in the Azure AD portal from the Security tab.

### Known Issues / Limitations
