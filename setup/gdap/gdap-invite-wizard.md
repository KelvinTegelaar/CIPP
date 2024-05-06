# GDAP Invite Wizard

The invite wizard allows you to create an invite that has the roles you need defined, after accepting this invite under the global administrator of the tenant the Wizard automatically attaches the roles to the GDAP relationship every three hours.&#x20;

* Go to CIPP
* Click on GDAP management
* Click on Role Wizard
* Select the roles you would like to use in your relationship. To see the minimum roles check out our role documentation [here](https://docs.cipp.app/setup/gdap/recommended-roles)
  * Selecting the Company Administrator (Global Admin) role is not advised. Relationships will have to be manually added every two years if you do.
* After creating the roles use the side menu to click on Invite Wizard
* Select the roles to include in the invite, and click next, then submit. This generates a unique, per tenant URL. **You have to create a new invite link (and onboarding link) for each tenant you invite.**
* Open this URL as the Global Administrator of your client, and accept the invite. (Open a different browser, log in with the Global Admin of the Tenant you want to enroll and then copy/paste/enter the Invite Link and the onboarding link) 
  * Do this for each tenant you want to have added under your GDAP relationship.
* Go back to GDAP Management
* Go to GDAP Relationships
* Click the button "Map Recently Approved Relationships" which will finish the GDAP setup.
* Wait 1 hour and perform a Tenant Cache Clear. The Tenant will now be visible inside of CIPP after a refresh of the page.&#x20;

{% hint style="danger" %}
You must add your CIPP service account user to the groups created in **your** Azure Active Directory after executing the invite wizard for the first time. These groups will be in your Azure Active Directory with the name "M365 GDAP {Role Name}"
{% endhint %}
