# Mailbox Client Access Settings

This report lists all users and the status of various Client Access Settings on their mailbox, such as IMAP / OWA / POP.

## Use cases

* Finding users where MAPI has erroneously disabled and is causing Outlook connectivity issues
* Ensuring POP and IMAP is disabled for all users

## Table Details

The properties returned are for the Exchange PowerShell command Get-`Get-CASMailbox`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchange/get-casmailbox?view=exchange-ps).&#x20;

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Set Client Access Protocols</td><td>Allows you to Enable/Disable selected client access protocols.</td><td>true</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
