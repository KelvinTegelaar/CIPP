---
description: Offboard the selected user with standard requirements
---

# Offboarding Wizard

### Overview

The Offboarding Wizard is an interactive guide that streamlines the process of offboarding a user from a tenant in Microsoft 365. It provides a step-by-step process where you can select from a variety of offboarding tasks. These tasks include revoking sessions, removing mobile devices, resetting passwords, and more. This wizard also allows for easy setting of a user's Out of Office message and forwarding their mail to another user.

### Steps

{% stepper %}
{% step %}
#### Tenant Selection

Select the tenant from which you want to offboard a user. Only one tenant can be selected at a time.
{% endstep %}

{% step %}
#### User Selection

Choose the user to be offboarded from the tenant. The selection is made from a dropdown menu that displays all users from the selected tenant.
{% endstep %}

{% step %}
#### Offboarding Options

Choose from a variety of offboarding options to apply to the user. These options are detailed in the sections below.
{% endstep %}

{% step %}
#### Confirmation

Review your selections and confirm to apply the offboarding process.
{% endstep %}
{% endstepper %}

### Offboarding Settings

The Offboarding Wizard offers a range of settings that can be performed during the offboarding process. These tasks include:

| Setting                                                        | Description                                                                                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Convert to Shared Mailbox                                      | Converts the user's mailbox to a shared mailbox                                                                                     |
| Hide from Global Address List                                  | Hides the user from the Global Address List                                                                                         |
| Cancel all calendar invites                                    |                                                                                                                                     |
| Remove user's mailbox permissions                              | Removes all the offboarded user's permissons to all other mailboxes                                                                 |
| Revoke all sessions                                            | Revokes all active sessions of the user                                                                                             |
| Remove all Mobile Devices                                      | Removes all mobile devices associated with the user                                                                                 |
| Remove all Rules                                               | Removes all rules associated with the user                                                                                          |
| Remove Licenses                                                | Removes all licenses associated with the user                                                                                       |
| Disable Sign-In                                                | Disables the user's ability to sign in                                                                                              |
| Clear Immutable ID                                             | Clears the Immutable ID for a user synced from on-premises Active Directory. Note: This only works after the link is broken from AD |
| Reset Password                                                 | Resets the user's password                                                                                                          |
| Remove all MFA Devices                                         | Removes all MFA devices associated with the user                                                                                                          |
| Remove from all Groups                                         | Removes the user from all groups                                                                                                    |
| Set Out of Office                                              | Sets an out of office message for the user                                                                                          |
| Give another user access to the mailbox (without auto mapping) | Gives another user full access to the offboarded user's mailbox without auto mapping                                                |
| Give another user access to the mailbox (with auto mapping)    | Gives another user full access to the offboarded user's mailbox with auto mapping                                                   |
| Give another user access to OneDrive                           | Gives another user full access to the offboarded user's OneDrive                                                                    |
| Forward all e-mail to another user                             | Forwards all e-mails of the offboarded user to another user                                                                         |
| Keep a copy of the forwarded mail in the source mailbox        | Keeps a copy of the forwarded mail in the offboarded user's mailbox                                                                 |
| Delete User                                                    | Deletes the user from the tenant                                                                                                    |

### Permissions and forwarding

|                                  |                                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Mailbox Full Access (no automap) | The selected user or users will be granted full access to the offboarded user's mailbox but will not have that mailbox auto mapped in Outlook  |
| Mailbox Full Access (automap)    | The selected user or users will be granted full access to the offboarded user's mailbox and they will have that mailbox auto mapped in Outlook |
| OneDrive Full Access             | The selected user or users will be granted full access to the offboarded user's OneDrive                                                       |
| Forward Email To                 | The selected user will be set as the forwarding recipient on the offboarded user                                                               |
| Keep a copy of forwarded email   | Toggling on this option will retain received mail in the offboarded user's mailbox while also forwarding it to the user selected above         |
| Out of Office Message            | This WYSIWYG editor will allow you to craft the Out of Office message set on the offboarded user's mailbox                                     |

### Scheduling & Notifications

|                            |                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Schedule this offboarding  | If toggling this switch to on, will present the remaining options in this table                     |
| Scheduled Offboarding Date | The date and time you would like the offboarding to run                                             |
| Webhook                    | Enable this to send a notification to your configured webhook in CIPP notifications settings        |
| E-mail                     | Enable this to send a notification to your configured e-mail address in CIPP notifications settings |
| PSA                        | Enable this to send a notification to your configured PSA in CIPP notifications settings            |

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
