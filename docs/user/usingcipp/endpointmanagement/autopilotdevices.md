---
id: autopilotdevices
title: Autopilot Devices
description: Manage Autopilot devices across your Microsoft 365 tenants.
slug: /usingcipp/endpointmanagement/autopilotdevices
---

## Overview

There are two main pages to the Autopilot Devices within the CIPP App

### Add Device - Overview

Adding autopilot devices can be done by following the Wizard using the standard Microsoft Partner APIs. 

#### Add Device - Detail

These APIs allow you to add devices in three ways:
As a partner, you can register devices to Windows Autopilot using any one of these methods:

* Hardware Hash (available from OEM or on-device script)
* Combination of Manufacturer, Device Model, Device Serial Number
* Windows Product Key ID

#### Add Device - Current known issues / Limitations

The API cannot directly return errors currently, which means that generic errors might appear. We've listed some below.

**400** - You've entered incorrect data, check the information and try again

**500** - The application does not have access to the partner center

If you have any further issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

--- 

### List Devices - Overview

This page lists all devices that are within the Autopilot portal that have not yet been enrolled.

#### List Device - Detail

* Delete Device

#### List Device - Current known issues / Limitations

There are currently no known issues with the Autopilot Devices page.  If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
