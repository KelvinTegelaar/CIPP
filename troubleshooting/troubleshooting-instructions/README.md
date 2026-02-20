# Troubleshooting Instructions

{% hint style="danger" %}
<mark style="color:red;">**You must always supply all information requested in this document.**</mark>
{% endhint %}

To ensure we can assist you with any CIPP issue, complete details are essential. This includes all three mandatory screenshots: Permissions Check, GDAP Check, and Tenant Access Check. Without these, we cannot offer support, as they are the foundation for understanding and resolving your issue.

{% stepper %}
{% step %}
### **Perform Permissions & GDAP Check**

* Navigate to CIPP -> Application Settings -> Permissions tab
* CIPP will run both checks automatically.
* **What to Share**: A screenshot of the page including both boxes, and an Export of the report by pressing the Export button. You can redact any sensitive info as long as it's still clearly usable to verify the checks (e.g. redact domain but leave username visible on UPN)

{% hint style="info" %}
The output of these checks includes information that may be possible for you to solve the issue on your own at this point. Review any warnings or errors to determine what needs to be corrected. If you're still stuck, please ask away in Discord or reach out to the helpdesk if you are a sponsor.
{% endhint %}
{% endstep %}

{% step %}
### Perform Tenant Access Check

If the issue relates to a specific tenant, locate the tenant in the table on the Permissions tab. Screenshot the tenant's entry being sure to include the Last Run, Graph Status, Exchange Status, and Missing Roles columns.

{% hint style="info" %}
The output of these checks includes information that may be possible for you to solve the issue on your own at this point. Review any warnings or errors to determine what needs to be corrected. If you're still stuck, please ask away in Discord or reach out to the helpdesk if you are a sponsor.
{% endhint %}
{% endstep %}
{% endstepper %}

***

## **If Errors Persist After Checks:**

* **Capture Additional Screenshots**: If checks complete but you're still facing issues, please include a screenshot of the entire page where the error occurs.
* **Error Details**: If an error pop-up appears, include its screenshot or text. This helps us diagnose the problem more accurately.

{% hint style="info" %}
**Important**: Even if the error appears on only one page, all checks (Permissions, GDAP, and Tenant Access) are always required for us to provide support.
{% endhint %}

{% hint style="warning" %}
**Privacy Note**: Anonymize any sensitive data in your screenshots before sharing them on our Discord community if you are planning to do so.
{% endhint %}

***

## **Examples for Effective Communication:**

* **Good Troubleshooting Message**:
  * _Example:_ "I've been getting the error "User not found" on all pages related to exchange. I have executed all checks and the screenshots are included. I can see the GDAP checks are failing but I'm not sure on my next steps. How do I continue?"
  * _Includes_: All three check screenshots, detailed issue description, and additional error screenshots or text if applicable.
  * _Screenshots_: Clearly labeled and anonymized.
* **Ineffective Troubleshooting Message**:
  * _Example:_ "I am getting an error popup 500 on some pages"
  * _Lacks_: One or more required screenshots, detailed error description.
  * _Result_: Inability to provide support due to incomplete information.

**Remember**: Providing complete and accurate information is the cornerstone of our support process. Your thoroughness enables us to help you swiftly and effectively!

***

## Reminder:

{% hint style="danger" %}
#### When setting up your Service Account, remember:

#### Administration Requirements

1. **Must be at least Application Administration and User Administrator while setting up the integration.** These permissions may be removed after the integration has been setup.
2. **Must be added to the AdminAgents group.** This group is required for connection to the Microsoft Partner API.

#### GDAP Group Requirements

1. **Recommended Roles:** When going through the invite process in CIPP, these groups will be automatically created. If you performed the migration with CIPP, these groups will start with `M365 GDAP`.
   1. **Note that these groups are not roles in your tenant;** they must be **GDAP-assigned groups.** For the latest details, refer to [recommended-roles.md](../../setup/installation/recommended-roles.md "mention")
2. **Don't over-assign GDAP roles.** Too many permissions will stop GDAP functionality.
   1. Review Microsoft's [GDAP frequently asked questions ](https://learn.microsoft.com/en-us/partner-center/gdap-faq)page for more information.

#### Multi-factor Authentication

1. **MFA Setup:** This account must have **Microsoft** MFA enforced for each logon.
   1. Use [Conditional Access](../../setup/installation/conditionalaccess.md) when available or via [Per User MFA](https://account.activedirectory.windowsazure.com/UserManagement/MultifactorVerification.aspx) when not available.
2. **Microsoft MFA is mandatory.** Do not use alternative providers like Duo and ensure its setup **before any login attempts.**
   1. Reference [this article on Supported MFA options](https://learn.microsoft.com/en-us/partner-center/security/partner-security-requirements-mandating-mfa#supported-mfa-options) from Microsoft for more details.
{% endhint %}
