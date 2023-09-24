---
description: Interact with Microsoft Endpoint Manager applications.
---

# Applications

The List Applications page shows a list of line-of-business applications configured for deployment in Microsoft Endpoint Manager / Intune.

You can assign the application to All Users / All Devices from the more button.

### Details

| Fields                     | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| Name                       | The name of the application.                                  |
| Published                  | The published status of the application.                      |
| Install Command            | The command to install the application.                       |
| Uninstall Command          | The command to uninstall the application.                     |
| Install As                 | Whether the application should install as system or the user. |
| Restart Behaviour          | Whether the app installation may trigger a restart.           |
| Assigned to Groups         | Whether the app has active group assignments.                 |
| Created At                 | The creation date and time of the application.                |
| Modified At                | The last modified date and time for the application.          |
| Featured App               | Whether the app is a featured app in the portal.              |
| # of Dependent Apps        | How many dependent apps exist for the application.            |
| Detection Type             | Detection rule, if one exists.                                |
| Detection File/Folder Name | Detection Rule Folder Name Details.                           |
| Detection File/Folder Path | Detection Rule Path details.                                  |

### Actions

* Assign to All Users
* Assign to All Devices
* Assign Globally (All Users / All Devices)
* Delete Application

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListApps" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
