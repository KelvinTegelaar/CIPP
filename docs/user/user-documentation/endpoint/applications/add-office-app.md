---
description: Deploy Office applications.
---

# Add Office App

You can add Office applications to deploy through Microsoft Endpoint Manager.

### Details

| Field                          | Description                                              |
| ------------------------------ | -------------------------------------------------------- |
| Excluded Apps                  | Apps to be excluded from the deployment.                 |
| Update Channel                 | The update channel the apps will be assigned to.         |
| Languages                      | What languages to download with the office deployment.   |
| Use Shared Computer Activation | The status of the Network Inspection service.            |
| 64 Bit (Recommended)           | Whether the install is for the 64 Bit version of Office. |
| Remove other versions          | Whether the install removes other versions of Office.    |
| Accept License                 | Whether the install accepts the Office EULA license.     |

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/AddOfficeApp" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
