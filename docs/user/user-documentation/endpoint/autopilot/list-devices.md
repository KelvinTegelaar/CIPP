# Autopilot Devices

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

### Actions

* Delete Device - _This deletes the autopilot enrollment for the device._

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/RemoveAPDevice" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListAPDevices" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
