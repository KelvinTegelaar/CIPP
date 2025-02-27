# Template Library

Template libraries are tenants set up to retrieve the latest version of a specific tenant's policies. These are then stored in CIPP's templates, allowing you to keep an up-to-date copy of the policies. This copy occurs every 4 hours.

{% hint style="warning" %}
Enabling this feature will overwrite templates with the same name.
{% endhint %}

{% stepper %}
{% step %}
### Select a tenant

Select an available tenant from the dropdown. This tenant will be the source of your templates.&#x20;
{% endstep %}

{% step %}
### Select template types

Toggle on the template types you would like to have copied.
{% endstep %}

{% step %}
### Submit

Submit will save your settings. CIPP will now update your templates every four hours from your template tenant.
{% endstep %}
{% endstepper %}

{% hint style="success" %}
CIPP recommends usage of a Customer Development Experience tenant for development of your templates. For more information, please see Microsoft's [CDX documentation](https://cdx.transform.microsoft.com/).
{% endhint %}

***

{% include "../../.gitbook/includes/feature-request.md" %}
