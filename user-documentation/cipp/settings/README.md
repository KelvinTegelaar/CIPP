---
icon: gear
description: View and amend the settings for your CIPP instance.
---

# Application Settings

From the Settings section of the menu you can find the Settings page where you can:

* Access diagnostic info
* Find helpful links to administrative tools
* Run access or permission checks
* Change configurable settings and more

### Details

#### Version

You can use the "Run permissions check" button to check that your CIPP Azure AD Application has the correct permissions assigned. This now also performs a check of the correct MFA claims.

#### Cache

{% hint style="warning" %}
Clearing this cache can severely impact performance of your CIPP instance and will also remove any personal settings such as the selected theme.
{% endhint %}

You can clear the cached information used by the tenant selector, best practices analyser and domain analyser features.

#### Password Style

Choose the default password style you would like to use for new user creation and password resets.

#### Backup

Click "Manage Backups" to launch the CIPP Backup Settings page.

#### Domain Name System Resolver

You can switch providers to either Google, Cloudflare or Quad9 for your domain analyser results.

***

{% include "../../../.gitbook/includes/feature-request.md" %}
