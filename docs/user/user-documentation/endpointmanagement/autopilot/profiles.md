# Profiles

### List Profiles

This page lists all the profiles that exist on the selected tenant, with a brief overview of some configured settings.

#### Details <a href="#listprofiles-details" id="listprofiles-details"></a>

| Field                | Description                                         |
| -------------------- | --------------------------------------------------- |
| Name                 | The name of the policy.                             |
| Description          | The profile description.                            |
| Language             | The language the profile configures on the machine. |
| Convert to Autopilot | Converts targeted devices to use Autopilot.         |
| Device Name Template | The device name template for the policy.            |

### Actions

* View JSON - _Show all the options and their selected settings, in JSON format._

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListAutopilotconfig" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
