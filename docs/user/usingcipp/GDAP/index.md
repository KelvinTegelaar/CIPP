---
id: gdap
title: GDAP
description: Using the GDAP migration tool
slug: /usingcipp/GDAP/migration
---

A temporary addition to CIPP is the GDAP Migration tool. The GDAP migration tool was created in collabration with Microsoft's GDAP team. Please follow the instructions on this page to the letter to achieve a succesful migration to GDAP.

The GDAP migration tool will function until October 31st. Migrations after this date will need to be performed manually.

## What is GDAP

Accessing tenants as a Microsoft Partner is currently done through "DAP". DAP stands for delegated access permissions. DAP gives you Global Administrator access to all your tenants, but has limitations. Microsoft has decided to make DAP more secure, and also more functional. GDAP allows you to access the tenants according to the role you've set. This mean you are able to give one employee "helpdesk" access, and another employee "security" access.

GDAP requires a mapping between roles and security groups in your partner tenant. CIPP creates these groups and mappings for you.

GDAP relationships have a maximum age. Every 2 years(730 days) the relationships will need to be renewed. This currently is a manual action that needs to be performed by the tenant administrator.

GDAP will be a requirement from December 1st for Microsoft Partners, and you will not be able to make new DAP relationships from that point forward.

After the migration date of October 31st, new GDAP relationships will not be created in an automated fashion, and you must log onto the target tenant itself to accept GDAP invites. This is very time consuming so it's recommended to migrate to GDAP now.

:::info
For more information on GDAP, check out Microsoft's own documentation [here](https://learn.microsoft.com/en-us/partner-center/gdap-introduction)
:::

## Using the GDAP Wizard

The GDAP wizard will use the temporary APIs to create a relationship for you, and create the security groups and assign the roles to these groups. You may change the name of the groups after the migration has been performed.

CIPP assumes that you will want a relationship of 730 days.

Follow the list below before starting the GDAP Wizard. You must execute each of these steps to successfully migrate to GDAP.

- You must be a global Admin and in the 'AdminAgents' group to perform this.
- Go to your CIPP instance and click on GDAP -> Migration Wizard. Click the button to enable the migration API.
- Follow the link returned by the application to go to your Secure Application Model app in Azure.
- Click on API Permissions
- Click on Add and choose "APIs My organization uses"
- Find "Partner Customer Delegated Administration"
- Add all permissions under "Delegated" and "Application" and click Add Permissions
- Click on "Grant Admin Consent for {Organization}".
- Go back to CIPP and perform all steps in the wizard.

You can view the status of the GDAP migration in the GDAP Migration Status tab. When the migration has been completed for all your tenants you can move users into the new groups to use GDAP.

Please remember to put the CIPP-SAM user in these groups as well. It is not recommended to add all groups to a user.

## Known Issues / Limitations

<NoKnownIssues />
