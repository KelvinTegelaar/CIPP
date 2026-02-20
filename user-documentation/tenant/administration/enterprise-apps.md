# Applications

This page shows all the enterprise applications that are available in the tenant. This can for example be very helpful when trying to identify SAM applications from previous MSPs.

To do this, first clear the filter and then select the `All-non-Microsoft Enterprise Apps` filter. If not done in this order, the filter will not work as expected.

## Page Actions

<details>

<summary>Deploy Template</summary>

This button will launch [appapproval.md](../../tools/tenant-tools/appapproval.md "mention").

</details>

## Table Details

The properties returned are for the Graph resource type `servicePrincipal`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/serviceprincipal?view=graph-rest-1.0#properties).

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>View Application</td><td>Opens the application in Entra ID</td><td>false</td></tr><tr><td>Create Template from App</td><td>Opens a modal to confirm you want to create a template from the selected application. This will create the associated permission set too.</td><td>true</td></tr><tr><td>Remove Password Credentials</td><td>Removes the password credentials from the selected enterprise application(s), if applicable</td><td>true</td></tr><tr><td>Remove Certificate Credentials</td><td>Removes the certificate credentials from the selected enterprise application(s), if applicable</td><td>true</td></tr><tr><td>Disable Service Principal</td><td>If enabled, disables the service principal for the selected enterprise application(s)</td><td>true</td></tr><tr><td>Enable Service Principal</td><td>If disabled, enables the service principal for the selected enterprise application(s)</td><td>true</td></tr><tr><td>Delete Service Principal</td><td>Deletes the service principal for the selected enterprise application(s)</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
