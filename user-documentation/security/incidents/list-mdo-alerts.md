# MDO Alerts

List Alerts shows summary of the number of alerts across your managed Microsoft 365 tenants plus a detailed list of the actual alerts. You can also set the state of these alerts and view them directly in the Microsoft portals

### Table Details

The properties returned are for the Graph resource type `alert` with a filter of `serviceSource eq 'microsoftDefenderForOffice365'`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/security-alert?view=graph-rest-1.0#properties).

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Assign to self</td><td>Opens a modal to confirm you want to assign the alert to yourself</td><td>true</td></tr><tr><td>Set status to active</td><td>Opens a modal to confirm you want to set the alert status to active</td><td>true</td></tr><tr><td>Set status to in progress</td><td>Opens a modal to confirm you want to set the alert status to in progress</td><td>true</td></tr><tr><td>Set status to resolved</td><td>Opens a modal to confirm you want to set the alert status to resolved</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

