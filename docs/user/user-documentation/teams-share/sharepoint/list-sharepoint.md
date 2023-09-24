---
description: Review Sharepoint sites and usage
---

# Sharepoint

This page lists SharePoint site usage. You can also see file count, activity and general usage, in addition to the resource allocations for the site.

### Details

| Fields                    | Description                                                   |
| ------------------------- | ------------------------------------------------------------- |
| Name                      | The name of the site.                                         |
| User Principal Name (UPN) | The UserPrincipalName of the site if it has a group linked.   |
| Last Active               | The date the site was last active.                            |
| File Count (Total)        | The total number of files in the site document library.       |
| Used (GB)                 | The total size in GB in the site document library.            |
| Allocated (GB)            | The total space in GB available in the site document library. |

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListSites" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
