---
id: reports
title: Reports
description: Reports available within CIPP - E-mail & Exchange
slug: /usingcipp/emailexchange/reports
---

## Overview

There are currently multiple reports that can be run within the Exchange side of CIPP, see below for further details.

:::tip Anonymous Data
The data returned in these reports might be pseudonymised. Run the [standard "Enable Usernames instead of pseudo anonymised names in reports"](../../tenantadministration/standards/) to prevent this.
:::

All reports feature the ability to export to a PDF or CSV file.

### Mailbox Statistics

This report lists all mailboxes and pulls activity date, total space used, number of items in the mailbox and whether archiving is enabled.

### Mailbox Client Access Settings

This report lists all users and what Client Access Settings are enabled or disabled on their account, such as IMAP/OWA/POP etc.

### Message Trace

Message Trace allows you to trace an e-mail instantly from to any recipient, or any sender over the last 10 days (max).

### Phishing Policies

This report allows you to view the Phishing Policies configured on the selected tenant and whether they are enabled, have excluded senders or domains and when it was last amended.

## Known Issues / Limitations

* Message Trace currently only shows limited data, such as whether the message was delivered successfully or failed. You cannot currently see the Message Events indicating why this occurred. 

If you have any other issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
