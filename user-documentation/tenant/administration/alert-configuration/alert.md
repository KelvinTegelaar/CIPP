---
description: Manage scheduled tenant alerts.
---

# Add Alert

CIPP offers a set of scheduled, recurring alert checks. Some of these duplicate Microsoft Alerts functionality in a more MSP-friendly manner and some are not available as a Microsoft Alert at this time. Similar to [Tenant Standards](../../standards/), you configure alerts using the wizard to select one or more tenants or -All Tenants- to apply alerts globally, then select from the list of available alerts.

### Alert Types

Within CIPP, there are two types of alerts:

* Audit Log Alert - These alerts are based on Microsoft audit logs.&#x20;
* Scripted CIPP Alert - These alerts have been developed by CIPP to pull from sources other than the audit logs.

### Alert Timing

* Audit Log Alerts - Processed in near real-time, but a small delay of up to 15 minutes is normal.
* Scripted CIPP Alerts - Each alert comes with a default value suggested by the CIPP team, but you can adjust it as needed. Alerts fire once per incident - for example, a full mailbox does not fire an alert every time it's checked. The available timings are:
  * 365 days / 1 year
  * 30 days / 1 month
  * 7 days / 1 week
  * 1 day
  * 4 hours
  * 1 hour
  * 30 minutes

### Alert Delivery Methods

* Webhook - This will deliver a JSON payload to the webhook configured in [CIPP Settings](../../../cipp/settings/notifications.md).
* PSA - This will deliver a formatted payload to the configured PSA in [CIPP Settings](../../../cipp/settings/notifications.md).
* Email - This will deliver an HTML-formatted table to the email address provided in [CIPP Settings](../../../cipp/settings/notifications.md).&#x20;

### Available Scripted CIPP Alerts

* Alert on users without any form of MFA
* Alert on admins without any form of MFA
* Alert on tenants without a Conditional Access policy, while having Conditional Access licensing available
* Alert on changed admin Passwords
* Alert on licensed users that have not logged in for 90 days
* Alert on % mailbox quota used
* Alert on % SharePoint quota used
* Alert on licenses expiring in 30 days
* Alert on new apps in the application approval list
* Alert on Security Defaults automatic enablement
* Alert if Defender is not running (Tenant must be on-boarded in Lighthouse)
* Alert on Defender Malware found (Tenant must be on-boarded in Lighthouse)
* Alert on unused licenses
* Alert on overused licenses
* Alert on expiring application secrets
* Alert on expiring APN certificates
* Alert on expiring VPP tokens
* Alert on expiring DEP tokens
* Alert on soft deleted mailboxes
* Alert on device compliance issues
* Alert on Huntress Rogue Apps detected
* Alert on expiring application certificates

### Available Template Audit Log Alerts

* A new Inbox rule is created
* A new Inbox rule is created that forwards e-mails to the RSS feeds folder
* A new Inbox rule is created that forwards e-mails to a different email address
* A new Inbox rule is created that redirects e-mails to a different email address
* A existing Inbox rule is edited
* A existing Inbox rule is edited that forwards e-mails to the RSS feeds folder
* A existing Inbox rule is edited that forwards e-mails to a different email address
* A existing Inbox rule is edited that redirects e-mails to a different email address
* A user has been added to an admin role
* A user sessions have been revoked
* A users MFA has been disabled
* A user has been removed from a role
* A user password has been reset
* A user has logged in from a location not in the input list
* A service principal has been created
* A service principal has been removed
* A user has logged in a using a known VPN, Proxy, Or anonymizer
* A user has logged in a using a known hosting provider IP

### Example Usage

You might want to be alerted when a particular account logs into one of your tenants. For example, Global Admins or break glass accounts. This is relatively simple if you have consistent naming across your tenants i.e. mylovelybreakglassaccount@tentantdomains.com

{% stepper %}
{% step %}
Create an Audit log alert


{% endstep %}

{% step %}
In the tenant selector, select All Tenants


{% endstep %}

{% step %}
Select Azure AD as the log source


{% endstep %}

{% step %}
Select "Operation" as the When property


{% endstep %}

{% step %}
Select "Equals To" as the is property


{% endstep %}

{% step %}
In the unput field select "A user logged in"


{% endstep %}

{% step %}
Add an extra set of variables


{% endstep %}

{% step %}
Select "Username" as the When property


{% endstep %}

{% step %}
Select Like as the is property


{% endstep %}

{% step %}
Enter the username to test for across all tenants i.e. mylovelybreakglassaccount@\* (Note the \* after the @ to match all domains)


{% endstep %}

{% step %}
Choose the action(s) you want and save the alert.


{% endstep %}
{% endstepper %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
