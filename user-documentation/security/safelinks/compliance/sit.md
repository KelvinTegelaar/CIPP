# Sensitive Information Types

Sensitive Information Types (SITs) are the pattern-matching primitives used across Microsoft Purview to identify sensitive content like credit card numbers, government IDs, health records, or custom organizational data. Each SIT combines regular expressions, keyword lists, checksums, and proximity rules with a confidence level to detect matches in files, emails, and other content. DLP policies, auto-labeling rules, and sensitivity labels all reference SITs as conditions for classification and protection. This page lets you view the sensitive information types available in the selected tenant, including both Microsoft's built-in types and any custom SITs published by the organization.

## Page Actions

<details>

<summary>Deploy SIT</summary>

This will open an action drawer that will allow you deploy a sensitivity information type either by template or by pasting the JSON into the Parameters block. Select the tenant(s) you want to deploy the sensitivity information type to, select the template or paste the JSON, and click Deploy.

</details>

## Table Details

The properties returned are for the Exchange PowerShell command `Get-DlpSensitiveInformationType`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-dlpsensitiveinformationtype?view=exchange-ps).

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Delete Label</td><td>This will delete the selected SIT(s).</td><td>true</td></tr><tr><td>More Info</td><td>Opens the extended info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
