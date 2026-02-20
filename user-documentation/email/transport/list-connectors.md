# Connectors

### **Action Buttons**

<details>

<summary>Deploy Connector</summary>

This wizard allows you to deploy a connector to the selected tenant(s) or All Tenants. Choose either a template or enter the raw JSON into the box and click `Submit`.

</details>

## Table Details

The properties returned are for the combination of the following Exchange PowerShell commands. For more information on the command please see the Microsoft documentation:

* [Get-OutboundConnector](https://learn.microsoft.com/en-us/powershell/module/exchange/get-outboundconnector?view=exchange-ps)
* [Get-InboundConnector](https://learn.microsoft.com/en-us/powershell/module/exchange/get-inboundconnector?view=exchange-ps)

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Create template based on connector</td><td>Creates a template based on the selected connector(s)</td><td>true</td></tr><tr><td>Enable Connector</td><td>Enables the selected connector(s). This will be greyed out if the connector is enabled</td><td>true</td></tr><tr><td>Disable Connector</td><td>Disables the selected connector(s). This will be greyed out if the connector is disabled</td><td>true</td></tr><tr><td>Delete Connector</td><td>Deletes the selected connector(s)</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>



***

{% include "../../../.gitbook/includes/feature-request.md" %}
