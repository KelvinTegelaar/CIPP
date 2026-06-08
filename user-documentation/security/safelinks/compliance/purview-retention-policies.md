# Purview Retention Policies

This table will display the tenant's Purview retention policies. Microsoft Purview retention policies control how long content is kept and what happens when that period ends (either retaining it, deleting it, or both) across Microsoft 365 workloads like Exchange mailboxes, SharePoint sites, OneDrive, Teams chats and channel messages, and Microsoft 365 Groups. Each policy defines a scope (which locations/users it applies to) and pairs with retention rules that specify the duration, trigger (creation date, last modified, labeled date), and end-of-life action. They're the tenant-wide mechanism for meeting regulatory, legal, or business retention requirements without relying on end users to manage it themselves.

## Page Actions

<details>

<summary>Deploy Retention Policy</summary>

This will open an action drawer that will allow you deploy a retention policy either by template or by pasting the JSON into the Parameters block. Select the tenant(s) you want to deploy the policy to, select the template or paste the JSON, and click Deploy.

</details>

## Table Details

The properties returned are for the Exchange PowerShell command `Get-RetentionCompliancePolicy`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-retentioncompliancepolicy?view=exchange-ps).&#x20;

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Create template based on policy</td><td>This will create a template for reuse from the selected policy(ies)</td><td>true</td></tr><tr><td>Enable Policy</td><td>This will enable the selected policy(ies). This will only be selectable if the selected policy(ies) are disabled.</td><td>true</td></tr><tr><td>Disable Policy</td><td>This will disable the selected policy(ies). This will only be selectable if the selected policy(ies) are currently enabled.</td><td>true</td></tr><tr><td>Delete Policy</td><td>This will delete the selected policy(ies).</td><td>true</td></tr><tr><td>More Info</td><td>Opens the extended info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
