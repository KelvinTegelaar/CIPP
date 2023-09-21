---
description: Offboard the selected user with standard requirements
---

# Offboarding Wizard

### Overview

The Offboarding Wizard is an interactive guide that streamlines the process of offboarding a user from a tenant in Microsoft 365. It provides a step-by-step process where you can select from a variety of offboarding tasks. These tasks include revoking sessions, removing mobile devices, resetting passwords, and more. This wizard also allows for easy setting of a user's Out of Office message and forwarding their mail to another user.

### Steps

The Offboarding Wizard includes the following steps:

1. **Tenant Choice**: Select the tenant from which you want to offboard a user. Only one tenant can be selected at a time.
2. **Select User**: Choose the user to be offboarded from the tenant. The selection is made from a dropdown menu that displays all users from the selected tenant.
3. **Offboarding Settings**: Choose from a variety of offboarding options to apply to the user. These options are detailed in the "Available Tasks" section below.
4. **Review and Confirm**: Review your selections and confirm to apply the offboarding process.

### Available Tasks

The Offboarding Wizard offers a range of tasks that can be performed during the offboarding process. These tasks include:

<table><thead><tr><th width="267">Task</th><th>Description</th></tr></thead><tbody><tr><td>Revoke all sessions</td><td>Revokes all active sessions of the user</td></tr><tr><td>Remove all Mobile Devices</td><td>Removes all mobile devices associated with the user</td></tr><tr><td>Remove all Rules</td><td>Removes all rules associated with the user</td></tr><tr><td>Remove Licenses</td><td>Removes all licenses associated with the user</td></tr><tr><td>Convert to Shared Mailbox</td><td>Converts the user's mailbox to a shared mailbox</td></tr><tr><td>Disable Sign-In</td><td>Disables the user's ability to sign in</td></tr><tr><td>Reset Password</td><td>Resets the user's password</td></tr><tr><td>Remove from all Groups</td><td>Removes the user from all groups</td></tr><tr><td>Hide from Global Address List</td><td>Hides the user from the Global Address List</td></tr><tr><td>Set Out of Office</td><td>Sets an out of office message for the user</td></tr><tr><td>Give another user access to the mailbox (without auto mapping)</td><td>Gives another user full access to the offboarded user's mailbox without auto mapping</td></tr><tr><td>Give another user access to the mailbox (with auto mapping)</td><td>Gives another user full access to the offboarded user's mailbox with auto mapping</td></tr><tr><td>Give another user access to OneDrive</td><td>Gives another user full access to the offboarded user's OneDrive</td></tr><tr><td>Forward all e-mail to another user</td><td>Forwards all e-mails of the offboarded user to another user</td></tr><tr><td>Keep a copy of the forwarded mail in the source mailbox</td><td>Keeps a copy of the forwarded mail in the offboarded user's mailbox</td></tr><tr><td>Delete User</td><td>Deletes the user from the tenant</td></tr></tbody></table>

### API Calls

The Offboarding Wizard makes a POST request to the `/api/ExecOffboardUser` endpoint. The body of the request contains the tenant information, the user to be offboarded, and the chosen offboarding options.

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecOffboardUser" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListUsers" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

We value your feedback and ideas. If you have any feature requests or ideas to improve the Offboarding Wizard page, please raise them on our [GitHub issues page](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+).
