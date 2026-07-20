# Manage Drift

This page and the other tabs are a way for you to manage your tenants and their drift away from the desired settings in your Drift Management template.

## Manage Drift Overview

{% @storylane/embed subdomain="app" linkValue="cqb21ohc9fgp" url="https://app.storylane.io/share/cqb21ohc9fgp" %}

## Page Actions

| Action           | Description                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Refresh Data     | Pulls the most recent settings from CIPP's cache to compare against the Drift Management template. Use "Run Standard Now" to get most recent settings from tenant. |
| Generate Report  | Opens the ability to generate an Executive Summary for the tenant.                                                                                                 |
| Run Standard Now | Opens a modal to select the tenant(s) you want to run the standard against. The drop down will only show tenants and groups assigned to the template.              |

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

{% hint style="info" %}
Every card action opens a **Confirmation** window asking for a **Reason for change**. The reason is mandatory and is saved on the deviation along with the user that made the change, so you keep an audit trail of every drift decision.
{% endhint %}

### New Deviations

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Accept Deviation — Customer Specific</td><td>Marks the deviation as intentional and unique to this tenant. Counts as compliant in the alignment score. Use when the tenant legitimately differs from the template by design.</td><td>true</td></tr><tr><td>Accept Deviation</td><td>Acknowledges the deviation as known/approved. Also counts as compliant in the alignment score. Use when you've reviewed it and it's fine as-is, but it's not a customer-specific exception.</td><td>true</td></tr><tr><td>Deny Deviation - Remediate to align with template</td><td>Queues a remediation job to bring the tenant back into alignment with the template. Includes the option to permanently deny the drift which will auto remediate future occurrences.</td><td>true</td></tr><tr><td>Deny Deviation — Delete Policy</td><td>Queues a deletion of the rogue policy.</td><td>true</td></tr><tr><td>Remove Drift Customization</td><td>Only available as a bulk action, this will remove all customization from drift management and reset to comparing to the standard</td><td>true</td></tr></tbody></table>

### Already-Accepted Deviations

<table><thead><tr><th></th><th></th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Deny — Delete Policy</td><td>Reverses the acceptance and queues a deletion of the rogue policy.</td><td>false</td></tr><tr><td>Deny — Remediate to align with template</td><td>Reverses acceptance and queues a remediation job to bring the tenant back into alignment with the template. Includes the option to permanently deny the drift which will auto remediate future occurrences.</td><td>false</td></tr><tr><td>Accept — Customer Specific</td><td>Re-categorizes from generic accepted to a customer specific deviation.</td><td>false</td></tr></tbody></table>

### Denied Deviations & Compliant Standards

Cards in the "Denied Deviations" and "Compliant Standards" sections have their own Actions menu. This is where you'll find the **Rerun** action:

| Action                                                  | Description                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rerun standard to align with template                   | Marks the standard as **Denied** again, flagging that this tenant must match the template for this standard. Use it on a previously denied or currently compliant standard that you want CIPP to treat as an open deviation once more: while the tenant deviates from the template, the card shows under "Denied Deviations", counts as non-compliant in the alignment score, and is included in drift alerts. This action only changes how CIPP tracks the standard — it does not make any change in the tenant. To push the template's value out immediately, use "Deny - Remediate to align with template" instead. |
| Deny - Remediate to align with template                 | Queues a remediation job to bring the tenant back into alignment with the template. Includes the option to permanently deny the drift, which schedules a recurring task that re-applies the template value every 12 hours. Only shown for standards and policies that exist in the template.                                                                                                                               |
| Accept Deviation / Accept Deviation — Customer Specific | Denied Deviations only. Re-categorizes the denied deviation as an accepted (or customer specific) deviation, which counts as compliant in the alignment score.                                                                                                                                                                                                                                                            |

***

{% include "../../../.gitbook/includes/feature-request.md" %}
