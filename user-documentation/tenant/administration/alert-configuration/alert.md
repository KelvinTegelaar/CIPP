---
description: Manage scheduled tenant alerts.
---

# Add Alert

{% hint style="info" %}
This same page will display for the edit alert action with the selected alert's information displayed to review, alter, and save.
{% endhint %}

CIPP offers a set of scheduled, recurring alert checks. Some of these duplicate Microsoft Alerts functionality in a more MSP-friendly manner and some are not available as a Microsoft Alert at this time. Similar to [standards](../../standards/ "mention"), you configure alerts using the wizard to select one or more tenants or -All Tenants- to apply alerts globally, then select from the list of available alerts.

## Alert Types

Within CIPP, there are two types of alerts:

* Audit Log Alert - These alerts are based on Microsoft audit logs.&#x20;
* Scripted CIPP Alert - These alerts have been developed by CIPP to pull from sources other than the audit logs.

## Alert Timing

* Audit Log Alerts - Processed in near real-time, but a small delay of up to 15 minutes is normal.
* Scripted CIPP Alerts - Each alert comes with a default value suggested by the CIPP team, but you can adjust it as needed. The available timings are:
  * 365 days / 1 year
  * 30 days / 1 month
  * 7 days / 1 week
  * 1 day
  * 4 hours
  * 1 hour
  * 30 minutes

## Notification Settings

### Custom Subject

This section will allow you to override the default notification subject with your own custom text. The custom notification will be prefixed with the tenant default domain name.

### Actions to take

* Webhook - This will deliver a JSON payload to the webhook configured in [notifications.md](../../../cipp/settings/notifications.md "mention").
* PSA - This will deliver a formatted payload to the configured PSA in [notifications.md](../../../cipp/settings/notifications.md "mention").
* Email - This will deliver an HTML-formatted table to the email address provided in [notifications.md](../../../cipp/settings/notifications.md "mention").&#x20;

### Alert Comment

This text block can include any custom information that you want to include with the alert. You can include helpful links, custom instructions, etc. Variable replacement is supported, eg `%tenantname%`.

## Setting Up an Audit Log Alert

{% @storylane/embed subdomain="app" linkValue="6wxwpjesdsrx" url="https://app.storylane.io/share/6wxwpjesdsrx" %}

## Setting Up A CIPP Scripted Alert

{% @storylane/embed subdomain="app" linkValue="9r1i7cklndrq" url="https://app.storylane.io/share/9r1i7cklndrq" %}

## Available Alerts

You can review the available alerts embedded below or navigate to [https://resources.cipp.app/?tab=alerts](https://resources.cipp.app/?tab=alerts).

{% @cipp-external-webpage-block/cyberdrain url="https://resources.cipp.app/?tab=alerts" fullWidth="true" %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
