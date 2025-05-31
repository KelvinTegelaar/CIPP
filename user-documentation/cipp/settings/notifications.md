---
description: View and amend notifications for your CIPP App
---

# Notifications

Configure notifications from CIPP.

CIPP provides alert notifications for Tenants and CIPP actions, sent as one combined table in an email or webhook body.

* [Tenant Alerts](../../security/incidents/list-incidents-1.md) create notifications regarding changes within a tenant. See that help page for more information on managing those alerts.
* CIPP Alerts relate to changes initiated via the CIPP platform.

### Available CIPP Alerts

Under the "Choose which logs you would like to receive alerts from" you will be able to select what you would like to receive alerts from CIPP actions. A sample of the alerts is listed below:

* New Accounts created via CIPP
* Removed Accounts via CIPP
* New Applications added via CIPP
* New Policies added via CIPP
* New Standards added via CIPP
* Removed Standards via CIPP
* Token Refresh Events

### Sending Methods

#### E-mail

Enter as many email addresses as you need, separated by a comma.

Email will be sent from the service account used for the Setup Wizard.&#x20;

{% hint style="warning" %}
The service account must have a mailbox available. This can be accomplished by either assigning a license with Exchange to the service account permanently or temporarily and converting the service account's mailbox to a shared mailbox. If you do not have a mailbox available on the account, the log will state we could not send out the notifications.

If you have already completed the Setup Wizard prior to converting the service account to a shared mailbox you will want to rerun the Setup Wizard using the option "Refresh Tokens for existing application registration".
{% endhint %}

{% hint style="info" %}
Sent Items Notification emails **do not save** to the CIPP account's _Sent Items_ folder.
{% endhint %}

#### Webhook

Enter a webhook URL. Data is formatted based on the receiving server:

| Service              | Format                                                |
| -------------------- | ----------------------------------------------------- |
| _webhook.office.com_ | A basic HTML formatted table.                         |
| _slack.com_          | A separate markdown-formatted message for each alert. |
| _discord.com_        | A basic HTML formatted table.                         |
| All other services   | JSON array of data values.                            |

{% hint style="info" %}
Custom Webhook Formatting Need something different for your webhook? Can you write PowerShell? Submit a PR on this repo: [CIPP-API\Scheduler\_CIPPNotifications](https://github.com/KelvinTegelaar/CIPP-API/tree/dev/Scheduler_CIPPNotifications).
{% endhint %}

### Notification Setting Options

| Setting                                         | Description                                                                               |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Receive one email per tenant                    | Toggling on this option will separate emailed alerts by tenant                            |
| Send notifications to configured integration(s) | This will enable notifications to be sent to the integration(s) you have configured       |
| Include Tenant ID in alerts                     | This will include the tenant's ID for additional easy of identifying who the alert is for |

### Send Test Alert

You are able to select to send a test alert. Select which options you want to include in your test before clicking `Confirm`.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
