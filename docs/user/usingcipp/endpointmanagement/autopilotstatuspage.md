---
id: autopilotstatuspage
title: Autopilot Status Page
description: Manage Autopilot status page configuration across your Microsoft 365 tenants.
slug: /usingcipp/endpointmanagement/autopilotstatuspage
---

## Overview

The Autopilot Status Pages functionality in CIPP is split into the following two pages:

### Add Status Page - Overview

This page provides the ability for you to edit/override the default Enrollment Status Page. This page applies to all tenants, all users and devices.

### Add Status Page - Detail

* Timeout in minutes
* Custom Error Message
* Show Progress to Users
* Turn on Log Collection
* Show Status Page Only with OOBE Setup
* Block Device Usage During Setup
* Allow Retry
* Allow Reset
* Allow Users to use Device if Setup Fails

### Add Status Page - Known Issues / Limitations

You can only edit the default profile, and not create additional ones.

**400** - You've entered incorrect data, check the information and try again.

If you have any other issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

---

### List Status Pages - Overview

This page allows you to see the status of the **Default** Status Page and the settings configured for it.

### List Status Pages - Detail

|  Field                     | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| Name                       | The name of the status page.                                 |
| Description                | The status page description.                                 | 
| Installation Timeout       | The time in minutes before the installation times out.       |
| Show Installation Progress | Whether to display installation progress on the status page. |
| Block Retries              | Whether to allow retry in the event of autopilot failure.    |
| Allow reset on failure     | Whether to allow reset on failure.                           |
| Allow usage on failure     | Whether to allow usage on failure.                           |

### List Status Pages - Known Issues / Limitations

No known issues exist for the List Status Pages page. If you have any issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
