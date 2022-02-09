---
id: autopilotdevices
title: Autopilot Devices
description: Manage Autopilot devices across your Microsoft 365 tenants.
slug: /usingcipp/endpointmanagement/autopilotdevices
---

## Overview

The Autopilot Device functionality in CIPP is split into the following two pages:

### Add Device - Overview

Adding autopilot devices can be done by following the Wizard.

#### Add Device - Detail

As a partner, you can register devices to Windows Autopilot using any one of these methods:

* Hardware Hash (available from OEM or on-device script)
* Combination of Manufacturer, Device Model and Device Serial Number
* Windows Product Key ID

#### Add Device - Known Issues / Limitations

The API can't directly return errors currently, which means that generic errors like those listed below might appear.

**400** - You've entered incorrect data, check the information and try again

**500** - The application doesn't have access to the partner center

If you have any other issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

--- 

### List Devices - Overview

This page lists all devices that are within the Autopilot portal that haven't yet been enrolled.

#### List Device - Detail

|  Fields                    | Description                                                    |
| -------------------------- | -------------------------------------------------------------- |
| Display Name               | The display name of the device.                                |
| Serial                     | The serial number of the device.                               |
| Model                      | The model of the device.                                       |
| Manufacturer               | The manufacturer of the device.                                |
| Group Tag                  | The autopilot group tag assigned to the device.                |
| Enrollment                 | The enrollment status of the device.                           |

#### List Device - Actions

* Delete Device - *This deletes the autopilot enrollment for the device.*

#### List Device - Known Issues / Limitations

There are no known issues with the List Devices page. If you have any issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
