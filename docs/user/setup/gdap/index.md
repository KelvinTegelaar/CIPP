---
description: Using the GDAP migration tool
---

# GDAP Migration Setup

## Options

Currently there are two ways to migrate to GDAP. The automated migration tool which is available until December 1, 2023, or the GDAP invite wizard.&#x20;

Both tools have slightly different setups; The automated GDAP migration tool requires you to add special permissions for the migration, but requires no further interaction. The invite tool requires you, or another global admin to logon to the clients tenant and accept the uniquely generated URL for this client.



### User the Invite Wizard

See the instructions for using the invite Wizard [here](../../user-documentation/gdap-migration/invite-wizard.md). This tooling requires that you, or a global administrator accepts the invite under the tenant.&#x20;

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
* Follow the link returned by the application, or go to your Secure Application Model app in Azure by going to Settings -> CIPP -> Application Settings -> Permissions Check -> Details -> CIPP-SAM.
* Click on API Permissions
* Click on Add and choose "APIs My organization uses"
* Find "Partner Customer Delegated Administration"
* Add all permissions under "Delegated" and "Application" and click Add Permissions
* Click on "Grant Admin Consent for {Organization}".
* Go back to CIPP and perform all steps in the wizard for _**a single tenant**_
* Once you have tested and are satisfied all is working as expected, you can now carry out the wizard again for multiple tenants at once.

You can view the status of the GDAP migration in the GDAP Migration Status tab. When the migration has been completed for all your tenants you can move users into the new groups to use GDAP.

Please remember to put the "CIPP Integration" user in these groups as well. It is not recommended to add all groups to a user.
