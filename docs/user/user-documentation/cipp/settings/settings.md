---
description: View and amend the settings for your CIPP instance.
---

# General

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
Clearing this cache can severely impact performance of your CIPP instance and will also remove any personal settings such as the selected theme.
{% endhint %}

You can clear the cached information used by the tenant selector, best practices analyser and domain analyser features.

#### Tenant Access Check

You can check that the required access and configuration is in place for specific tenants using the tenant selector and "Run access check" button.

If your tenant access checks are failing please see the [Troubleshooting](../../../../../troubleshooting/) page for help.

#### Domain Name System Resolver

You can switch providers to either Google, Cloudflare or Quad9 for your domain analyser results.

#### Access backend

You can get the URLs to access backend features directly in the Azure AD portal from the Security tab.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecDnsConfig" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecPasswordConfig" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecPasswordConfig" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
