---
description: Interact with Microsoft 365 groups.
---

# Groups

### Overview

The Groups page is equivalent to [Microsoft 365 admin center > Active teams and groups](https://admin.microsoft.com/#/groups). It offers an overview of all groups within the organization and allows users to manage group details and memberships.

### Details

This page presents each group in a structured table, including the following columns. You can select which columns are visible.

| Column                        | Description                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| ID                            | The GUID of the group                                                                                        |
| Created Date Time             | The relative time since group creation                                                                       |
| Display Name                  | The name that displays for the group                                                                         |
| Mail Enabled                  | A Boolean field for if the group is mail enabled                                                             |
| Mail Nickname                 |                                                                                                              |
| Resource Provisioning Options |                                                                                                              |
| Security Enabled              | A Boolean field for if the group is security enabled                                                         |
| Organization Id               | The GUID for the organization                                                                                |
| Group Types                   |                                                                                                              |
| Members                       | Clicking the result in this column will pop open a modal that contains a table with the members of the group |
| Prim Domain                   |                                                                                                              |
| Members Csv                   | The membership of the group in a comma separated list                                                        |
| Teams Enabled                 | A Boolean field for if the group has had Teams enabled                                                       |
| Calculated Group Type         | This will display the type of group based on the properties returned by Graph                                |
| Dynamic Group Bool            | A Boolean field for if the group is dynamic                                                                  |
| Description                   |                                                                                                              |
| Mail                          | The e-mail address for the group, if any                                                                     |
| Visibility                    | Will display "Private" if the group is set to private                                                        |

### Actions

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}

### **Per-Group Actions**

These actions and information are available in the fly-out menu when you click the ellipsis button in the "Actions" column:

<table><thead><tr><th width="294">Action/Information</th><th>Description</th></tr></thead><tbody><tr><td>Edit Group</td><td>Allows navigation to the 'Edit Group' page.</td></tr><tr><td>Hide from Global Address List</td><td>Hides the group from the Global Address List.</td></tr><tr><td>Unhide from Global Address List</td><td>Makes the group visible in the Global Address List.</td></tr><tr><td>Only allow messages from people inside the organization</td><td>Restricts the group to only receive messages from people inside the organization.</td></tr><tr><td>Allow messages from people inside and outside the organization</td><td>Allows the group to receive messages from both inside and outside the organization.</td></tr><tr><td>Delete Group</td><td>Deletes the group using the <code>ExecGroupsDelete</code> endpoint listed below.</td></tr><tr><td>More Info</td><td>Displays extended information about the group, such as the creation date and unique ID.</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
