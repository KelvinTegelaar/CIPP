# Shared Mailbox with Enabled Account

Reports on all mailboxes that are shared and also have an enabled user account.

### Table Details

The properties returned are for the Exchange PowerShell command `Get-Mailbox` with a filter for `RecipientTypeDetails` of `SharedMailbox`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchange/get-mailbox?view=exchange-ps).&#x20;

### Table Actions

<table><thead><tr><th>Actions</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Block Sign In</td><td>Blocks sign in for the selected shared mailbox(es)</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
