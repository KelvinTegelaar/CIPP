# Safe Links Policies

### Action Buttons

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}

### Table Details

The properties returned are for the combination of the following Exchange PowerShell commands. For more information on the command please see the Microsoft documentation:

* [Get-SafeLinksPolicy](https://learn.microsoft.com/en-us/powershell/module/exchange/get-safelinkspolicy?view=exchange-ps)
* [Get-SafeLinksRule](https://learn.microsoft.com/en-us/powershell/module/exchange/get-safelinksrule?view=exchange-ps)
* [Get-EOPProtectionPolicyRule](https://learn.microsoft.com/en-us/powershell/module/exchange/get-eopprotectionpolicyrule?view=exchange-ps)

There are some additional calculated columns in the table. For example, the Configuration Status column will display additional information on the selected policy to indicate either a status of "Complete" or if it is a Policy/Rule/Built-In Rule Only.

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Safe Links Policy</td><td>Opens the <a data-mention href="edit.md">edit.md</a> page for the selected policy.</td><td>false</td></tr><tr><td>Enable Rule</td><td>Enables the selected rule(s)</td><td>true</td></tr><tr><td>Disable Rule</td><td>Disables the selected rule(s)</td><td>true</td></tr><tr><td>Set Priority</td><td>Sets the priority for the selected policy</td><td>false</td></tr><tr><td>Create template based on policy</td><td>Copies the selected policy's attributes to the <a data-mention href="add.md">add.md</a> page.</td><td>false</td></tr><tr><td>Delete Rule</td><td>Deletes the selected rule(s)</td><td>true</td></tr><tr><td>More Info</td><td>Opens Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
