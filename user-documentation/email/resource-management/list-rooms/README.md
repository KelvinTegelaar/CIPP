# Rooms

{% hint style="danger" %}
**Please note:** Newly created, updated and converted rooms will not be shown in the list immediately, and can take up to 24 hours to be visible.
{% endhint %}

This page lists all the rooms that are available in the tenant.

### Actions

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}

### Table Rows

| Column                            | Description                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Display Name                      | The display name set for the room                                                                                              |
| Mail                              | The e-mail address of the room                                                                                                 |
| Building                          | The building the room is located in                                                                                            |
| Capacity                          | The capacity for the room                                                                                                      |
| City                              | The city the room is located in                                                                                                |
| State                             | The state the room is located in                                                                                               |
| Country or Region                 | The country or region the room is located in                                                                                   |
| Hidden from Address Lists Enabled | A Boolean field indicating if the room has been hidden from address lists                                                      |
| ID                                | The Entra ID ID of the room                                                                                                    |
| Mail Nickname                     | The mail nickname of the room                                                                                                  |
| Account Disabled                  | A Boolean field indicating if the room's user account object has been disabled                                                 |
| Booking Type                      | The booking type for the room. "Standard" is able to be reserved. "Reserved" is available on a first-come, first-served basis. |
| Resource Delegates                | Individuals who have been granted delegated rights to the room                                                                 |
| Mtr Enabled                       | A Boolean indicating if the room is enabled for Microsoft Teams Room                                                           |
| Is Wheelchair Accessible          | A Boolean field indicating if the room is wheelchair accessible                                                                |

### Per-Row Actions

| Action          | Description                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------- |
| Edit Room       | Opens the [Edit Room](edit.md) page with the selected row's room pre-populated              |
| Block Sign In   | Blocks sign in for the room. Only available if the room is currently enabled for sign in    |
| Unblock Sign In | Unblocks sign in for the room. Only available if the room is currently blocked from sign in |
| Delete Room     | Opens a modal to confirm if you want to delete the room                                     |

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
