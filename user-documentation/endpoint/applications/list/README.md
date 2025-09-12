---
description: Interact with Microsoft Endpoint Manager applications.
---

# Applications

The List Applications page shows a list of line-of-business applications configured for deployment in Microsoft Endpoint Manager / Intune.

### Action Buttons

{% content-ref url="add-application/" %}
[add-application](add-application/)
{% endcontent-ref %}

* Sync VPP - This button will sync Apple Volume Purchase Program tokens for the tenant.

### Details

The properties returned are for the Graph resource type `mobileApp`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/intune-apps-mobileapp?view=graph-rest-1.0#properties).

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Assign to All Users</td><td>Assigns the application to all users in the tenant</td><td>true</td></tr><tr><td>Assign to All Devices</td><td>Assigns the application to all devices in the tenant</td><td>true</td></tr><tr><td>Assign Globally (All Users / All Devices)</td><td>Assigns to all user and all devices in the tenant</td><td>true</td></tr><tr><td>Delete Application</td><td>Opens a modal to confirm you want to delete the application from the tenant</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
