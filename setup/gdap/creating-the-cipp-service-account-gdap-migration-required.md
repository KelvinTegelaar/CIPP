# GDAP's Importance in CIPP

## What is GDAP

GDAP allows you to access your clients tenants according to the role you've set. This means you are able to give one employee "helpdesk" access, and another employee "security" access.

GDAP requires a mapping between roles and security groups in your partner tenant. CIPP creates these groups and mappings for you. **Do not select all roles.** This is not supported by Microsoft and CIPP. Selecting all roles (or most roles) will guarantee unexpected results. Carefully consider which roles are required for your deployment.

{% hint style="info" %}
**GDAP relationships have a maximum age, but may auto-renew if setup correctly.**

Auto Extend is only available for relationships without the Global Administrator role. If your relationship contains the Global Administrator role you cannot enable this feature. This means that you will need to renew the relationship by reinviting the tenant every 2 years.
{% endhint %}

## **If you did not perform GDAP migration of your tenants via CIPP or believe you need to setup new GDAP relationships:**

You have some extra steps you'll need to perform, such as [creating a CIPP service account](creating-the-cipp-service-account-gdap-ready.md). CIPP uses this account to help alleviate some of the manual steps by generating the invite links you'll need to accept using the GDAP Invite Wizard.

The next few pages will walk you through the setting up of a CIPP Service Account, and the best practices you will need to follow within your microsoft environments to ensure you dont run into any issues.

It is important this account is setup correctly to ensure a seamless process when you get into CIPP and start the onboarding process.

If you have already migrated to GDAP and have a valid service account that you would like to use you can jump over to [Executing the SAM Setup Wizard](broken-reference), however, its important to ensure you follow the steps for creating this account to the letter. Including **the user having access to** [**the relevant security groups**](recommended-roles.md) and **MFA & conditional access expectations are adhered to**.
