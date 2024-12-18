---
description: Manage Autopilot devices across your Microsoft 365 tenants.
---

# Add Autopilot Device

The following two pages in CIPP give you the ability to manage Autopilot devices:

### Add Device

Add autopilot devices by following the Wizard on this page.

#### Details <a href="#adddevice-details" id="adddevice-details"></a>

As a partner, you can register devices to Windows Autopilot using any one of these methods:

* Hardware Hash (available from OEM or on-device script)
* Combination of Manufacturer, Device Model and Device Serial Number
* Windows Product Key ID

#### Known Issues / Limitations <a href="#adddevice-knownissues" id="adddevice-knownissues"></a>

{% hint style="warning" %}
A Reseller Relationship with the customer tenant may be required in addition to GDAP in order to add Autopilot devices.
{% endhint %}

This API does not directly return data to CIPP, and thus can incorrectly report the upload has failed.

