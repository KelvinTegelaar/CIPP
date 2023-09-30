---
description: View and manage your Microsoft 365 CSP tenants.
---

# Tenants

{% hint style="warning" %}
When you select one of the portal links the permissions of the currently logged in user are the ones that matter, they need permission to access the portal in question either by virtue of direct administrative roles or the Admin Agent/Helpdesk Agent role in Partner Center.
{% endhint %}

The Tenant page provides the ability for you to jump to the specific tenant administration centers for that client using your individual partner credentials. Allowing you to administer that specific tenant.&#x20;

Tenants are cached for 24 hours. By using the Clear Tenant Cache button in settings you are able to reload the tenants from the partner center immediately. Remember to also clear your browser cache.

### Details

| Fields         | Description                  |
| -------------- | ---------------------------- |
| Name           | The tenant name.             |
| Default Domain | The tenant's default domain. |

The page also features several columns which contain links to the different Microsoft 365 administration centers for the tenant.

### Actions

* Edit Tenant

{% hint style="info" %}
The Edit Tenant page gives you the ability you to change the Display Name or Default Domain Name of the tenant shown in the Partner Center.

This _only_ affects what's shown in the Partner Center (and tenant list in CIPP) and doesn't change anything in the tenant itself.

By default Microsoft only picks up this information when you create a new relationship, and never updates this after.
{% endhint %}

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListTenantDetails" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListTenants" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
