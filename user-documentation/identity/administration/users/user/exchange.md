---
description: This page displays information about the user's Exchange settings.
---

# Exchange Settings

### Actions Drop Down

| Action                                    | Description                                                                                                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bulk Add Mailbox Permissions              | Allows you to bulk add other users to the current mailbox with `Send As` and/or `Send On Behalf` permissions.                                                                      |
| Send MFA Push                             | Sends a push notification to the user's Microsoft Authenticator (if setup). This is useful to confirm you are speaking with the user.                                              |
| Convert Mailbox                           | Transforms mailbox to selected type: `Shared`, `User`, `Room`, or `Equipment`.                                                                                                     |
| Enable Online Archive                     |                                                                                                                                                                                    |
| Enable Auto-Expanding Archive             | If the online archive has been enabled, this will allow you to enable the auto-expanding archive                                                                                   |
| Set Global Address List Visibility        | This action will allow you to hide/unhide the mailbox from the Global Address List.                                                                                                |
| Start Managed Folder Assistant            |                                                                                                                                                                                    |
| Delete Mailbox                            |                                                                                                                                                                                    |
| Copy Sent Items to Shared Mailbox         | If this mailbox is a shared mailbox, this will set the attribute to copy sent items to the shared mailbox.                                                                         |
| Disable Copy Sent Items to Shared Mailbox | If the mailbox is a shared mailbox, this will set the attribute to disable copy items to the shared mailbox.                                                                       |
| Set Litigation Hold                       | Opens a model to enable a litigation hold on the mailbox and set the duration for the hold. If you want to remove the litigation hold, toggle the "Disable Litigation Hold" to on. |
| Set Retention Hold                        | Opens a modal to enable the retention hold on the mailbox. If you want to remove the retention hold, toggle the "Disable Retention Hold" to on.                                    |
| Set Mailbox Locale                        | Opens a modal to set the locale of the mailbox, e.g. en-US or da-DK                                                                                                                |
| Set Max Send/Receive Size                 | Sets the max mailbox send and receive size for messages                                                                                                                            |
| Set Send Quota                            | Sets the quota (in MB, GB, or TB) the mailbox is allowed to send                                                                                                                   |
| Set Send and Receive Quota                | Sets the quota (in MB, GB, or TB) the mailbox is allowed to send and receive                                                                                                       |
| Set Quota Warning Level                   | Sets the warning level for the quota (in MB, GB, or TB)                                                                                                                            |
| Set Calendar Processing                   | Allows you to configure calendar processing settings such as "Automatically Accept Meeting Requests", "Allow Conflits", etc.                                                       |

### Exchange Details

| Detail                    | Description                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| Mailbox Type              | Displays the type of mailbox assigned to this user. "UserMailbox" or "ShareMailbox"              |
| Mailbox Usage             | Shows percentage of mailbox quota used.                                                          |
| Hidden From Address Lists | A Boolean value indicating if this user has been hidden from the Global Address List.            |
| Forward and Deliver       | A Boolean value indicating if this user's mailbox has been set to forward email to another user. |
| Forwarding Address        | If set, the e-mail address of the person email is forwarded to.                                  |
| Archive Mailbox Enabled   | A Boolean value indicating if the archive mailbox has been enabled.                              |
| Auto Expanding Archive    | A Boolean value indicating if the archive mailbox has been set to auto expand.                   |
| Total Archive Item Size   | The value, in GB, of the size of the archive.                                                    |
| Total Archive Item Count  | The value, in total number of items, of the size of the archive.                                 |
| Litigation Hold           | A Boolean value indicating if the account has been placed in litigation hold.                    |
| Mailbox Protocols         | A listing of the protocols this mailbox has enabled.                                             |
| Blocked For Spam          | A Boolean value indicating if this account has been blocked by Microsoft due to spam activity.   |
| Current Mailbox Rules     | Displays any currently configured mailbox rules.                                                 |

### Expandable Actions in Info Area

| Action               | Description                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| Proxy Addresses      | A widget that allows for updating a user/mailbox proxy addresses with add, delete, and set primary capability. |
| Mailbox Permissions  | A widget that allows for updating mailbox permissions other users can be granted to this user's mailbox.       |
| Calendar Permissions | A widget that allows for updating calendar permissions other users can be granted to this user's mailbox.      |
| Contact Permissions  | A widget that allows you to manage contact folder permissions.                                                 |
| Mailbox Forwarding   | A widget that allows for updating mail forwarding options for this user's mailbox.                             |
| Out of Office        | A widget that allows you to edit the out of office settings for this user's mailbox.                           |

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
