# Creating GDAP Relationships

## What is GDAP

GDAP allows you to access your clients tenants according to the role you've set. This mean you are able to give one employee "helpdesk" access, and another employee "security" access.

GDAP requires a mapping between roles and security groups in your partner tenant. CIPP creates these groups and mappings for you. **Do not select all roles.** This is not supported by Microsoft and CIPP. Selecting all roles (or most roles) will guarantee unexpected results. Carefully consider which roles are required for your deployment.

{% hint style="info" %}
**GDAP relationships have a maximum age, but may auto-renew if setup correctly.**
{% endhint %}

## So what do I need to do?

If you did not perform GDAP migration of your tenants via CIPP or believe you will need to setup new GDAP relationships with your clients, you will have some extra steps you will need to perform.

First, you'll need to create the CIPP Service Account and use the SAM Wizard in CIPP to assign the necessary groups. CIPP uses this account to help alleviate some of the manual steps by generating the invite links using the GDAP Invite Wizard. Once those relationships have been established, you can use the onboarding links CIPP generated to complete the process. Below are the steps broken out with more detail, and links to where to go and perform the necessary actions.

***

### 1. Create the CIPP Service Account:

For video and walkthrough steps of this process, check out the details on the [Creating the CIPP Service Account](creating-the-cipp-service-account-gdap-ready.md) page, and come back here once you're done.

{% hint style="warning" %}
It's important to ensure you follow the steps for creating this account to the letter. Including **adding the user to the relevant groups** (_for any not getting created in the next step_), and **MFA & conditional access expectations are adhered to**. See notes on the page for details.
{% endhint %}

***

### 2. Setup the SAM Wizard:

Execute the steps in [Executing the SAM Setup Wizard](executing-the-sam-setup-wizard.md) and return to this page.&#x20;

{% hint style="warning" %}
If this is your first time running through the SAM Wizard, you'll want to **make sure you're authorizing using the CIPP Service Account you created in Step 1**.

If you've accidentally authenticated with a different account, you can run through this wizard again, selecting option 2 to change the user you're authenticating with.
{% endhint %}

***

### 3. Creating GDAP Relationships:

Before you'll be able to use CIPP you will need to establish a GDAP relationship for each of your tenants, for those steps follow the instructions on the [GDAP Invite Wizard](../gdap/gdap-invite-wizard.md) page.

{% hint style="warning" %}
**Manual Intervention Required:** You will still need to accept each invite manually as a local Global Administrator for each tenant, which may take some time depending on the number of clients you're looking to onboard into CIPP.
{% endhint %}

***

### 4. Onboard your Tenants:

Once CIPP is successfully able to connect to your GDAP relationships, you will want to onboard these tenants into CIPP by following the instructions on the [Adding Tenants & Consenting the CIPP-SAM Application](adding-tenants-and-consenting-the-cipp-sam-application.md) page.

***
