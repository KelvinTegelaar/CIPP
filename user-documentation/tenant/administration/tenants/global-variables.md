# Global Variables

Global variables are key-value pairs that can be used to store additional information for All Tenants. These are applied to templates in standards using the format %variablename%. If a tenant has a custom variable with the same name, the tenant's variable will take precedence.

These variables can be used in any type of template and will be replaced automatically.

Tenant custom variables can be set in the [#custom-variables](edit.md#custom-variables "mention") box, shown while editing a Tenant. Global variables are set on the [global-variables.md](global-variables.md "mention") tab under Tenant Administration > Administration > Tenants.

{% hint style="danger" %}
Given the differences in how various systems treat the variable name, we recommend using all lowercase when naming variables, e.g. variablename.
{% endhint %}

### Automatically Replaced Variables

The following variables will be automatically replaced by CIPP:

* `%initialdomain%`
* `%tenantfilter%`
* `%tenantid%`
* `%tenantname%`

### Reserved Variables

The following variables are reserved and will not be used:

* `%cippurl%`
*  `%cippuserschema%`
* `%defaultdomain%`
* `%partnertenantid%`
* `%programdata%`
* `%programfiles%`
* `%programfiles(x86)%`
* `%samappid%`
* `%serial%`
* `%systemdrive%`
* `%systemroot%`
* `%temp%`
* `%userdomain%`
* `%username%`
* `%userprofile%`
*  `%windir%`

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
