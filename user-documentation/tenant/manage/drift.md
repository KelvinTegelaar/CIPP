# Manage Drift

This page and the other tabs are a way for you to manage your tenants and their drift away from the desired settings in your Drift Management template.

## Manage Drift Overview

{% @storylane/embed subdomain="app" linkValue="cqb21ohc9fgp" url="https://app.storylane.io/share/cqb21ohc9fgp" %}

## Page Actions

| Action                                            | Description                                                                                    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Refresh Data                                      | Pulls in the latest settings from the tenant to compare against the Drift Management template. |
| Generate Report                                   | Opens the ability to generate an Executive Summary for the tenant.                             |
| Run Standard Now (Currently Selected Tenant only) | Runs the template on the tenant selected in the top menu bar                                   |
| Run Standard Now (All Tenants in Template)        | Runs the template for all configured tenants                                                   |

## Page Details

The page is broken up into several sections for ease of viewing.

### Breakdown

This handy chart shows you the status of the standards included in the Drift Management template.

### Filters

You can filter the deviations shown on the page by selecting one of the following:

* **Select Drift Template**: Adjust which drift template you are reviewing. This also includes a quick link to edit the selected template. Just click the pencil icon.
* **Search deviations**: Show only those deviations that match your search term.
* **Status**: Adjust the display for "All Deviations", "Current Deviations", "Accepted", "Customer Specific", "Denied", or "Compliant".
* **Sort by**: This will allow you to change the sort from the default of "Name" to "Status" or "Category".

### New Deviations

This section has an action button at the top when multiple deviations are checked:

| Action       | Description                                                                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bulk Actions | Displays the actions from each individual card below for bulk application and the additional action of `Remove Drift Customization` which resets all customer, and all tenant applied accepted deviations from the Drift Management template. |

Each card contains the following information:

| Detail         | Description                                           |
| -------------- | ----------------------------------------------------- |
| Standard Name  | Name of the standard                                  |
| Description    | The description of what the standard is               |
| Expected Value | The expected value from the Drift Management template |
| Current Value  | The actual value returned from the tenant             |
| Status         | Will display the drift status of the standard         |

## Card Actions

### New Deviations

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Accept Deviation — Customer Specific</td><td>Mmarks the deviation as intentional and unique to this tenant. Counts as compliant in the alignment score. Use when the tenant legitimately differs from the template by design.</td><td>true</td></tr><tr><td>Accept Deviation</td><td>Acknowledges the deviation as known/approved. Also counts as compliant in the alignment score. Use when you've reviewed it and it's fine as-is, but it's not a customer-specific exception.</td><td>true</td></tr><tr><td>Deny Deviation - Remediate to align with template</td><td>Queues a remediation job to bring the tenant back into alignment with the template. Includes the option to permanently deny the drift which will auto remediate future occurrences.</td><td>true</td></tr><tr><td>Deny Deviation — Delete Policy</td><td>Queues a deletion of the rogue policy.</td><td>true</td></tr><tr><td>Remove Drift Customization</td><td>Only available as a bulk action, this will remove all customization from drift management and reset to comparing to the standard</td><td>true</td></tr></tbody></table>

### Already-Accepted Deviations

<table><thead><tr><th></th><th></th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Deny — Delete Policy</td><td>Reverses the acceptance and queues a deletion of the rogue policy.</td><td>false</td></tr><tr><td>Deny — Remediate to align with template</td><td>Reverses acceptance and queues a remediation job to bring the tenant back into alignment with the template. Includes the option to permanently deny the drift which will auto remediate future occurrences.</td><td>false</td></tr><tr><td>Accept — Customer Specific</td><td>Re-categorizes from generic accepted to a customer specific deviation.</td><td>false</td></tr></tbody></table>



***

{% include "../../../.gitbook/includes/feature-request.md" %}
