---
description: Deploy applications using the Chocolatey package manager.
---

# Defender Status

This page lists the defender status for all enrolled devices in a tenant. This includes whether there are active threats, the status of various components / services, the status of scans and, whether the device requires action.

### Table Details

The properties returned are for the Graph resource type managedDevice. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/intune-devices-manageddevice?view=graph-rest-1.0#properties). Additionally, CIPP is selecting the additional data that comes with the windowsProtectionState for the devices. For more information on the properties of that object, please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/intune-devices-windowsprotectionstate?view=graph-rest-1.0#properties).

### Known Issues / Limitations

* You must be a current Microsoft Lighthouse partner, and your tenants must be on-boarded to Lighthouse to use this functionality

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
