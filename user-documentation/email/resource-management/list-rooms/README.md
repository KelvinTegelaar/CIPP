# Rooms

This page lists all the rooms that are available in the tenant.

### Action Buttons

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}

### Table Details

The properties returned are for the Exchange PowerShell command `Get-Mailbox` with a filter for `RoomMailbox`. For more information on the command please see the [Microsoft documentation](https://learn.microsoft.com/en-us/powershell/module/exchange/get-mailbox?view=exchange-ps).&#x20;

{% hint style="danger" %}
**Please note:** Because newly created, updated, and converted rooms will not be shown via Graph immediately and can take up to 24 hours to be visible a decision was made to switch to the slower method of polling Exchange PowerShell.
{% endhint %}

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Room</td><td>Opens the <a data-mention href="edit.md">edit.md</a> page with the selected row's room pre-populated</td><td>true</td></tr><tr><td>Edit Permissions</td><td>Opens the room's <a data-mention href="../../../identity/administration/users/user/edit.md">edit.md</a> page to allow you to adjust permissions</td><td>false</td></tr><tr><td>Block Sign In</td><td>Blocks sign in for the room. Only available if the room is currently enabled for sign in</td><td>true</td></tr><tr><td>Unblock Sign In</td><td>Unblocks sign in for the room. Only available if the room is currently blocked from sign in</td><td>true</td></tr><tr><td>Delete Room</td><td>Opens a modal to confirm if you want to delete the room</td><td>true</td></tr></tbody></table>

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
