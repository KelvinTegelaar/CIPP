# MFA Report

### Multi-Factor Authentication Report

This report lists all the users in the tenant and the status of the user in regards to Multi-Factor Authentication (MFA). For instance, it reports on whether they're enabled via Per-User MFA or enabled via Conditional Access or, whether it's enforced via Security Defaults.

Users with no MFA method configured show with a red highlight.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListMFAUsers" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
