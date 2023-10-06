---
description: Interact with Microsoft 365 groups.
---

# Groups

### Overview

The Groups page is equivalent to [Microsoft 365 admin center > Active teams and groups](https://admin.microsoft.com/#/groups). It offers an overview of all groups within the organization and allows users to manage group details and memberships.

### Details

This page presents each group in a structured table, including the following details:

* Group Name
* Group Type (Distribution list, Mail-Enabled Security, etc.)
* Group Members
* Group Owners
* External Email Allowed: Indicates if people outside the organization can email the group.

### Actions and Features

The 'Groups' page offers various actions and features:

<table><thead><tr><th width="232">Action</th><th>Description</th></tr></thead><tbody><tr><td><strong>Add Group</strong></td><td>This button navigates the user to the 'Add Group' page where a new group can be created.</td></tr><tr><td><strong>Edit Group</strong></td><td>Allows the user to navigate to the 'Edit Group' page where they can modify group details and memberships.</td></tr><tr><td><strong>Group Information</strong></td><td>Clicking the ellipsis button next to 'Edit Group' opens a fly-out menu with additional actions and group information.</td></tr><tr><td><strong>Export</strong></td><td>Supports exporting of group information to CSV and PDF formats.</td></tr></tbody></table>

### 'Add Group' Page Actions

These actions are available on the 'Add Group' page, and are passed as parameters to the `AddGroup` endpoint listed below.

<table><thead><tr><th width="253">Action</th><th>Description</th></tr></thead><tbody><tr><td><strong>Display Name</strong></td><td>Field to input the display name of the new group.</td></tr><tr><td><strong>Description</strong></td><td>Field to input the description of the new group.</td></tr><tr><td><strong>Username</strong></td><td>Field to input the username associated with the new group.</td></tr><tr><td><strong>Primary Domain Name</strong></td><td>Dropdown selection for the primary domain of the new group.</td></tr><tr><td><strong>Group Type</strong></td><td>Radio buttons to select the type of the new group (Azure Role Group, Security Group, Dynamic Group, Distribution List, Mail Enabled Security Group).</td></tr></tbody></table>

### 'Edit Group' Page Actions

These actions are available on the 'Edit Group' page, and are passed as parameters to the `EditGroup` endpoint listed below.

<table><thead><tr><th width="230">Action</th><th>Description</th></tr></thead><tbody><tr><td>Add User</td><td>Allows the addition of a selected user to the group.</td></tr><tr><td>Add Contact</td><td>Allows the addition of a selected contact to the group.</td></tr><tr><td>Remove Member</td><td>Allows the removal of a selected member from the group.</td></tr><tr><td>Add Owner</td><td>Allows the addition of a selected user as an owner of the group.</td></tr><tr><td>Remove Owner</td><td>Allows the removal of a selected owner from the group.</td></tr><tr><td>Let people outside the organization email the group</td><td>If selected, it allows external senders to send emails to the group.</td></tr><tr><td>Send Copies of team emails and events to team members inboxes</td><td>If selected, it enables sending copies of team emails and events to the inboxes of team members.</td></tr></tbody></table>

### **Group Information Flyout Actions**

These actions and information are available in the fly-out menu when you click the ellipsis button on the main 'Groups' page:

<table><thead><tr><th width="294">Action/Information</th><th>Description</th></tr></thead><tbody><tr><td>Group Information</td><td>Displays extended information about the group, such as the creation date and unique ID.</td></tr><tr><td>Edit Group</td><td>Allows navigation to the 'Edit Group' page.</td></tr><tr><td>Hide from Global Address List</td><td>Hides the group from the Global Address List.</td></tr><tr><td>Unhide from Global Address List</td><td>Makes the group visible in the Global Address List.</td></tr><tr><td>Only allow messages from people inside the organization</td><td>Restricts the group to only receive messages from people inside the organization.</td></tr><tr><td>Allow messages from people inside and outside the organization</td><td>Allows the group to receive messages from both inside and outside the organization.</td></tr><tr><td>Delete Group</td><td>Deletes the group using the <code>ExecGroupsDelete</code> endpoint listed below.</td></tr></tbody></table>

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListGroups" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/EditGroup" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/AddGroup" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecGroupsDelete" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

We value your feedback and ideas. If you have any feature requests or ideas to improve the Groups page, please raise them on our [GitHub issues page](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+).
