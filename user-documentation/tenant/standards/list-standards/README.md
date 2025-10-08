# Standards Management

{% hint style="warning" %}
**Understanding Standards**

This page is a reference to the features of the Standards Templates page in CIPP. To better understand standards, please see the main page for [..](../ "mention").
{% endhint %}

This page will allow you to get a snapshot overview of your tenants and their alignment with your various Classic & Drift [classic-standards](classic-standards/ "mention").

### Table Details

| Column                     | Description                                                                                                                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant                     | The name of the tenant                                                                                                                                                                                                            |
| Standard Name              | The name of the standard template the tenant is being aligned to                                                                                                                                                                  |
| Standards Type             | `Classic Standard` or `Drift Standard`                                                                                                                                                                                            |
| Alignment Score            | This shows the percentage of standards this tenant is in alignment with for the selected standards template                                                                                                                       |
| License Missing Percentage | This shows the percentage of standards in the standard template that the tenant is not licensed for. 0% indicates that the tenant carries licenses necessary for all standards in the template.                                   |
| Combined Alignment Score   | This reweights alignment to account for the number of standards in the template that the tenant is not licensed for. If the tenant is not licnesed for any of the features, they will not count against alignment in this column. |
| Latest Data Collection     | Relative time since the last standards run to gather information needed to calculate the alignment report.                                                                                                                        |

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>View Tenant Report</td><td>Opens <a data-mention href="../compare.md">compare.md</a> for the selected standards template.</td><td>false</td></tr><tr><td>Manage Drift</td><td>Opens the <a data-mention href="../manage-drift/">manage-drift</a> page to the selected drift standard.</td><td>false</td></tr><tr><td>Remove Drift Customization</td><td>Removes all global and client level overrides from the standard and resets it to the template settings</td><td>true</td></tr></tbody></table>

### Known Issues

* There is currently a limitation with Conditional Access classic standards due to the complexity of the comparison the standard settings and the Conditional Access response object. We hope to resolve this in a future update.
* There is currently a limitation with standards applied to tenant groups that will not display in the chart. We hope to resolve this in a future update.

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
