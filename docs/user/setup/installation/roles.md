---
id: roles
title: Roles
slug: /gettingstarted/roles
description: How to grant users access to the CIPP App
---

# Roles

CIPP utilizes the Secure Application model, which means that each action will be done under the user permissions of the CIPP-SAM user. To limit the access users have you can use the role management system.

For hosted clients, invites and roles can be managed by e-mailing the helpdesk.

CIPP features a role management system which utilises the [Roles feature of Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization?tabs=invitations#roles). The roles available in CIPP are as follows:

| Role Name | Description                                                                   |
| --------- | ----------------------------------------------------------------------------- |
| readonly  | Only allowed to read and list items and send push messages to users.          |
| editor    | Allowed to perform everything, except editing tenant exclusions and standards |
| admin     | Allowed to perform everything.                                                |

You can assign these roles to users using the [Role Management system of Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization?tabs=invitations#role-management)

{% hint style="info" %}
After the invite link is sent to the user, they must click on it to accept the invite and gain access to the app. The invites expire after a specific amount of time.. Note this link must be sent manually to them, it is not e-mailed.
{% endhint %}

To assign a role to a user you would follow these steps:

* Go to the Azure Portal.
* Go to your CIPP Resource Group.
* Select your CIPP Static Web App `CIPP-SWA-XXXX`.
* Select **Role Management** (Not IAM Role Management).
* Select **invite user**.
* Add the roles for the user. Multiple roles can be applied to the same user.

## Custom Roles

While CIPP only supplies these roles by default, you can create your own roles and permissions by editing the staticwebapp.config.json file. To create a custom role you can do the following instructions. Note that you cannot change any of the default roles as these are required for the application to function.

* Get your copy of the [configuration file](https://github.com/KelvinTegelaar/CIPP/blob/main/staticwebapp.config.json)
* List the CIPP-API respository([https://github.com/KelvinTegelaar/CIPP-API](https://github.com/KelvinTegelaar/CIPP-API))
* Each folder in this list is the name of the API that's called.&#x20;
* For each API you want to secure, create a route entry. For example if you only want shared mailboxes to be created by the custom role SharedMailboxAdmins, admins, and editors you add the following section in the route property:
  * ```json
    {
      "route": "/api/AddSharedMailbox",
      "allowedRoles": ["SharedMailboxAdmins","admins","editors"]
    }
    ```

If you are a hosted client, Custom Roles are supported by sending your configuration file to our helpdesk.&#x20;
