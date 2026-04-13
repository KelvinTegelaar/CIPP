---
description: View and amend notifications for your CIPP App
---

# Notifications

Configure notifications from CIPP.

CIPP provides alert notifications for Tenants and CIPP actions, sent as one combined table in an email or webhook body.

* [alert-configuration](../../tenant/administration/alert-configuration/ "mention") creates notifications regarding changes within a tenant. See that help page for more information on managing those alerts.
* CIPP Alerts relate to changes initiated via the CIPP platform.

## Available CIPP Alerts

Under the "Choose which logs you would like to receive alerts from" you will be able to select what you would like to receive alerts from CIPP actions. A sample of the alerts is listed below:

* New Accounts created via CIPP
* Removed Accounts via CIPP
* New Applications added via CIPP
* New Policies added via CIPP
* New Standards added via CIPP
* Removed Standards via CIPP
* Token Refresh Events

## Sending Methods

### E-mail

Enter as many email addresses as you need, separated by a comma.

Email will be sent from the service account used for the Setup Wizard.&#x20;

{% hint style="warning" %}
The service account must have a mailbox available. This can be accomplished by either assigning a license with Exchange to the service account permanently or temporarily and converting the service account's mailbox to a shared mailbox. If you do not have a mailbox available on the account, the log will state we could not send out the notifications.

If you have already completed the Setup Wizard prior to converting the service account to a shared mailbox you will want to rerun the Setup Wizard using the option "Refresh Tokens for existing application registration".
{% endhint %}

{% hint style="info" %}
Sent Items Notification emails **do not save** to the CIPP account's _Sent Items_ folder.
{% endhint %}

### Webhook

Enter a webhook URL. Data is formatted based on the receiving server:

| Service            | Format                                                |
| ------------------ | ----------------------------------------------------- |
| _slack.com_        | A separate markdown-formatted message for each alert. |
| _discord.com_      | A basic HTML formatted table.                         |
| All other services | JSON array of data values. Method is `POST`           |

{% hint style="warning" %}
Office 365 connector webhooks in Teams are deprecated as of [March 31, 2026](https://devblogs.microsoft.com/microsoft365dev/retirement-of-office-365-connectors-within-microsoft-teams/).
{% endhint %}

{% hint style="info" %}
Custom Webhook Formatting: Need something different for your webhook? Can you write PowerShell? Submit a PR on this repo: [CIPP-API](https://github.com/KelvinTegelaar/CIPP-API/tree/dev).
{% endhint %}

### Webhook Authentication

You are optionally able to set authentication on webhooks sent to your automation platform.

#### Authentication Methods

| Method                | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| None                  | No auth, POST is unauthenticated                              |
| Bearer Token          | Adds `Authorization: Bearer <token>` header                   |
| Basic Auth            | Standard HTTP basic auth                                      |
| API Key Header        | Custom header name + value (e.g. `x-api-key: abc123`)         |
| Custom Headers (JSON) | Used if the other methods are too restrictive for your needs. |

| Setting                       | Description                                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Webhook Bearer Token          | The token value only — CIPP prepends `Authorization: Bearer` automatically. Masked input.                                                                             |
| Webhook Basic Username        | Plain text username for HTTP basic auth.                                                                                                                              |
| Webhook Basic Password        | Password for HTTP basic auth. Masked input.                                                                                                                           |
| Webhook API Key Header Name   | The header name to use, e.g. `x-api-key`. Free text — whatever your endpoint expects.                                                                                 |
| Webhook API Key Header Value  | The value for that header. Masked input.                                                                                                                              |
| Webhook Custom Headers (JSON) | A full JSON object of key/value header pairs. Must be valid JSON. Example: `{"Authorization":"Bearer token","x-api-key":"value"}`. Masked input — stored as a secret. |

## Log and Severity Settings

### Log Alerts

Selecting one or more of these log alert types will send an alert to your configured methods if that event occurs in the [logs](../logs/ "mention").

### Alert Severity

Selecting these severities will send any [logs](../logs/ "mention") entry that matches the severity level to your configured methods. See the [#logbook-severity](../logs/#logbook-severity "mention") chart on the Logbook docs page on the different severities and what they cover.

{% hint style="info" %}
"Alert" is selected by default. Without this selected any alerts you set up via [alert-configuration](../../tenant/administration/alert-configuration/ "mention") will not be sent.
{% endhint %}

## Notification Setting Options

| Setting                                         | Description                                                                                                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Receive one email per tenant                    | Toggling on this option will separate emailed alerts by tenant as opposed to sending all matching log entries as a single alert.                                    |
| Send notifications to configured integration(s) | This will enable notifications to be sent to the integration(s) you have configured.                                                                                |
| Use Standardized Alert Schema                   | Opts the webhook payload into the versioned `schemaVersion: 1.0` envelope. Off by default — existing integrations are unaffected unless this is explicitly enabled. |

{% hint style="warning" %}
Previously saved credential values are retained in the form even when the auth type is switched. Users should be aware their old values may persist until explicitly cleared.
{% endhint %}

### Standardized Alert Schema

```
{
    "schemaVersion": "1.0",
    "source": "CIPP",
    "invoking": "Get-CIPPAuditLogContent",
    "title": "Risky Sign-Ins Detected",
    "tenant": "contoso.onmicrosoft.com",
    "generatedAt": "2026-03-31T16:00:00.0000000Z",
    "alertCount": 3,
    "payload": [
            { "API": "Get-CIPPAuditLogContent", "UserId": "user1@contoso.onmicrosoft.com" },
            { "API": "Get-CIPPAuditLogContent", "UserId": "user2@contoso.onmicrosoft.com" },
            { "API": "Get-CIPPAuditLogContent", "UserId": "user3@contoso.onmicrosoft.com" }
        ]
}
```

{% hint style="danger" %}
Those who are utilizing the Rewst crate to handle CIPP notifications should not enable the Standardized Alert Schema as it has not been updated to handle this new format.
{% endhint %}

## Send Test Alert

You are able to select to send a test alert. Select which options you want to include in your test before clicking `Confirm`.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
