# Tenant onboarding

## Overview

The GDAP Invite Wizard simplifies setting up GDAP relationships with your clients by assigning the correct roles and ensuring the CIPP-SAM application is correctly configured for each tenant. To get started with generating GDAP invites inside CIPP, navigate to `Tenant Administration` -> `GDAP Management` and follow the instructions below.

***

## **Wizard Steps**

### **Step 1: Click on Add Tenant**

To get started, we click the "Add Tenant" button. The overview page shows you your current GDAP configuration

### **Step 2: Generate CIPP Default Template**

If you have never used the GDAP wizard before, you will have the option to generate the CIPP Defaults Template. This template allows you to create the optimal role configuration for CIPP.

{% hint style="info" %}
**This option will create 12 new groups in your Azure AD if they do not exist and add the CIPP user to them.** For more information on which roles will have groups created for them, you can check out the [Recommended Roles](../gdap/recommended-roles.md) page.
{% endhint %}

### **Step 3: Select GDAP Role Template and generate invites**

Choose the role template to use from the list of role templates, and choose the amount of invites you'd like to generate. You can use this to generate the exact amount of invites for tenants you'd like to onboard.

***

## **Post-Invite Actions**

After submission, you will see as many rows as invites you've requested, with two URLs in a table:

* **Invite Link**: This URL is for the **Global Administrator** in your client tenant to accept the invite.
* **Onboarding Link**: This URL is to be used by a **CIPP admin** to complete the onboarding process. It should not be used under a client account.

***

## Role Management Considerations

Any additional users who need access to your Microsoft CSP Tenants must be manually added to the relevant security groups. These groups start with "M365 GDAP".
