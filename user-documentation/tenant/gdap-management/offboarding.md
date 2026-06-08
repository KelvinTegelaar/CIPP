# Offboarding

This page will help ensure that all necessary steps are taken when offboarding a tenant such as:

* Removing vendor applications
* Remove all guest users originating from the CSP tenant.
* Remove all notification contacts originating from the CSP tenant (technical, security, and marketing notifications).

{% hint style="danger" %}
The following actions will terminate all delegated access to the customer tenant!
{% endhint %}

* Remove all multitenant applications originating from CSP tenant (including CIPP-SAM).
* Terminate all active GDAP relationships (will send email to tenant admins and contacts). This can only terminate relationships with your partner tenant. Any other service providers will have to manage their own relationships.
* Terminate contract relationship (reseller, etc.).

{% hint style="warning" %}
Offboarded tenants may still appear in your tenants list for a short period of time. CIPP schedules a tenant cache clear that will run at the end of the process. If you need to immediately remove the tenant, go to [tenants.md](../../cipp/settings/tenants.md "mention") and select the action "Delete Tenant".
{% endhint %}

***

{% include "../../../.gitbook/includes/feature-request.md" %}
