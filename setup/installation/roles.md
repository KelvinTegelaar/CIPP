---
description: How to grant users access to the CIPP App
---

# Roles

CIPP utilizes the Secure Application model, which means that each action will be done under the user permissions of the CIPP-SAM user. To limit the access users have you can use the role management system.

For hosted clients, invites and roles can be managed by logging into the management portal [here](https://management.cipp.app/)

CIPP features a role management system which utilises the [Roles feature of Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization?tabs=invitations#roles). The roles available in CIPP are as follows:

| Role Name  | Description                                                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| readonly   | Only allowed to read and list items and send push messages to users.                                                                                                  |
| editor     | Allowed to perform everything, except editing tenants, exclusions, and standards.                                                                                     |
| admin      | Allowed to perform everything.                                                                                                                                        |
| superadmin | A role that is only allowed to access the settings menu for specific high-privilege settings, such as setting up the [owntenant.md](owntenant.md "mention") settings. This role must be combined with 'admin' |

You can assign these roles to users using the [Role Management system of Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization?tabs=invitations#role-management)

{% hint style="info" %}
After the invite link is sent to the user, they must click on it to accept the invite and gain access to the app. The invites expire after a specific amount of time. Note this link must be sent manually to them, it is not e-mailed.
{% endhint %}

To assign a role to a user you would follow these steps:

* Go to the Azure Portal.
* Go to your CIPP Resource Group.
* Select your CIPP Static Web App `CIPP-SWA-XXXX`.
* Select **Role Management** (Not IAM Role Management).
* Select **invite user**.
* Add the roles for the user. Multiple roles can be applied to the same user.

## Custom Roles

While CIPP only supplies the above roles by default, you can create your own Custom Roles and apply them to your users with 'editor' or 'readonly' rights, admin users are unaffected by custom roles. Set up Custom Roles by following these steps:

* Go to CIPP.
* Go to Application Settings > SuperAdmin > Custom Roles.
* Select a Custom Role from the list or start typing to create a new one if you do not yet have any.
  * Please ensure that your custom role is entirely in lowercase and does not contain spaces or special characters.
* For Allowed Tenants select a subset of tenants to manage or AllTenants.
  * If AllTenants is selected, you can block a subset of tenants using Blocked Tenants.
* Select the API permission from the listed categories and choose from None, Read or Read/Write.
  * To find out which API endpoints are affected by these selections, click on the Info button.

{% hint style="warning" %}
Please note that this functionality is in beta and not officially supported. Removing permissions will result in an error message on affected endpoints. The error message will note which permission is missing.
{% endhint %}

If you are a hosted client, you can add custom roles to your users from the Management App. Just start typing the role name in the select box and add it when prompted. Make sure that your users have the 'editor' or 'readonly' role selected as well.

If you set up Custom Roles by modifying staticwebapp.config.json, you should revert those changes and migrate to the new Custom Role management.
