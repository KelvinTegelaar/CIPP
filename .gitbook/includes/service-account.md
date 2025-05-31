---
title: Service Account
---

{% hint style="danger" %}
## When setting up your Service Account, remember:

## Administration Requirements

1. **Must be a Global Administrator while setting up the integration.** These permissions may be removed after the integration has been setup.
2. **Must be added to the AdminAgents group.** This group is required for connection to the Microsoft Partner API.

## GDAP Group Requirements

1. **Recommended Roles:** When going through the invite process in CIPP, these groups will be automatically created. If you performed the migration with CIPP, these groups will start with `M365 GDAP`.
   1. **Note that these groups are not roles in your tenant;** they must be **GDAP-assigned groups.** For the latest details, refer to [recommended-roles.md](../../setup/installation/recommended-roles.md "mention")
2. **Don't over-assign GDAP roles.** Too many permissions will stop GDAP functionality.
   1. Review Microsoft's [GDAP frequently asked questions ](https://learn.microsoft.com/en-us/partner-center/gdap-faq)page for more information.

## Multi-factor Authentication

1. **MFA Setup:** This account must have **Microsoft** MFA enforced for each logon.
   1. Use [Conditional Access](broken-reference) when available or via [Per User MFA](https://account.activedirectory.windowsazure.com/UserManagement/MultifactorVerification.aspx) when not available.
2. **Microsoft MFA is mandatory.** Do not use alternative providers like Duo, and ensure it's setup **before any login attempts.**
   1. Reference [this article on Supported MFA options](https://learn.microsoft.com/en-us/partner-center/security/partner-security-requirements-mandating-mfa#supported-mfa-options) from Microsoft for more details.
{% endhint %}
