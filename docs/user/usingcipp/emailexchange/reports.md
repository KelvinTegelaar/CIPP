---
id: reports
title: Reports
description: Reports available within CIPP - E-mail & Exchange
slug: /usingcipp/emailexchange/reports
---

## Overview

There are currently multiple reports that can be run within the Exchange side of CIPP, see below for further details.

### Details

#### Mailbox Statistics

:::tip Anonymous Data
The data returned by this API might be pseudo-anonimzed. Run the [standard "Enable Usernames instead of pseudo anonymised names names in reports"](../../tenantadministration/standards/) to prevent this.
:::

This report lists all mailboxes and pulls activity date, total space used, number of items in the mailbox and whether archiving is enabled.

These can all be filtered, exported to PDF or CSV.

#### Mailbox Client Access Setting

This report lists all users and what Client Access Settings are enabled or disabled on their account, such as IMAP/OWA/POP etc.

These can all be filtered, exported to PDF or CSV.

#### Message Trace

Message Trace allows you to trace an e-mail instantly from to any recipient, or any sender over the last 10 days (max).

#### Phishing Policies

This report allows you to view the Phishing Policies configured on the selected tenant and whether they are enabled, have excluded senders or domains and when it was last amended.

These can all be filtered, exported to PDF or CSV.

## Current known issues / Limitations

* Message Trace currently only shows limited data, such as whether the message was delivered successfully or failed.  You cannot currently see the Message Events as to why this occurred. 

If you have any further issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
