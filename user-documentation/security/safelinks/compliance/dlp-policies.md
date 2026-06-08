# DLP Policies

Data Loss Prevention (DLP) policies detect and protect sensitive content across Exchange, SharePoint, OneDrive, Teams, Defender for Cloud Apps, Windows and macOS endpoints, and on-premises file shares. Each policy contains one or more rules that define what to look for - sensitive info types, sensitivity labels, trainable classifiers, or specific conditions - and what to do when a match occurs, such as blocking access, restricting sharing, showing policy tips, generating alerts, or requiring user justification. This page lets you view and manage the DLP policies and their underlying rules in the selected tenant.

## Page Actions

<details>

<summary>Deploy DLP Policy</summary>

This will open an action drawer that will allow you deploy a DLP policy either by template or by pasting the JSON into the Parameters block. Select the tenant(s) you want to deploy the policy to, select the template or paste the JSON, and click Deploy.

</details>

## Table Details

The properties returned are for the Exchange PowerShell command `Get-DlpCompliancePolicy`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-dlpcompliancepolicy?view=exchange-ps). We also return the associated rules with `Get-DlpComplianceRule`. See the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-dlpcompliancerule?view=exchange-ps) for more on that command.

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Create template based on policy</td><td>Creates a template based on the selected policy(ies)</td><td>true</td></tr><tr><td>Enable Policy</td><td>Enables the selected policy(ies). Will only be available if the selected policy is disabled.</td><td>true</td></tr><tr><td>Disable Policy</td><td>Disables the selected policy(ies). Will only be available if the selected policy is enabled.</td><td>true</td></tr><tr><td>Delete Policy</td><td>Deletes the selected policy(ies)</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
