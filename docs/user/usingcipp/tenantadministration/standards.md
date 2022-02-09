---
id: standards
title: Standards
description: Apply pre-defined standards to your Microsoft 365 CSP tenants.
slug: /usingcipp/tenantadministration/standards
---

## Overview

:::danger Danger Will Robinson

A standard applies actual configuration to the selected tenant, not just monitoring.

Note that by default, Standards are not applied to any tenants upon setup / configuration of CIPP.  Applying any standard should be done with full understanding of the effects it will have, detailed below.
:::

The Standards page allows you to (re)set specific standards over your entire client base. The wizard allows you to select the most common settings and corrects them **every 3 hours** by default. If a user disables a setting it'll automatically be restored.

In the next version, we will be adding more standardised options and settings, we'll also allow you to send an alert to either your RMM system or e-mail. 

Below are the standards explained...

## Meet the Standards

| Standard                                                       | Impact      | Description                                                                                                |
|----------------------------------------------------------------|:-----------:|------------------------------------------------------------------------------------------------------------|
| Enable Unified Audit Log                                       | Low         | Enables organisation customisation and the unified audit log for the tenant, allow you to use the logging engine Microsoft has. We have opted not to enable Mailbox logging as this is enabled default on all mailboxes now, and changing this setting is not recommended. |
| Enable Security Defaults                                       | Medium/High | Enables Microsoft's Security Defaults for Azure AD. For more info about Security Defaults, check out [this Microsoft blog](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/concept-fundamentals-security-defaults) or [this CyberDrain blog](https://www.cyberdrain.com/automating-with-powershell-enabling-secure-defaults-and-sd-explained/). |
| Set mailbox Sent items Delegation                              | Low         | This makes sure that e-mails sent from shared mailboxes or delegate mailboxes, end up in the mailbox of the shared/delegate mailbox instead of the sender, allowing you to easily keep them together. |
| Require Admin Consent for Applications                         | Medium      | This setting prevents users from adding / consenting to OAuth / Azure AD applications, but instead requires an admin to approve the access and any permissions required by the application. This prevents several OAuth phishing attack vectors which have proven to be common attack vectors lately. |
| Do not expire passwords                                        | Low         | Sets passwords to never expire for tenant, recommended to use in conjunction with secure secure password requirements. |
| Enable usernames instead of pseudo-anonymised names in reports | Low         | Microsoft announced some APIs and reports will no longer return names, to comply with compliance and legal requirements in specific countries. This proves an issue for a lot of MSPs because those reports are required for engineers to monitor and react on. This standard will apply a setting that shows usernames in those API calls / reports. |
| Enable Self service password reset                             | Medium      | Enables Self Service password Reset for *all users*. Communication is important as this will require users to register 2 authentication methods if they have not already. |
| Enable Modern Authentication                                   | Low         | Enables Modern Authentication. If your tenant was created after 2018 this should already be enabled. |
| Disable Basic Authentication                                   | High        | Disables most forms of basic user authentication, allows SMTP authentication as Microsoft does not consider this a legacy protocol yet. It's important to review the sign-in reports to identify impact for each customer. It will cut off any connection and block future connections using legacy authentication in addition to blocking applications or devices which do not support modern authentication. |
| Disable Shared Mailbox AAD account                             | Medium      | Shared mailboxes can allow direct login if the password is reset, this presents a security risk as do all shared login credentials. Microsoft's recommendation is to disable the user account for shared mailboxes. It would be a good idea to review the sign-in reports to establish potential impact. |
| Enable auto expanding archives                                 | Medium/High | Enables automatically expanding Archive Mailboxes. This has impacts on inactive mailboxes and recovering deleted mailboxes and once enabled cannot be disabled. Please read the [Microsoft documentation on autoexpanding archiving](https://docs.microsoft.com/en-gb/microsoft-365/compliance/enable-autoexpanding-archiving?view=o365-worldwide#before-you-enable-auto-expanding-archiving) carefully. |
| Enable Spoofing warnings for Outlook                           | Low         | Adds indicators to email messages received from external senders in Outlook. You can read more about this feature on [Microsoft's Exchange Team Blog](https://techcommunity.microsoft.com/t5/exchange-team-blog/native-external-sender-callouts-on-email-in-outlook/ba-p/2250098). |
| Enable per-user MFA for all users                              | Medium/High | Allows you to deploy per-user MFA for all the users in the tenant. Does not allow any exclusions. If you'd like to make exclusions, please use Conditional Access instead. |

### Impact Levels

:::success Low Impact

Changes which have no user-facing impact or minimal impact.

:::

:::caution Medium Impact

Changes which have a user impact that can be managed with a little communication.

:::

:::danger High Impact

Changes which should be carefully thought through and ideally managed with customers - may have significant impacts on how users interact with Microsoft 365.

:::

## Known Issues / Limitations

* These jobs run asynchronously every 3 hours per default, you can check the log for the current operation by looking for "Standards API" in the LogBook.
* The job engine might slow down other APIs temporarily if it has a lot to process.(loads of settings, loads of tenants).

If you have any further issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
