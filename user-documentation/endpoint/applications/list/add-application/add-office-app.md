---
description: Deploy Office applications.
---

# Add Office App

You can add Office applications to deploy through Microsoft Endpoint Manager.

### Details

| Field                          | Description                                                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Excluded Apps                  | Apps to be excluded from the deployment.                                                                                                                                                                     |
| Update Channel                 | The update channel the apps will be assigned to.                                                                                                                                                             |
| Languages                      | What languages to download with the office deployment.                                                                                                                                                       |
| Use Shared Computer Activation | The status of the Network Inspection service.                                                                                                                                                                |
| 64 Bit (Recommended)           | Whether the install is for the 64 Bit version of Office.                                                                                                                                                     |
| Remove other versions          | Whether the install removes other versions of Office.                                                                                                                                                        |
| Accept License                 | Whether the install accepts the Office EULA license.                                                                                                                                                         |
| Use Custom XML Configuration   | Provide a custom Office Configuration XML. When using custom XML, all other Office configuration options above will be ignored. See [Office Customization Tool](https://config.office.com/) to generate XML. |
| Assignment Options             | Select the radial for how you want to assign this application: `Do not assign`, `Assign to all users`, `Assign to all devices`, or `Assign to all users and devices`                                         |

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
