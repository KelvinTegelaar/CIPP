---
id: autopilotdevices
title: Autopilot Devices
slug: /usingcipp/endpointmanagement/autopilotdevices
description: Manage Autopilot devices across your Microsoft 365 tenants.
---

# Autopilot Devices

The following two pages in CIPP give you the ability to manage Autopilot devices:

### Add Device

Add autopilot devices by following the Wizard on this page.

#### Details <a href="#adddevice-details" id="adddevice-details"></a>

As a partner, you can register devices to Windows Autopilot using any one of these methods:

* Hardware Hash (available from OEM or on-device script)
* Combination of Manufacturer, Device Model and Device Serial Number
* Windows Product Key ID

#### Known Issues / Limitations <a href="#adddevice-knownissues" id="adddevice-knownissues"></a>

This API does not directly return data to CIPP, and thus can incorrectly report the upload has failed.



### List Devices

This page lists all devices registered for Autopilot.

#### Details <a href="#listdevices-details" id="listdevices-details"></a>

| Fields       | Description                                     |
| ------------ | ----------------------------------------------- |
| Display Name | The display name of the device.                 |
| Serial       | The serial number of the device.                |
| Model        | The model of the device.                        |
| Manufacturer | The manufacturer of the device.                 |
| Group Tag    | The autopilot group tag assigned to the device. |
| Enrollment   | The enrollment status of the device.            |

#### Actions <a href="#listdevices-actions" id="listdevices-actions"></a>

* Delete Device - _This deletes the autopilot enrollment for the device._

#### &#x20;<a href="#listdevices-knownissues" id="listdevices-knownissues"></a>
