# GDAP Invite Wizard

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
You must add your CIPP service account user to the groups created after executing the invite wizard for the first time. These groups will be in your Azure Active Directory with the name "M365 GDAP {Role Name}"
{% endhint %}
