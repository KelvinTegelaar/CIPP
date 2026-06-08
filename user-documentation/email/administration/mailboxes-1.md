# HVE Accounts

High Volume Email (HVE) accounts are purpose-built Exchange Online accounts for sending bulk internal mail from apps and devices, such as invoices, alerts, and LOB notifications, without consuming a user license or hitting standard mailbox throttling limits. Use this page to create an HVE account in the selected tenant and grab the SMTP settings needed to wire it into your application.

## Action Buttons

<details>

<summary>Add HVE User</summary>

This wizard allows you to create a new HVE user.

</details>

## Table Details

The properties returned are for the Exchange PowerShell command `Get-BillingPolicy` with a resource type of HVE. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-billingpolicy?view=exchange-ps).&#x20;

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Enabled</th></tr></thead><tbody><tr><td>Edit Display Name</td><td>Edits the HVE account display name</td><td>true</td></tr><tr><td>Set Reply-To Address</td><td>Sets the reply-to address on the selected HVE account(s)</td><td>true</td></tr><tr><td>Change Primary SMTP Address</td><td>Changes the primary SMTP address on the selected HVE account</td><td>true</td></tr><tr><td>Assign Billing Policy</td><td>Assigns a billing policy to the HVE account</td><td>true</td></tr><tr><td>Remove Billing Policy</td><td>Removes a billing policy from a HVE account</td><td>true</td></tr><tr><td>Delete HVE Account</td><td>Deletes the selected HVE account(s)</td><td>true</td></tr><tr><td>More Info</td><td>Opens extended info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
