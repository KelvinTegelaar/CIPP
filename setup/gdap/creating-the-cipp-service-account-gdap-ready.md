# Creating the CIPP Service Account

## Setup Video for the CIPP Service Account

***

{% embed url="https://app.guidde.com/share/playbooks/i9fztXsCUWjY3cr8mySvCX" fullWidth="false" %}

{% hint style="danger" %}
### When setting up your Service Account, remember:

### Administration Requirements

1. **Must be a Global Administrator while setting up the integration.** These permissions may be removed after the integration has been setup.
2. **Must be added to the AdminAgents group.** This group is required for connection to the Microsoft Partner API.

### Multi-factor Authentication

1. **MFA Setup:** This account must have **Microsoft** MFA enforced for each logon.
   1. Use [Conditional Access](../installation/conditionalaccess.md) when available or via [Per User MFA](https://account.activedirectory.windowsazure.com/UserManagement/MultifactorVerification.aspx) when not available.
2. **Microsoft MFA is mandatory.** Do not use alternative providers like Duo, and ensure it's setup **before any login attempts.**
   1. Reference [this article on Supported MFA options](https://learn.microsoft.com/en-us/partner-center/security/partner-security-requirements-mandating-mfa#supported-mfa-options) from Microsoft for more details.
{% endhint %}

## Setup Walkthrough for the CIPP Service Account

***

This guide walks you through the process from the video of setting up the CIPP Service Account. Follow the instructions on this page to the letter to ensure a seamless setup process down the line.

The CIPP service account will be the account used to execute any actions on your tenants via CIPP.&#x20;

To get started, head to the Microsoft Entra Portal's user overview at [entra.microsoft.com](https://entra.microsoft.com/)

**If you would like to use notifications, webhook triggers, or exporting to other system the account you use must have a mailbox available. This mailbox will be used for outgoing reports, exports, and notifications.**&#x20;

1. Click on the "New user" button.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2Fv5BfyGiEY4FqmbqxRCymsD_doc.png?alt=media\&token=ad9a3831-cec6-4244-b5f4-f90d08ae87ea\&time=Fri%20Jul%2026%202024%2021:57:39%20GMT-0400%20\(Eastern%20Daylight%20Time\))

2. Create a new internal user in your organization

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FsTTkLSePkCmuzgTg9nFYvJ_doc.png?alt=media\&token=2017aff5-ecc2-4030-ba90-9b955a14ec97\&time=Fri%20Jul%2026%202024%2021:57:44%20GMT-0400%20\(Eastern%20Daylight%20Time\))

3. Enter a username in the field, we recommend something identifiable like "CIPP Service Account"

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2Fmp4FiwSvkpKyfKgcbQ3Ac9_doc.png?alt=media\&token=eda4079d-869a-40bd-8a0f-2c436806be3e\&time=Fri%20Jul%2026%202024%2021:57:46%20GMT-0400%20\(Eastern%20Daylight%20Time\))

4. Enter "CIPP Service Account" in the Display Name field. Set the password to something strong, and save this password in a secure location

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FhLEJyFsy7Dxs69tcJkYt4p_doc.png?alt=media\&token=216ec97e-b904-4dcb-8a4c-1f359ae5fc91\&time=Fri%20Jul%2026%202024%2021:57:47%20GMT-0400%20\(Eastern%20Daylight%20Time\))

5. Click on "Next: Properties".

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FreEjqnr9Xp15EZ3UPq6ZVJ_doc.png?alt=media\&token=acee15fa-1072-459a-ac97-77c4fb8e30bd\&time=Fri%20Jul%2026%202024%2021:57:49%20GMT-0400%20\(Eastern%20Daylight%20Time\))

6. Click on "Next: Assignments".

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FeY6Qmd985ryQ1gDMCLiL86_doc.png?alt=media\&token=a8fddef5-d5be-4419-9d9c-582385be0847\&time=Fri%20Jul%2026%202024%2021:57:50%20GMT-0400%20\(Eastern%20Daylight%20Time\))

7. If you are a Microsoft Partner, and want to manage all your client tenants, click on Add Group.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FpwCpPxMXQuSwM9V8e6hVGi_doc.png?alt=media\&token=9cb5bf0c-a093-4610-a099-a9e15f163f78\&time=Fri%20Jul%2026%202024%2021:57:51%20GMT-0400%20\(Eastern%20Daylight%20Time\))

8. Select the AdminAgents group. This group is required for connection to the Microsoft Partner API.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FpZSBZsEEMGeyHRon7PjrnM_doc.png?alt=media\&token=790a804e-52cf-4f8e-b6cc-b1caace518cd\&time=Fri%20Jul%2026%202024%2021:57:59%20GMT-0400%20\(Eastern%20Daylight%20Time\))

9. Select your GDAP groups

If you have already migrated to GDAP you select your GDAP groups at this stage. If you migrated using CIPP these groups start with `M365 GDAP`, For the latest required GDAP roles check our [recommended-roles.md](recommended-roles.md "mention") page.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FohuBSMhxAWuhe35TnuLP9o_doc.png?alt=media\&token=fcdc99db-ea70-46bb-8276-1a21d659948e\&time=Fri%20Jul%2026%202024%2021:58:00%20GMT-0400%20\(Eastern%20Daylight%20Time\))

10. Click "Add role"

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FrNKg3zxDF4cCxMzhGPHRfT_doc.png?alt=media\&token=eee64997-0439-4965-ad41-c8a89d343d36\&time=Fri%20Jul%2026%202024%2021:58:01%20GMT-0400%20\(Eastern%20Daylight%20Time\))

11. Add the Global Administrator Role

Find the Global Admin role. This role is required for the CIPP-SAM application creation, and is recommended to be removed directly after installation.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FpqpK88ZAo9i5iijFyHjy6u_doc.png?alt=media\&token=8e954768-0be0-4dd0-8da1-1b0063fdd1e0\&time=Fri%20Jul%2026%202024%2021:58:01%20GMT-0400%20\(Eastern%20Daylight%20Time\))

12. Click "Next: Review + create"

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FpnRtZ7vUas2492Hrzv5Fnr_doc.png?alt=media\&token=b193f7ba-8881-44ad-8df1-1d42001ec558\&time=Fri%20Jul%2026%202024%2021:58:01%20GMT-0400%20\(Eastern%20Daylight%20Time\))

13. Click on "Create". This creates the account.

![preview](https://storage.app.guidde.com/v0/b/guidde-production.appspot.com/o/quickguiddeScreenshots%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2Fi9fztXsCUWjY3cr8mySvCX%2FdBdzTWoKBR8LRgmQYnAWFK_doc.png?alt=media\&token=2fb657ce-f9c5-47bc-8dfc-d6e71a4f11a3\&time=Fri%20Jul%2026%202024%2021:58:02%20GMT-0400%20\(Eastern%20Daylight%20Time\))
