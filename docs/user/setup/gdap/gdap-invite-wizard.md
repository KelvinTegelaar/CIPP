# GDAP Invite Wizard

Microsoft has removed DAP relationships for everyone and force migrated people that have not yet migrated themselves to GDAP. If you have not performed any migration yourself please check this via the partner portal:

* Please go to [https://partner.microsoft.com/en-us/dashboard/commerce2/granularadminaccess/list](https://partner.microsoft.com/en-us/dashboard/commerce2/granularadminaccess/list) and login with your account.
* Click on the client you are trying to validate access for. You should see a relationship name.
* If you see a relationship starting with "MLT\_" you have been force migrated by Microsoft to GDAP and must perform a GDAP migration.

The invite wizard allows you to create an invite that has the roles you need defined, after accepting this invite under the global administrator of the tenant the Wizard automatically attaches the roles to the GDAP relationship every three hours. To use the invite wizard instead of the migration tool you can execute the following steps:

* Go to CIPP
* Click on GDAP management
* Click on Role Wizard
* Select the roles you would like to use in your relationship. To see the minimum roles check out our role documentation [here](https://docs.cipp.app/setup/gdap/recommended-roles)
  * Selecting the Company Administrator (Global Admin) role is not advised. Relationships will have to be manually added every two years if you do.
* After creating the roles use the side menu to click on Invite Wizard
* Select the roles to include in the invite, and click next, then submit. This generates a unique, per tenant URL. You have to create a new invite link for each tenant you invite.
* Open this URL as the Global Administrator of your client, and accept the invite.
* Do this for each tenant you want to have added under your GDAP relationship.

{% hint style="danger" %}
You must add your CIPP service account user to the groups created after executing the invite wizard for the first time.
{% endhint %}
