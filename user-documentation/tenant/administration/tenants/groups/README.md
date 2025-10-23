# Tenant Groups

This page allows you to view and manage your custom tenant groups. Groups can be used in easily including similar tenants in your Standards.

### Action Buttons

#### Add Tenant Group

This flyout will allow you to create a new tenant group. Set the Group Name, Group Description, and initial tenants to add to the group.

How to Make a Dynamic Tenant Group

{% @storylane/embed subdomain="app" linkValue="idk6ryipa9ch" url="https://app.storylane.io/share/idk6ryipa9ch" %}

#### Create Default Groups

This will allow you to create a predefined set of tenant groups provided by CIPP. The default groups created are:

| Name                                      | Description                                                                             |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| Not Intune and Entra Premium Capable      | This group does not have a license for intune, nor a license for Entra ID Premium       |
| Business Premium License available        | This group has at least one Business Premium License available                          |
| Entra Premium Capable, Not Intune Capable | This group does have a license for Entra Premium but does not have a license for Intune |
| Entra ID Premium and Intune Capable       | This group has Intune and Entra ID Premium available                                    |

#### View Logs

This will open a flyout with a table of information on CIPP's processing of your dynamic tenant groups.

### Table Details

| Column      | Description                                         |
| ----------- | --------------------------------------------------- |
| Name        | Name of the group                                   |
| Description | Description set for the group                       |
| Group Type  | `dynamic` or `static`                               |
| Members     |  Click to view a table of the tenants in this group |

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Group</td><td>Opens the <a data-mention href="edit.md">edit.md</a> page for the selected row</td><td>false</td></tr><tr><td>Run Dynamic Rules</td><td>Will force refresh the dynamic group rules. Will only be selectable on groups with a dynamic type.</td><td>true</td></tr><tr><td>Delete Group</td><td>Opens a modal to confirm you want to delete the selected group.</td><td>true</td></tr></tbody></table>

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
