# Group Templates

The Group Templates page allows administrators to define templates for creating groups. These templates can speed up the process of creating new groups by pre-defining certain group parameters. Once a template is created, it can be reused multiple times to create new groups with similar settings.

### Action Buttons

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}

{% content-ref url="deploy.md" %}
[deploy.md](deploy.md)
{% endcontent-ref %}

### Column Details

| Column         | Description                                                                                                                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display Name   | This is the name that will be given to the group when a group is created using this template. It should be unique and descriptive.                                                                                                                        |
| Description    | This field should contain a more detailed explanation of the group's purpose. This might include information about who should be added to the group, what resources the group provides access to, or any other information that helps describe the group. |
| Username       | The username of the creator of the group template.                                                                                                                                                                                                        |
| Group Type     | <p>The type of group that the template creates. Options include:</p><ul><li>Azure Role Group</li><li>Security Group</li><li>Distribution List*</li><li>Mail Enabled Security Group</li><li>Dynamic Group*</li></ul>                                       |
| Allow External | Are external people allowed to email this group?                                                                                                                                                                                                          |

**\*Additional Fields for Specific Group Types**

For some types of groups, additional fields become available when that type is selected:

* **Allow External:** For Distribution Lists, a checkbox labeled "Let people outside the organization email the group" becomes available.
* **Dynamic Group Parameters:** For Dynamic Groups, a text box for entering the dynamic group parameters syntax becomes available e.g.: `(user.userPrincipalName -notContains "#EXT#@") -and (user.userType -ne "Guest")`.

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Template</td><td>Opens the Edit Template page for the selected template</td><td>false</td></tr><tr><td>Save to GitHub</td><td>Saves the template to your GitHub repository</td><td>true</td></tr><tr><td>Delete Template</td><td>Deleted the template</td><td>true</td></tr><tr><td>More Info</td><td>Opens the extended info flyout</td><td>false</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
