# App Registrations

This table will show all app registrations in the tenant.

## Table Details

The properties returned are for the Graph resource type `application`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0#properties).

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>View App Registration</td><td>Opens the app registration in the Entra portal</td><td>false</td></tr><tr><td>View API Permissions</td><td>Opens the API permissions for the app registration in the Entra portal</td><td>false</td></tr><tr><td>Create Enterprise App Template (Multi-Tenant)</td><td>Creates a deployment template from the selected app registration. This will copy the app registration to the partner tenant if you are running this under a client tenant context.</td><td>true</td></tr><tr><td>Create Manifest Template (Single-Tenant)</td><td>Creates a deployment template from the selected app registration. </td><td>true</td></tr><tr><td>Remove Password Credentials</td><td>Removes the password credentials from the selected app registration(s), if applicable</td><td>true</td></tr><tr><td>Remove Certificate Credentials</td><td>Removes the certificate credentials from the selected app registration(s), if applicable</td><td>true</td></tr><tr><td>Delete App Registration</td><td></td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
