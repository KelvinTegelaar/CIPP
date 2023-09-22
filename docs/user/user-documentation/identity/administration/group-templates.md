# Group Templates

The Group Templates page allows administrators to define templates for creating groups. These templates can speed up the process of creating new groups by pre-defining certain group parameters. Once a template is created, it can be reused multiple times to create new groups with similar settings.

| Fields         | Description                                                                                                                                                                                                                                               |
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

### Actions

On the Group Templates page, the following actions can be performed:

* **Add New Group Template**: Click the "Add New Group Template" button to open a form where you can fill in the details for a new group template. After you've filled in the details, click "Save" to create the new template. This action calls the `AddGroupTemplate` API endpoint.
* **View**: Click the "View" button next to a group template to display its details in JSON format.
* **Delete**: Click the "Trash" icon next to a group template to delete it. This action triggers a modal that asks for confirmation before deleting the template. Once confirmed, this action calls the `RemoveGroupTemplate` API endpoint.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListGroupTemplates" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/AddGroupTemplate" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/RemoveGroupTemplate" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

We value your feedback and ideas. If you have any feature requests or ideas to improve the Group Templates page, please raise them on our [GitHub issues page](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+).
