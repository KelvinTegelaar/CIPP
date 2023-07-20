---
id: autopilotstatuspage
title: Autopilot Status Page
slug: /usingcipp/endpointmanagement/autopilotstatuspage
description: Manage Autopilot status page configuration across your Microsoft 365 tenants.
---

# Autopilot Status Page

The following two pages in CIPP give you the ability to manage Autopilot Status Pages:

### Add Status Page

This page provides the ability for you to edit/override the default Enrollment Status Page. This page applies to all tenants, all users and devices.

#### Details <a href="#addstatuspage-details" id="addstatuspage-details"></a>

* Timeout in minutes
* Custom error message
* Show progress to users
* Turn on log collection
* Show status page only with OOBE setup
* Block device usage during setup
* Retry
* Reset
* Let users use Device if Setup Fails

#### Known Issues / Limitations <a href="#addstatuspage-knownissues" id="addstatuspage-knownissues"></a>

You can only edit the default profile, and not create new ones. This profile is per default set to "All computers and devices"

**400** - You've entered wrong data, check the information and try again.



### List Status Pages

This page shows the status of the **Default** Status Page and the settings configured for it.

#### Details <a href="#liststatuspages-details" id="liststatuspages-details"></a>

| Field                      | Description                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| Name                       | The name of the status page.                                                       |
| Description                | The status page description.                                                       |
| Installation Timeout       | The time in minutes before the installation times out.                             |
| Show Installation Progress | Whether to display installation progress on the status page.                       |
| Block Retries              | Whether it's possible to retry in the event of autopilot failure.                  |
| Reset on failure           | Whether it's possible to reset in the event of autopilot failure.                  |
| Usage on failure           | Whether the user can continue to use the device in the event of autopilot failure. |

#### &#x20;<a href="#liststatuspages-knownissues" id="liststatuspages-knownissues"></a>
