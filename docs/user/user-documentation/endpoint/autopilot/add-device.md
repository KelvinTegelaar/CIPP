---
description: Manage Autopilot devices across your Microsoft 365 tenants.
---

# Add Device

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

### API Calls

The following APIs are called on this page:

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/AddAPDevice" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
