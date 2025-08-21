# Tags

### Page Actions

[Add Tag](tag.md)

### Table Details

The properties returned are for the Exchange PowerShell command `Get-RetentionPolicyTag`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-retentionpolicytag?view=exchange-ps).&#x20;

| Column                  | Description                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                    | The name of the tag                                                                                                                                                                                                                                     |
| Type                    | The type of the tag. See the [Microsoft documentation](https://learn.microsoft.com/en-us/exchange/security-and-compliance/messaging-records-management/retention-tags-and-policies#types-of-retention-tags) for a list and description of each type.    |
| Retention Action        | The action the tag will take. See the [Microsoft documentation](https://learn.microsoft.com/en-us/exchange/security-and-compliance/messaging-records-management/retention-tags-and-policies#retention-actions) for a list and description of each type. |
| Age Limit for Retention | The time a message will live in a user's mailbox                                                                                                                                                                                                        |
| Retention Enabled       | A Boolean field indicating if retention is enabled                                                                                                                                                                                                      |
| Comment                 | Any comments entered on the tag                                                                                                                                                                                                                         |

### Table Actions

<table><thead><tr><th></th><th></th><th data-type="checkbox"></th></tr></thead><tbody><tr><td>Edit Tag</td><td></td><td>true</td></tr><tr><td>Delete Tag</td><td></td><td>true</td></tr></tbody></table>

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
