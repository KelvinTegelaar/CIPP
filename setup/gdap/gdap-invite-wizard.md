# GDAP Invite Wizard

The invite wizard allows you to create an invite that has the roles you need defined, after accepting this invite under the global administrator of the tenant the Wizard automatically attaches the roles to the GDAP relationship every three hours.&#x20;

* Go to CIPP
* Click on GDAP management
* Click on Role Wizard
* Select the roles you would like to use in your relationship. To see the minimum roles check out our role documentation [here](https://docs.cipp.app/setup/gdap/recommended-roles)

{% hint style="warning" %}
Selecting the Company Administrator (Global Admin) role is not advised. Relationships will have to be manually added every two years if you do.
{% endhint %}

* After creating the roles use the side menu to click on **Invite Wizard**
* Select the roles to include in the invite, and click next, then submit. You will receive two URLS:

## Invite Link

Open this URL as the Global Administrator of your client, and accept the invite.

## Onboarding Link

This link finishes the onboarding process immediately and is only to be used by a CIPP admin. Do not open this link under a client account.

{% hint style="danger" %}
You must add your CIPP service account user to the groups created in **your** Azure Active Directory after executing the invite wizard for the first time. These groups will be in your Azure Active Directory with the name "M365 GDAP {Role Name}"
{% endhint %}

### Use the Invite Wizard

See the instructions for using the invite Wizard [here](broken-reference). This tooling requires that you, or a global administrator accepts the invite under the tenant you are inviting.
