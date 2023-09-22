---
description: Manage Autopilot status page configuration across your Microsoft 365 tenants.
---

# Status Pages

### List Status Pages

This page shows the status of the **Default** Status Page and the settings configured for it.

#### Details <a href="#liststatuspages-details" id="liststatuspages-details"></a>

<table><thead><tr><th width="281">Field</th><th>Description</th></tr></thead><tbody><tr><td>Name</td><td>The name of the status page.</td></tr><tr><td>Description</td><td>The status page description.</td></tr><tr><td>Installation Timeout</td><td>The time in minutes before the installation times out.</td></tr><tr><td>Show Installation Progress</td><td>Whether to display installation progress on the status page.</td></tr><tr><td>Block Retries</td><td>Whether it's possible to retry in the event of autopilot failure.</td></tr><tr><td>Reset on failure</td><td>Whether it's possible to reset in the event of autopilot failure.</td></tr><tr><td>Usage on failure</td><td>Whether the user can continue to use the device in the event of autopilot failure.</td></tr></tbody></table>

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListAutopilotconfig" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
