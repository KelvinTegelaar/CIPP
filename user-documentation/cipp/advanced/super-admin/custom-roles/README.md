# CIPP Roles

A page for super admins to manage the custom roles deployed to their CIPP instance. Please see the User Roles in CIPP page on [#custom-roles](../../../../../setup/installation/roles.md#custom-roles "mention")for instructions and notes/limitations.

### Table Details

| Column          | Description                              |
| --------------- | ---------------------------------------- |
| Role Name       | The name given to the role               |
| Type            | The type of role: Built-In or Custom     |
| Entra Group     | The Entra group name, if one is assigned |
| Allowed Tenants | The list of allowed tenants              |
| Blocked Tenants | The list of blocked tenants              |

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit</td><td>Allows you to edit the custom role. </td><td>false</td></tr><tr><td>Clone</td><td>Allows you to use an existing custom role to use as a starting point for a new role</td><td>true</td></tr><tr><td>Delete</td><td>Deletes the selected role(s)</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
