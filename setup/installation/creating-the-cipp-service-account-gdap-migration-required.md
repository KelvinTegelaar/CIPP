# GDAP Migration Required

## What is GDAP

GDAP allows you to access your clients tenants according to the role you've set. This mean you are able to give one employee "helpdesk" access, and another employee "security" access.

GDAP requires a mapping between roles and security groups in your partner tenant. CIPP creates these groups and mappings for you. Do not select all roles. This is not supported by Microsoft and CIPP. Selecting all roles(or most roles) will guarantee unexpected results. Carefully consider which roles are required for your deployment.

GDAP relationships have a maximum age, but may auto-renew if setup correctly.

## So what do I need to do?

If you did not perform GDAP migration of your tenants via CIPP or believe you will need to setup new GDAP relationships with your clients, you will have a few extra steps you will need to perform. To start will, you will still want to create the CIPP Service Account and execute the SAM Wizard. You will then need to go through the process of generating invite links to accept within your client environments using the GDAP Invite Wizard.

### 1. Create the CIPP Service Account

* For video and walkthrough steps of this process, check out the details on the [creating-the-cipp-service-account-gdap-ready.md](creating-the-cipp-service-account-gdap-ready.md "mention") page, and come back here once you're done.

### 2. Setup the SAM Wizard

* Execute the steps in [executing-the-sam-setup-wizard.md](executing-the-sam-setup-wizard.md "mention") and return to this page.

### 3. Migrating to GDAP

* Before you'll be able to use CIPP you will need to perform a GDAP migration for each of your tenants, for those steps follow the instructions in [gdap-invite-wizard.md](../gdap/gdap-invite-wizard.md "mention")

### 4. Onboard your Tenants

* Once CIPP is successfully able to connect to your GDAP relationships, you will want to onboard these tenants into CIPP by following the instructions on the [adding-tenants-and-consenting-the-cipp-sam-application.md](adding-tenants-and-consenting-the-cipp-sam-application.md "mention") page.
