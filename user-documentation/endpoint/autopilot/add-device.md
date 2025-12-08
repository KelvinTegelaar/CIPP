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

### Known Issues / Limitations <a href="#adddevice-knownissues" id="adddevice-knownissues"></a>

* A Reseller Relationship with the customer tenant may be required in addition to GDAP in order to add Autopilot devices.
* Getting the correct information for Manufacturer and Device Model can be quite difficult if you're trying to guess from the device's box. Windows Product Key ID or Hardware Hash are the most reliable methods. Some manufacturers include the Windows Product Key ID on the box.
* This API does not directly return data to CIPP and thus can incorrectly report the upload has failed.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
