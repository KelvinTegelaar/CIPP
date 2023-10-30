---
description: Show applications queued for deployment to your tenants.
---

# Application Queue

You can view a list of all applications queued for deployment to your tenants, any application listed here is going to be deployed to your tenants. The application will be removed from this list after deployment, unless it is deployed to "All Tenants"

### Details

| Fields             | Description                                |
| ------------------ | ------------------------------------------ |
| Tenant ID          | The tenant for the application deployment. |
| Name               | The name of the application.               |
| Install Command    | The command to install the application.    |
| Assigned to Groups | List the groups assignments for the app.   |

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListApplicationQueue" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
