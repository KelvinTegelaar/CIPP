---
description: View OneDrive information for users in your Microsoft 365 tenants.
---

# OneDrive

### Overview

This page lists OneDrive and SharePoint usage from the Microsoft usage API. The last 90 days of information is used for this report. You can use this to check how well implementation is going and if users are actively using their OneDrive and Sharepoint sites. You can also see if users are approaching any limits.

### Details

| Fields                    | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| Name                      | The name of the user.                                   |
| User Principal Name (UPN) | The UserPrincipalName of the user.                      |
| Last Active               | The date the OneDrive was last active for the user.     |
| File Count (Total)        | The total number of files in the users' OneDrive.       |
| Used (GB)                 | The total size in GB in the users' OneDrive.            |
| Allocated (GB)            | The total space in GB available in the users' OneDrive. |

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListSites" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
