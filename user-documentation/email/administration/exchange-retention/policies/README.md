# Policies

### Page Actions

[Add Policy](policy.md)

### Table Details

The properties returned are for the Exchange PowerShell command `Get-RetentionPolicy`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-retentionpolicy?view=exchange-ps).&#x20;

| Column                         | Description                                                                 |
| ------------------------------ | --------------------------------------------------------------------------- |
| Name                           | The name of the policy                                                      |
| Is Default                     | A Boolean field indicating if the policy is the default retention policy    |
| Is Default Arbitration Mailbox | A Boolean field indicating if the policy is the default arbitration mailbox |
| Retention Policy Tag Links     | The tags included in the policy                                             |

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Policy</td><td>Opens <a data-mention href="policy.md">policy.md</a></td><td>false</td></tr><tr><td>Delete Policy</td><td>Opens a modal to confirm you want to delete the policy</td><td>true</td></tr></tbody></table>

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
