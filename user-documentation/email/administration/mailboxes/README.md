---
description: View information on all mailboxes in your Microsoft 365 tenants.
---

# Mailboxes

This page provides information on Exchange mailboxes, with the ability to view detailed information, edit the mailbox, view connected mobile devices and, access more information / actions.

### Action Buttons

{% content-ref url="addshared.md" %}
[addshared.md](addshared.md)
{% endcontent-ref %}

### Table Details

The properties returned are for the Exchange PowerShell command `Get-Mailbox`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchange/get-mailbox?view=exchange-ps).&#x20;

| Fields                     | Description                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| Display Name               | The display name of the selected user.                                |
| Recipient Type Details     | The detailed mailbox type typically `UserMailbox` or `SharedMailbox`. |
| UPN                        | The User Principal Name (UPN) of the selected user.                   |
| Primary Smtp Address       | The primary e-mail address of the selected user.                      |
| Recipient Type             | The Mailbox type, typically `UserMailbox`.                            |
| Additional Email Addresses | Comma separated list of alternate e-mail addresses                    |

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Enabled</th></tr></thead><tbody><tr><td>Bulk Add Mailbox Permissions</td><td>Allows you to bulk add other users to the selected mailbox(es) with <code>Send As</code> and/or <code>Send On Behalf</code> permissions.</td><td>true</td></tr><tr><td>Edit Permissions</td><td>Opens the <a href="../../../identity/administration/users/user/exchange.md">Exchange Settings</a> to allow you to edit the mailbox's permissions</td><td>false</td></tr><tr><td>Research Compromised Account</td><td><p></p><p>Analyzes Indicators of Compromise (IoC):</p><ul><li>Sign-in patterns</li><li>Mail rules</li><li>Suspicious activities</li></ul></td><td>false</td></tr><tr><td>Send MFA Push</td><td>Sends test MFA prompt to user's devices</td><td>true</td></tr><tr><td>Convert Mailbox</td><td>Transforms mailbox to selected type: <code>Shared</code>, <code>User</code>, <code>Room</code>, or <code>Equipment</code>.</td><td>true</td></tr><tr><td>Enable Online Archive</td><td>Enables the online archive for the mailbox</td><td>true</td></tr><tr><td>Enable Auto-Expanding Archive</td><td>If online archive is enabled, this will enable the auto-expanding archive</td><td>true</td></tr><tr><td>Set Global Address List Visibility</td><td>This action will allow you to hide/unhide the mailbox from the Global Address List.</td><td>true</td></tr><tr><td>Unhide from Global Address List</td><td>Unhides hidden user from GAL</td><td>true</td></tr><tr><td>Start Managed Folder Assistant</td><td>Prompts to start the managed folder assistant to apply message retention settings</td><td>true</td></tr><tr><td>Delete Mailbox</td><td>Deletes mailbox</td><td>true</td></tr><tr><td>Set Copy Sent Items for Delegated Mailboxes</td><td>For delegated mailboxes, this will set the status for all sent items to copy to the shared mailbox inbox</td><td>true</td></tr><tr><td>Set Litigation Hold</td><td>Opens modal to set up a litigation hold on the mailbox</td><td>true</td></tr><tr><td>Set Retention Hold</td><td>Opens modal to set or disable a retention hold</td><td>true</td></tr><tr><td>Set Mailbox Locale</td><td>Allows you to set the locale for the mailbox</td><td>true</td></tr><tr><td>Set Max Send/Receive Size</td><td>Allows you to set the max send and receive sizes for the selected mailbox(s)</td><td>true</td></tr><tr><td>Set Send Quota</td><td>Set the quota for message sending</td><td>true</td></tr><tr><td>Set Send and Receive Quota</td><td>Set the quota for message sending and receiving</td><td>true</td></tr><tr><td>Set Quota Warning Level</td><td>Set the warning level for the message quota</td><td>true</td></tr><tr><td>Set Calendar Processing</td><td>Sets calendar processing options for the selected mailbox(s)</td><td>true</td></tr><tr><td>More Info</td><td>Opens extended info flyout</td><td>false</td></tr></tbody></table>

{% hint style="warning" %}
On the mailbox edit page, and within the mailbox overview we currently cannot show if a mailbox is enabled for receiving external email. this is due to the Microsoft Graph API not returning the correct properties for this.
{% endhint %}

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
