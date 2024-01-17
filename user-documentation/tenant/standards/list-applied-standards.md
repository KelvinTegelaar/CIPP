---
description: List applied standards to your Microsoft 365 CSP tenants.
---

# List Standards

Generates a table with a list of all applied standards.  
Output is for each tenant and is a JSON object.

{% hint style="warning" %}
Names of the standards are their API names, not the display names.
Ex. "Set Sharing Level for Default calendar" is calDefault.

All current and future standards API names can be found in [standards.json](https://github.com/KelvinTegelaar/CIPP/blob/main/src/data/standards.json) under the "name" property for each object.
Ex "name": "standards.calDefault", the API name is calDefault.
{% endhint %}

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListGroupTemplates" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListIntuneTemplates" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListCAtemplates" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListTransportRulesTemplates" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListStandards" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListExConnectorTemplates" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
