# Standards & Drift Alignment

{% hint style="warning" %}
**Understanding Standards**

This page is a reference to the features of the Standards Templates page in CIPP. To better understand Standards and Drift Management, please see the main page for [..](../ "mention").
{% endhint %}

This page will allow you to get a snapshot overview of your tenants and their alignment with your various Standards & Drift Management [templates](templates/ "mention").

## Table Details

### Summary View

This view shows you a high level overview of your tenant compliance with your standards templates.

| Column                     | Description                                                                                                                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant                     | The name of the tenant                                                                                                                                                                                                            |
| Standard Name              | The name of the standard template the tenant is being aligned to                                                                                                                                                                  |
| Standards Type             | `Classic Standard` or `Drift Standard`                                                                                                                                                                                            |
| Alignment Score            | This shows the percentage of standards this tenant is in alignment with for the selected standards template                                                                                                                       |
| License Missing Percentage | This shows the percentage of standards in the standard template that the tenant is not licensed for. 0% indicates that the tenant carries licenses necessary for all standards in the template.                                   |
| Combined Alignment Score   | This reweights alignment to account for the number of standards in the template that the tenant is not licensed for. If the tenant is not licensed for any of the features, they will not count against alignment in this column. |
| Latest Data Collection     | Relative time since the last standards run to gather information needed to calculate the alignment report.                                                                                                                        |

### Per Standard View

This view breaks out the compliance review to a per standard basis to get an overview of how all your tenants score across each. You can use this table to filter to look at specific standards

| Column                 | Description                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| Tenant                 | The name of the tenant                                                                         |
| Compliance Status      | The status of the standard compliance. One of `Non-Compliant`, `License Missing`, `Compliant`. |
| Standard Name          | The name of the standard being evaluated                                                       |
| Template Name          | The template containing the standard                                                           |
| Standard Type          | The type of template. One of `Drift Standard` or `Classic Standard`                            |
| Latest Data Collection | The relative time since the last data collection                                               |

### By Standard View

Each standard row shows the total tenants it applies to, counts and percentages for each compliance status (compliant, non-compliant, accepted deviation, customer specific, license missing, reporting disabled), an alignment score, and the standard type(s) in use across tenants.

| Column                     | Description                                                                                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standard Name              | The name of the standard being evaluated                                                                                                                                                        |
| Category                   | The category of standards the standard belongs to                                                                                                                                               |
| Standard Type              | The type of template. One of `Drift Standard` or `Classic Standard`                                                                                                                             |
| Total Tenants              | The number of tenants this standard applies to                                                                                                                                                  |
| Tenants                    | A list of the tenants this standard applies to                                                                                                                                                  |
| Compliance Percentage      | This shows the percentage of tenants who are in compliance with the standard                                                                                                                    |
| License Missing Percentage | This shows the percentage of standards in the standard template that the tenant is not licensed for. 0% indicates that the tenant carries licenses necessary for all standards in the template. |
| Aligned Count              | The total of tenants who are Compliant, Accepted Deviation, or Customer Specific                                                                                                                |
| Compliant Count            | The count of tenants that are compliant                                                                                                                                                         |
| Non Compliant Count        | The count of tenants that are non compliant                                                                                                                                                     |
| License Missing Count      | The count of tenants that have missing licensing for the standard                                                                                                                               |
| Accepted Deviation Count   | The count of tenants that have accepted a deviation from the standard's settings.                                                                                                               |

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>View Tenant Report</td><td>Opens <a data-mention href="../../manage/applied-standards.md">applied-standards.md</a> for the selected standards template.</td><td>false</td></tr><tr><td>Edit Template</td><td>Opens the selected standard to edit.</td><td>false</td></tr><tr><td>Manage Drift</td><td>Opens the <a data-mention href="../../manage/drift.md">drift.md</a> page to the selected drift standard.</td><td>false</td></tr><tr><td>Remove Drift Customization</td><td>Removes all global and client level overrides from the standard and resets it to the template settings</td><td>true</td></tr></tbody></table>

## Known Issues

* There is currently a limitation with Conditional Access classic standards due to the complexity of the comparison the standard settings and the Conditional Access response object. We hope to resolve this in a future update.
* There is currently a limitation with standards applied to tenant groups that will not display in the chart. We hope to resolve this in a future update.

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
