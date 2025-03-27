---
description: This page displays information about the user's Exchange settings.
---

# Exchange Settings

### Actions Drop Down

| Action                                    | Description                                                                                                                                                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Send MFA Push                             | Sends a push notification to the user's Microsoft Authenticator (if setup). This is useful to confirm you are speaking with the user.                                                                                              |
| Convert to User Mailbox                   | If this is a shared mailbox, then this will allow you to convert the mailbox to a user mailbox. This will be grayed out if the mailbox is already a user mailbox.                                                                  |
| Convert to Shared Mailbox                 | If this is a user mailbox, then this will allow you to conver the mailbox to a shared mailbox. This will be grayed out if the mailbox is already a shared mailbox.                                                                 |
| Convert to Room Mailbox                   | If this is a user or shared mailbox, then this will allow you to convert the mailbox to a room mailbox. This will then make the user object available as a Room. This will be grayed out if the mailbox is already a room mailbox. |
| Enable Online Archive                     |                                                                                                                                                                                                                                    |
| Enable Auto-Expanding Archive             | If the online archive has been enabled, this will allow you to enable the auto-expanding archive                                                                                                                                   |
| Hide from Global Address List             | If the mailbox is visible in the Global Address List, this option will allow you to hide the mailbox.                                                                                                                              |
| Unhide from Global Address List           | If the mailbox has been hidden from the Global Address list, this option will allow you to unhide the mailbox.                                                                                                                     |
| Start Managed Folder Assistant            |                                                                                                                                                                                                                                    |
| Delete Mailbox                            |                                                                                                                                                                                                                                    |
| Copy Sent Items to Shared Mailbox         | If this mailbox is a shared mailbox, this will set the attribute to copy sent items to the shared mailbox.                                                                                                                         |
| Disable Copy Sent Items to Shared Mailbox | If the mailbox is a shared mailbox, this will set the attribute to disable copy items to the shared mailbox.                                                                                                                       |
| Set mailbox locale                        | Opens a modal to set the locale of the mailbox, e.g. en-US or da-DK                                                                                                                                                                |
| Set Send Quota                            |                                                                                                                                                                                                                                    |
| Set Send and Receive Quota                |                                                                                                                                                                                                                                    |
| Set Quota Warning Level                   |                                                                                                                                                                                                                                    |

### Exchange Details

| Detail                       | Description                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Mailbox Type                 | Displays the type of mailbox assigned to this user. "UserMailbox" or "ShareMailbox"                                    |
| Mailbox Usage                | Shows percentage of mailbox quota used.                                                                                |
| Hidden From Address Lists    | A Boolean value indicating if this user has been hidden from the Global Address List.                                  |
| Forward and Deliver          | A Boolean value indicating if this user's mailbox has been set to forward email to another user.                       |
| Forwarding Address           | If set, the e-mail address of the person email is forwarded to.                                                        |
| Archive Mailbox Enabled      | A Boolean value indicating if the archive mailbox has been enabled.                                                    |
| Auto Expanding Archive       | A Boolean value indicating if the archive mailbox has been set to auto expand.                                         |
| Total Archive Item Size      | The value, in GB, of the size of the archive.                                                                          |
| Total Archive Item Count     | The value, in total number of items, of the size of the archive.                                                       |
| Litigation Hold              | A Boolean value indicating if the account has been placed in litigation hold.                                          |
| Mailbox Protocols            | A listing of the protocols this mailbox has enabled.                                                                   |
| Blocked For Spam             | A Boolean value indicating if this account has been blocked by Microsoft due to spam activity.                         |
| Current Mailbox permissions  | Displays information regarding any mailbox permissions that have been granted to other users for this user's mailbox.  |
| Current Calendar permissions | Displays information regarding any calendar permissions that have been granted to other users for this user's mailbox. |
| Current Mailbox Rules        | Displays any currently configured mailbox rules.                                                                       |

### Expandable Actions in Info Area

| Action               | Description                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Mailbox Permissions  | A widget that allows for updating mailbox permissions other users can be granted to this user's mailbox.  |
| Calendar Permissions | A widget that allows for updating calendar permissions other users can be granted to this user's mailbox. |
| Mailbox Forwarding   | A widget that allows for updating mail forwarding options for this user's mailbox.                        |
| Out of Office        | A widget that allows you to edit the out of office settings for this user's mailbox.                      |

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
