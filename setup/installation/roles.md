---
description: How to grant users access to the CIPP App
---

# Adding Users and Managing Roles

### Initial User Setup

When you first set up CIPP, you will need to create your first user in one of two ways:

{% hint style="info" %}
This user should be at minimum given the role of `superadmin` to allow you to complete the setup of your additional users. This user will be used to configure the remaining settings within CIPP and certain features like role management are restricted to `superadmin` only.

We recommend that this user be your break glass CIPP `superadmin` account while all remaining users get invited via [custom-roles.md](../../user-documentation/cipp/advanced/super-admin/custom-roles.md "mention").
{% endhint %}

* For **hosted clients,** invites and roles can be managed by logging into the management portal [here](https://management.cipp.app/)
* For **self-hosted users**:
  * Go to the Azure Portal.
  * Go to your CIPP Resource Group.
  * Select your CIPP Static Web App `CIPP-SWA-XXXX`.
  * Under Settings, Select **Role Management** (Not IAM Role Management).
  * Select **invite user**.
  * Add the roles for the user. Multiple roles can be applied to the same user.

{% hint style="info" %}
After the invite link is sent to the user, they must click on it to accept the invite and gain access to the app. The invites expire after a specific amount of time. Note this link must be sent manually to them, it is not e-mailed.
{% endhint %}

### Additional User Setup

Once you have your initial `superadmin` user added, you are now able to set up additional users using the built-in roles or custom CIPP roles via [custom-roles.md](../../user-documentation/cipp/advanced/super-admin/custom-roles.md "mention").

### Built-In Roles

CIPP features a role management system which utilizes the [Roles feature of Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization?tabs=invitations#roles). The roles available in CIPP are as follows:

| Role Name  | Description                                                                                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| readonly   | Only allowed to read and list items and send push messages to users.                                                                                                  |
| editor     | Allowed to perform everything, except change system settings.                                                                                                         |
| admin      | Allowed to perform everything.                                                                                                                                        |
| superadmin | A role that is only allowed to access the settings menu for specific high-privilege settings, such as setting up the [owntenant.md](owntenant.md "mention") settings. |

You can assign these roles to users using the [custom-roles.md](../../user-documentation/cipp/advanced/super-admin/custom-roles.md "mention") page.

{% hint style="info" %}
You can assign built-in roles using Entra groups. Select Edit from the Action column next to the role in the CIPP Roles table and select an Entra group from the drop down. Don't forget to hit `Save` at the bottom!
{% endhint %}

## Custom Roles

While CIPP only supplies the above roles by default, you can create your own custom roles and apply them to your users with `editor` or `readonly` rights, admin users are unaffected by custom roles.

{% hint style="info" %}
Custom role permissions can only grant the highest level of the base permission. You cannot grant edit permissions to the `readonly` role. Assigning the `editor` role and then using a custom role to remove permissions will provide you with the functionality you're looking for there.
{% endhint %}

Set up Custom Roles by following these steps:

* Go to CIPP -> Advanced -> Super Admin -> CIPP Roles.
* Select a Custom Role from the list or start typing to create a new one if you do not yet have any.
  * Please ensure that your custom role is entirely in lowercase and does not contain spaces or special characters.
* Optionally select a Entra group this role will be mapped to. Adding an Entra group allows all users in this group to access CIPP.
* For Allowed Tenants select a subset of tenants to manage, tenant groups, or AllTenants.
  * If AllTenants is selected, you can block a subset of tenants or tenant groups using Blocked Tenants.
* Optionally select the CIPP endpoints that you want to block for the role. For example, if you do not want the role to have access to delete users/mailboxes you would block `RemoveUser`.
* Select the API permission from the listed categories and choose from None, Read or Read/Write.
  * To find out which API endpoints are affected by these selections, click on the Info button.
* You must be sure to assign both the custom role and the base role `readonly` or `editor` to the users.
  * If using Entra ID groups, you can map the base role to a Entra group (eg. `CIPP readonly` mapped to `readonly`) and add the user to the base role Entra group and the custom role Entra group to properly manage permissions
  * If using SWA role management (self-hosted) or management portal (CyberDrain hosted) be sure to add both roles to the user manually.

{% hint style="info" %}
If you are continuing to statically assign roles, the custom roles created in CIPP do not sync back to the SWA role management (self-hosted) or management portal (CyberDrain hosted). You will need to add the role to the invited user exactly how it appears in CIPP manually.
{% endhint %}

{% hint style="warning" %}
Users previously directly added to the SWA or via the Management App will retain their settings from there. Adding those users via Entra group to a role with different permissions can cause errors in determining the user's access. It is recommended not to duplicate how you provide the user with permissions.

If you continue to utilize SWA/Management App for role assignment, note that the roles do not sync so you will need to carefully type the role exactly as it appears in CIPP Roles for the role to properly apply.
{% endhint %}
