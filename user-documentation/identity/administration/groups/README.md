---
description: Interact with Microsoft 365 groups.
---

# Groups

### Overview

The Groups page is equivalent to [Microsoft 365 admin center > Active teams and groups](https://admin.microsoft.com/#/groups). It offers an overview of all groups within the organization and allows users to manage group details and memberships.

### Action Buttons

Show/Hide Members - This will toggle if the page displays a column to show the membership of the group. You may need to select the column to show from the table's column selector also.

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}

### Column Details

The properties returned are for the Graph resource type `group`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/group?view=graph-rest-1.0#properties).

### **Table Actions**

These actions and information are available in the flyout menu when you click the ellipsis button in the "Actions" column:

<table><thead><tr><th width="294">Action/Information</th><th>Description</th><th data-type="checkbox"></th></tr></thead><tbody><tr><td>Edit Group</td><td>Allows navigation to the <a data-mention href="edit.md">edit.md</a> page.</td><td>false</td></tr><tr><td>Hide from Global Address List</td><td>Hides the group from the Global Address List.</td><td>true</td></tr><tr><td>Unhide from Global Address List</td><td>Makes the group visible in the Global Address List.</td><td>true</td></tr><tr><td>Only allow messages from people inside the organization</td><td>Restricts the group to only receive messages from people inside the organization.</td><td>true</td></tr><tr><td>Allow messages from people inside and outside the organization</td><td>Allows the group to receive messages from both inside and outside the organization.</td><td>true</td></tr><tr><td>Create template based on group</td><td>Will create a group template from this group's settings</td><td>true</td></tr><tr><td>Delete Group</td><td>Deletes the group using the <code>ExecGroupsDelete</code> endpoint listed below.</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
