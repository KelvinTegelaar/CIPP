---
description: Manage Intune devices across your Microsoft 365 tenants.
---

# Devices

The following page in CIPP gives you the ability to manage Intune devices:

***

### List Devices

This page lists all devices registered in Intune.

#### Details <a href="#listdevices-details" id="listdevices-details"></a>

| Fields                   | Description                                   |
| ------------------------ | --------------------------------------------- |
| Name                     | The display name of the device.               |
| Used By                  | Displays the user of the machine.             |
| Compliance               | Displays the compliance status of the device. |
| Manufacturer             | The manufacturer of the device.               |
| Model                    | The model of the device.                      |
| Operating System         | The OS of the device.                         |
| Operating System Version | The OS of the device.                         |
| Enrolled on              | Date the device was enrolled.                 |
| Ownership                | Ownership Status                              |
| Enrollment               | The enrollment status of the device.          |
| Management Type          | Management Type                               |

#### Actions <a href="#listdevices-actions" id="listdevices-actions"></a>

* Sync Device
* Reboot Device
* Locate Device
* Retieve LAPs password
* Rotate local admin password
* Windows Defender full scan
* Windows Defender quick scan
* Update Windows Defender
* Generate logs and ship to MEM
* Rename device
* Fresh start (remove user data)
* Fresh start (do not remove user data)
* Wipe device, keep enrollment data
* Wipe device, remove enrollment data
* Wipe device, keep enrollment data and continue at powerloss
* Wipe device, remove enrollment data and continue at powerloss
* Autopilot reset
* Retire device

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecGetLocalAdminPassword" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecGetRecoveryKey" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecDeviceAction" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecDeviceAction" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListDevices" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
