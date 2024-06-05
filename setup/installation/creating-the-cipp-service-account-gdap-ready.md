# Creating the CIPP Service Account (GDAP Ready)

## Setup Video for the CIPP Service Account

{% embed url="https://app.guidde.com/share/playbooks/i9fztXsCUWjY3cr8mySvCX" fullWidth="false" %}

## CIPP Service Account Setup

1. Create a new account. We recommend to name this account something obvious such as "CIPP Integration" and give it the username "CIPP@domain.tld"
   1. This account must be a Global Administrator while setting up the integration. These permissions may be removed after the integration has been setup.
2. Add the account to the correct groups

* The CIPP user must be added to the **"AdminAgents**" group and the groups you've assigned for GDAP. The minimum GDAP **groups** & permissions CIPP needs to function are:
  * Application Administrator
  * Authentication Policy Administrator
  * Cloud App Security Administrator
  * Cloud Device Administrator
  * Exchange Administrator
  * Intune Administrator
  * Privileged Role Administrator
  * Security Administrator
  * SharePoint Administrator
  * Teams Administrator
  * User Administrator
  * Privileged Authentication Administrator

These groups are **not roles in your own tenant.** These must be the GDAP assigned **groups.**

* Do not over-assign GDAP groups. Too many permissions will stop GDAP functionality. For more information check out Microsoft's documentation [here](https://learn.microsoft.com/en-us/partner-center/gdap-faq)

3. This account must have **Microsoft** multi-factor authentication enforced for each logon, either via Conditional Access when available or via [Per User MFA](https://account.activedirectory.windowsazure.com/UserManagement/MultifactorVerification.aspx) when Conditional Access is not available.

* You may not use any other authentication provider than Microsoft for this account. Duo or other providers will not work. For more information on this see [this](https://learn.microsoft.com/en-us/partner-center/partner-security-requirements-mandating-mfa#supported-mfa-options)

