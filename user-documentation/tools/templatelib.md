# Template Library

Template libraries are tenants set up to retrieve the latest version of a specific tenant's policies. These are then stored in CIPP's templates, allowing you to keep an up-to-date copy of the policies. This copy occurs every 4 hours.

In the template library menu you have two options; using a client tenant as a template library, or utilizing a Github community template repository.

CyberDrain includes 3 Github repositories by default;

* Open Intune Baseline. Considered the best baseline for Intune devices applying multiple frameworks such as CIS, NIS, and others. See [https://github.com/SkipToTheEndpoint/OpenIntuneBaseline](https://github.com/SkipToTheEndpoint/OpenIntuneBaseline) for more information.
* Conditional Access Framework - A ready made framework for conditional access templates that take away the heavy lifting for you. Check [https://github.com/j0eyv/ConditionalAccessBaseline](https://github.com/j0eyv/ConditionalAccessBaseline) for more information.
* The CyberDrain baseline repository - Includes examples and settings for CIPP Standards.

## Enabling the template library&#x20;

{% hint style="warning" %}
Enabling this feature will overwrite templates with the same name.
{% endhint %}

{% stepper %}
{% step %}
### Select a tenant OR a community library

Select an available tenant from the dropdown. This tenant will be the source of your templates, if you select a community template library you do not have to select a tenant.
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
