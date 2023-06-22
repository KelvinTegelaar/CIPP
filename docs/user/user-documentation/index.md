---
id: gdap
title: GDAP
slug: /usingcipp/GDAP/migration
description: Using the GDAP migration tool
---

# GDAP

A temporary addition to CIPP is the GDAP Migration tool. The GDAP migration tool was created in collabration with Microsoft's GDAP team. Please follow the instructions on this page to the letter to achieve a succesful migration to GDAP.

The GDAP migration tool will function until March 2023. Migrations after this date will need to be performed manually.

### What is GDAP

{% hint style="info" %}
The set migration dates have been changed by Microsoft. Find the latest information [here](https://learn.microsoft.com/en-gb/partner-center/announcements/2022-october#17)
{% endhint %}

Accessing tenants as a Microsoft Partner is currently done through "DAP". DAP stands for delegated access permissions. DAP gives you Global Administrator access to all your tenants, but has limitations. Microsoft has decided to make DAP more secure, and also more functional. GDAP allows you to access the tenants according to the role you've set. This mean you are able to give one employee "helpdesk" access, and another employee "security" access.

GDAP requires a mapping between roles and security groups in your partner tenant. CIPP creates these groups and mappings for you. Do not select all roles - This is not supported by Microsoft and CIPP. Selecting all roles(or most roles) will guarantee unexpected results. Carefully consider which roles are required for your deployment.

GDAP relationships have a maximum age. Every 2 years(730 days) the relationships will need to be renewed. This currently is a manual action that needs to be performed by the tenant administrator.

GDAP will be a requirement from February 1st for Microsoft Partners, and you will not be able to make new DAP relationships from that point forward.

After the migration date of March 31st, new GDAP relationships will not be created in an automated fashion, and you must log onto the target tenant itself to accept GDAP invites. This is very time consuming so it's recommended to migrate to GDAP now.

### Using the GDAP Wizard

{% hint style="warning" %}
The GDAP migration wizard is offered as-is. Bug reports, feature requests, or issues will not be accepted for the GDAP migration wizard.

if your customers have conditional access policies enabled it is likely that further configuration will be required on each of those tenants. For more info see Microsoft's own documentation [here](https://learn.microsoft.com/en-us/partner-center/gdap-faq#what-is-the-recommended-next-step-if-the-conditional-access-policy-set-by-the-customer-blocks-all-external-access-including-csps-access-aobo-to-the-customers-tenant)
{% endhint %}

The GDAP wizard will use the temporary APIs to create a relationship for you, and create the security groups and assign the roles to these groups. You may change the name of the groups after the migration has been performed.

CIPP assumes that you will want a relationship of 730 days.

Follow the list below before starting the GDAP Wizard. You must execute each of these steps to successfully migrate to GDAP.

* You must be a global Admin and in the 'AdminAgents' group to perform this.
* Go to your CIPP instance and click on GDAP -> Migration Wizard. Click the button to enable the migration API.
  * The Enable API button can fail if the migration has been previously performed or the tool has been activated. You can continue at this stage to add the permissions to your secure application model app.
* Follow the link returned by the application, or go to your Secure Application Model app in Azure by going to Settings -> Permissions Check -> Details -> CIPP-SAM.
* Click on API Permissions
* Click on Add and choose "APIs My organization uses"
* Find "Partner Customer Delegated Administration"
* Add all permissions under "Delegated" and "Application" and click Add Permissions
* Click on "Grant Admin Consent for {Organization}".
* Go back to CIPP and perform all steps in the wizard for _**a single tenant**_
* Once you have tested and are satisfied all is working as expected, you can now carry out the wizard again for multiple tenants at once.

You can view the status of the GDAP migration in the GDAP Migration Status tab. When the migration has been completed for all your tenants you can move users into the new groups to use GDAP.

Please remember to put the CIPP-SAM user in these groups as well. It is not recommended to add all groups to a user.

### Recommended roles for CIPP

As CIPP is an application that touches many parts of M365 selecting the roles might be difficult. The following roles are recommended for CIPP, but you may experiment with less permissive groups at your own risk.

* Application Administrator
* User Administrator
* Intune Administrator
* Exchange Administrator
* Security Administrator
* Cloud App Security Administrator
* Cloud Device Administrator
* Teams Administrator
* Sharepoint Administrator
* Authentication Policy Administrator
* Privileged Role Administrator
* Privileged Authentication Administrator (Only required if you want to be able to delete global admins within tenants from CIPP)

### Known Issues / Limitations
