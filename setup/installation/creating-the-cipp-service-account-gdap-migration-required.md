# Creating the CIPP Service Account (GDAP Migration Required)

## Setup Video for the CIPP Service Account

{% embed url="https://app.guidde.com/share/playbooks/i9fztXsCUWjY3cr8mySvCX" fullWidth="false" %}

## CIPP Service Account Setup

1. Create a new account. We recommend to name this account something obvious such as "CIPP Integration" and give it the username "CIPP@domain.tld"
   1. This account must be a Global Administrator while setting up the integration. These permissions may be removed after the integration has been setup.
2. Add the account to the AdminAgent group. This group is required to be able to perform a GDAP migration.
3. This account must have **Microsoft** multi-factor authentication enforced for each logon, either via Conditional Access when available or via [Per User MFA](https://account.activedirectory.windowsazure.com/UserManagement/MultifactorVerification.aspx) when Conditional Access is not available
   * You may not use any other authentication provider than Microsoft for this account. Duo or other providers will not work. For more information on this see [this](https://learn.microsoft.com/en-us/partner-center/partner-security-requirements-mandating-mfa#supported-mfa-options)

## Setup the SAM Wizard

Execute the steps in [executing-the-sam-setup-wizard.md](executing-the-sam-setup-wizard.md "mention") and return to this page.

## Migrating to GDAP

Before you'll be able to use CIPP you will need to perform a GDAP migration for each of your tenants, for those steps.

[invite-wizard.md](../../user-documentation/gdap-migration/invite-wizard.md "mention")

