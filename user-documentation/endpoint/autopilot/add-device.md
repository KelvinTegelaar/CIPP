---
description: Manage Autopilot devices across your Microsoft 365 tenants.
---

# Add Autopilot Device

Add autopilot devices by following the Wizard on this page. As a partner, you can register devices to Windows Autopilot using any one of these methods:

* Hardware Hash (available from OEM or on-device script)
* Combination of Manufacturer, Device Model, and Device Serial Number
* Windows Product Key ID

## Importing Devices

{% stepper %}
{% step %}
### Tenant Selection

Select the tenant you want to add the devices to
{% endstep %}

{% step %}
### Device Import

You have two options for importing the devices

* CSV Import: CIPP has a template CSV that you can fill out and upload to ease population of the targeted devices
* Manual Import: This will open a window where you can add one or more devices to the import list. Enter the required information. If using a Serial Number, you must include either both Manufacturer and Model or a Hardware Hash.
{% endstep %}

{% step %}
### Extra Options

You can optionally select a Group Name to add the devices to
{% endstep %}

{% step %}
### Confirmation

Review the information to confirm everything looks as it should prior to clicking `Submit`.
{% endstep %}
{% endstepper %}

## Known Issues / Limitations <a href="#adddevice-knownissues" id="adddevice-knownissues"></a>

* A Reseller Relationship with the customer tenant may be required in addition to GDAP in order to add Autopilot devices.
* Getting the correct information for Manufacturer and Device Model can be quite difficult if you're trying to guess from the device's box. Windows Product Key ID or Hardware Hash are the most reliable methods. Some manufacturers include the Windows Product Key ID on the box.
* This API does not directly return data to CIPP and thus can incorrectly report the upload has failed.

***

{% include "../../../.gitbook/includes/feature-request.md" %}
