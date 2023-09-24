---
description: View security alerts from your Microsoft 365 tenants.
---

# Alerts

List Alerts shows summary of the number of alerts across your managed Microsoft 365 tenants plus a detailed list of the actual alerts. You can also set the state of these alerts and view them directly in the Microsoft portals

### Details

The summary provides a count of the active alerts broken down into the following categories:

* New
* In Progress
* High Severity
* Medium Severity
* Low Severity
* Informational

Below the summary is a list of the alerts found for all your tenants with more detailed information.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecIncidentsList" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecAlertsList" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
