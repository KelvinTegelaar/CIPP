---
description: Deploy JSON formatted Intune policy templates to your Microsoft 365 tenants.
---

# Templates

This page gives you the ability to view all configured templates, in addition to viewing the raw JSON and the type of policy.

#### Details <a href="#listmempolicytemplates-details" id="listmempolicytemplates-details"></a>

| Field        | Description                                       |
| ------------ | ------------------------------------------------- |
| Display Name | The name of the template.                         |
| Description  | The description for the template.                 |
| Type         | The template type, for example Catalog or Device. |

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.

#### Actions <a href="#listmempolicytemplates-actions" id="listmempolicytemplates-actions"></a>

* View Template
* Delete Template

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListGraphRequest" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListIntuneTemplates" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
