# Add Standards Template

When creating a standard it is recommend to think about how you want your standards to be setup first. CyberDrain recommends splitting out standards per category, or service level. This prevents standards from becoming so large they become impossible to manage as too many items are in one standard. You can also split out categories such as "Intune Templates", "Entra Settings", "Managed Devices" etc.

{% stepper %}
{% step %}
### Set a Name for the Template

In the "Template Name" field, enter the name for this template
{% endstep %}

{% step %}
### Assign Template to Tenants

In the "Included Tenants" dropdown, select the tenant or tenants that you want this template to apply to.&#x20;

{% hint style="info" %}
If you select "AllTenants", you will be shown an additional dropdown for "Excluded Tenants" to indicate any tenants that you don't want this standard to apply to.
{% endhint %}

{% hint style="warning" %}
Just under the tenant assignment dropdown(s), you will see a toggle called "Do not run on schedule". If you turn on this toggle, this template will only run manually. Leave this toggle off if you would like this standard to run every three hours.
{% endhint %}
{% endstep %}

{% step %}
### Add Standards to Template

Click the "+ Add Standards to this template" button in the upper right of the page. This will display a modal that has a complete list of all CIPP standards that can be configured. For more information on each standard, see the standards category pages.

{% hint style="info" %}
This page has a "Filter Standards" box that will return standards that match for the name or description.
{% endhint %}

Toggle on the "Add this standard to the template" for each desired template. Once completed, click the "Close" button on the modal.
{% endstep %}

{% step %}
### Configure All Standards

For each standard:

* Set the desired Action(s). For assistance on selecting which action, [see the documentation](./#standards-actions).
* Each standard will then have the potential for additional fields that need to be set. Please review those fields and configure as desired.
{% endstep %}

{% step %}
### Save Template

Once all other steps are completed and all tenants show configured, click the "Save Template" button at the bottom of the left column that shouldn ow be enabled.
{% endstep %}
{% endstepper %}

***

{% include "../../../.gitbook/includes/feature-request.md" %}
