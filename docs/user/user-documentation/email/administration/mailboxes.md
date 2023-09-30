---
description: View information on all mailboxes in your Microsoft 365 tenants.
---

# Mailboxes

This page provides information on Exchange mailboxes, with the ability to view detailed information, edit the mailbox, view connected mobile devices and, access more information / actions.

### Details

| Fields                 | Description                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| User Principal Name    | The User Principal Name (UPN) of the selected user.                   |
| Display Name           | The display name of the selected user.                                |
| Primary E-Mail Address | The primary e-mail address of the selected user.                      |
| Recipient Type         | The Mailbox type, typically `UserMailbox`.                            |
| Recipient Type Details | The detailed mailbox type typically `UserMailbox` or `SharedMailbox`. |

### Actions

* View Mailbox
* Edit Mailbox:
  * _Edit and view the permissions assigned to the mailbox._
  * _Edit and view the calendar permissions assigned to the calendar._
  * _Edit and view mailbox forwarding settings._
* Edit Calendar permissions _Check Calendar permissions._
* View Mobile Devices _View a list of all mobile devices which have connected to the mailbox with detailed information on each device._
* Research Compromised Account
* Send Multi-Factor Authentication Push
* Convert to Shared Mailbox
* Convert to User Mailbox
* Hide from Global Address List
* Unhide from Global Address List

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListMailboxes" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
