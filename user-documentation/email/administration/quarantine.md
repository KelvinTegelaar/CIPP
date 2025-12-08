# Quarantine

This page will display all messages quarantined by Microsoft Defender.

### Table Details

The properties returned are for the Exchange PowerShell command `Export-QuarantineMessage`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchange/export-quarantinemessage?view=exchange-ps).&#x20;

| Column         | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| Received Time  | The relative time since the message was received                |
| Release Status | The status of the message of either "RELEASED" or "NOTRELEASED" |
| Subject        | The message's subject                                           |
| Sender Address | The e-mail address of the sender                                |

### Table Actions

<table><thead><tr><th></th><th></th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>View Message</td><td>Opens modal to display the message contents</td><td>true</td></tr><tr><td>View Message Trace</td><td>Opens a modal with a table of the message's trace history</td><td>true</td></tr><tr><td>Release</td><td>Opens modal to confirm you want to release the message</td><td>true</td></tr><tr><td>Deny</td><td>Opens modal to confirm you want to deny release of the message</td><td>true</td></tr><tr><td>Release &#x26; Allow Sender</td><td>Opens modal to confirm you want to release the message and add the sender to the allowed sender list</td><td>true</td></tr><tr><td>More Info</td><td>Opens Extended Info flyout</td><td>false</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.

