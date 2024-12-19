# Invite Wizard

## Overview

The GDAP Invite Wizard simplifies setting up GDAP relationships with your clients by assigning the correct roles and ensuring the CIPP-SAM application is correctly configured for each tenant. To get started with generating GDAP invites inside CIPP, navigate to `Tenant Administration` -> `GDAP Management` -> `Invite Wizard` and follow the instructions.

***

## **Wizard Steps**

### **Step 1: Select Roles**

Select which roles you want to add to the GDAP relationship from the mapped GDAP Roles.

{% hint style="info" %}
**CIPP Recommended Roles**: Click on `Use CIPP Recommended Roles and Settings` to automatically configure roles. **This option will create 12 new groups in your Azure AD if they do not exist and add the CIPP user to them.** For more information on which roles will have groups created for them, you can check out the [Recommended Roles](../gdap/recommended-roles.md) page.
{% endhint %}

### **Step 2: Invite Options**

* **Number of Invites**: Use the slider to choose how many invites you want to generate.

### **Step 3: Review and Confirm**

* **Confirm Selections**: Review the roles and settings to be applied to each GDAP relationship.
* **Submit**: Click **Submit** to generate the invites.&#x20;

***

## **Post-Invite Actions**

After submission, you will see as many rows as invites you've requested, with two URLs in a table:

* **Invite Link**: This URL is for the **Global Administrator** in your client tenant to accept the invite.
* **Onboarding Link**: This URL is to be used by a CIPP admin to complete the onboarding process. It should not be used under a client account.

{% hint style="danger" %}
You must add your CIPP service account user to the groups created in **your** Azure Active Directory after executing the invite wizard for the first time. These groups will be in your Azure Active Directory with the name "M365 GDAP {Role Name}"
{% endhint %}

***

## Role Management Considerations

Any additional users who need access to your Microsoft CSP Tenants must be manually added to the relevant security groups.

* Create a new security group in your partner tenant with the **Microsoft Entra roles can be assigned to the group** option set to **Yes**. Example: `GDAP_CIPP_Recommended_Roles`.
* Add users to this group.
* Add this group to the individual GDAP security groups that CIPP created. Example: `M365 GDAP Exchange Administrator`.
