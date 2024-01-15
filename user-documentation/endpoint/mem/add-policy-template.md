# Add Policy Template

This page provides the ability for you to create a template policy you can deploy to many tenants at the same time, if so required.

## Creating Templates

Templates are based on the information inside of a policy. This is stored and communicated with Microsoft in a format called "JSON".  There's multiple ways of creating templates

### Using the List Policies

When listing policies within CIPP you can create a template by clicking on the three dots next to a policy and selecting the option "Create Template". This template pulls all the data from the Microsoft environment into a single condensed template to deploy

### Using external sources

you can also grab the template information by using exernal sources, such as a blog or repository. Another method is by using "Graph X-ray" - A tool made by Merrill Fernando to ease the use of getting this information.

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListGraphRequest" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/AddPolicy" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
