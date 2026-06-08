# Sensitivity Labels

Sensitivity labels are the classification and protection mechanism in Microsoft Purview Information Protection. Once applied to a file, email, container (Teams/Groups/SharePoint sites), or meeting, a label travels with the content and enforces the actions configured on it: encryption and rights management, content marking (headers, footers, watermarks), and container privacy and sharing controls. Label policies then publish labels to specific users and groups and control default labels, mandatory labeling, and downgrade justification. This page lets you view and manage sensitivity labels and label policies in the selected tenant.

## Page Actions

<details>

<summary>Deploy Sensitivity Label</summary>

This will open an action drawer that will allow you deploy a sensitivity label either by template or by pasting the JSON into the Parameters block. Select the tenant(s) you want to deploy the label to, select the template or paste the JSON, and click Deploy.

</details>

## Table Details

The properties returned are for the Exchange PowerShell command `Get-Label`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-label?view=exchange-ps). Additionally, associated label policies are returned with `Get-LabelPolicy`. See the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-labelpolicy?view=exchange-ps) for more.

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Create template based on label</td><td>This will create a template for reuse from the selected label(s)</td><td>true</td></tr><tr><td>Delete Label</td><td>This will delete the selected label(s).</td><td>true</td></tr><tr><td>More Info</td><td>Opens the extended info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
