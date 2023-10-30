---
description: Deploy applications using the Chocolatey package manager.
---

# Defender Status

This page lists the defender status for all enrolled devices in a tenant. This includes whether there are active threats, the status of various components / services, the status of scans and, whether the device requires action.

### Details

| Field                      | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| Device Name                | The name of the device.                                 |
| Malware Protection         | The status of the Malware Protection service.           |
| Real Time Protection       | The status of the Real Time Protection service.         |
| Network Inspection         | The status of the Network Inspection service.           |
| Last Reported Health State | The last reported health state of the device.           |
| Quick Scan Overdue         | Whether the quick scan is overdue.                      |
| Full Scan Overdue          | Whether the full scan is overdue.                       |
| Signature Update Required  | Whether the device has all available signature updates. |
| Reboot Required            | Whether the device requires a restart.                  |
| Attention Required         | Whether the device requires attention.                  |

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListDefenderState" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.

### Known Issues / Limitations

* You must be a current Microsoft Lighthouse partner, and your tenants must be on-boarded to Lighthouse to use this functionality
