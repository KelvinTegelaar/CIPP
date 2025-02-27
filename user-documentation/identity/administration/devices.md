# Devices

This page will present a tenant's Entra devices in a table.

### Available Columns

The columns for this table are laregely created from the Graph API response received from the device object. For reference, please review the [Graph API documentation](https://learn.microsoft.com/en-us/graph/api/resources/device?view=graph-rest-1.0#properties) on field descriptions.

### Per-Device Actions

| Action                  | Description                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| Enable Device           | Enables the device to be logged in with tenant credentials       |
| Disable Device          | Disables the device from being logged in with tenant credentials |
| Retrieve BitLocker Keys | Pulls BitLocker keys stored in Entra ID                          |
| Delete Device           | Deletes the device from Entra ID                                 |
| More Info               | Opens the "Extended Info" flyout                                 |

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
