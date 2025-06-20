# Global Variables

Global variables are key-value pairs that can be used to store additional information for All Tenants. These are applied to templates in standards using the format %variablename%. If a tenant has a custom variable with the same name, the tenant's variable will take precedence.&#x20;

These variables can be used in any type of template and will be replaced automatically.&#x20;

Tenant custom variables can be set on the [#custom-variables](../../tenant/administration/tenants/edit.md#custom-variables "mention") tab. Global variables are set via the application settings menu [global-variables.md](global-variables.md "mention").

{% hint style="danger" %}
Given the differences in how various systems treat the variable name, we recommend using all lowercase when naming variables, e.g. variablename
{% endhint %}

### Automatically Replaced Variables

The following variables will be automatically replaced by CIPP:

* `%tenantid%`
* `%tenantfilter%`
* `%tenantname%`

### Reserved Variables

The following variables are reserved and will not be used:

* `%serial%`
* `%systemroot%`
* `%systemdrive%`
* `%temp%`
* `%partnertenantid%`
* `%samappid%`

***

{% include "../../../.gitbook/includes/feature-request.md" %}
