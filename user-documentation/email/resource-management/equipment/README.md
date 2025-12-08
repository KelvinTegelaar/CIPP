# Equipment

This page will list all Equipment mailboxes in the tenant.

### Action Buttons

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}

### Table Details

The properties returned are for the Exchange PowerShell command `Get-Mailbox` with a filter for `EquipmentMailbox`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchange/get-mailbox?view=exchange-ps).&#x20;

{% hint style="danger" %}
**Please note:** Because newly created, updated, and converted equipment will not be shown via Graph immediately and can take up to 24 hours to be visible a decision was made to switch to the slower method of polling Exchange PowerShell.
{% endhint %}

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Equipment</td><td>Edits the selected equipment mailbox by opening the <a data-mention href="../../../identity/administration/users/user/edit.md">edit.md</a> page for the user object associated with the mailbox</td><td>false</td></tr><tr><td>Edit Permissions</td><td>Edits permissions for the selected equipment mailbox by opening the <a data-mention href="../../../identity/administration/users/user/edit.md">edit.md</a> page for the user object associated with the mailbox</td><td>false</td></tr><tr><td>Block Sign In</td><td>Blocks sign in for the selected equipment mailbox(es)</td><td>true</td></tr><tr><td>Unblock Sign In</td><td>Unblocks sign in for the selected equipment mailbox(es)</td><td>true</td></tr><tr><td>Delete Equipment</td><td>Deletes the selected equipment mailbox(es)</td><td>true</td></tr></tbody></table>

