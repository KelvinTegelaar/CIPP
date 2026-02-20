# Apply Policy

The Apply Policy wizard provides the ability for you to select one or more tenants and add a MEM policy to their MEM portal.

{% stepper %}
{% step %}
### Tenant Selection

Selct the tenant(s) or All Tenants that you want to apply a policy to
{% endstep %}

{% step %}
### Policy Configuration

Select the policy template and the assignment level
{% endstep %}

{% step %}
### Confirmation

Review the selected options and if you are ready to procede click `Submit`. If you have any changes that need to be made, click `Back` and edit what's needed.
{% endstep %}
{% endstepper %}

{% hint style="warning" %}
Currently you can only apply new policies, applying policies doesn't update existing policies even if originally created from this template. \
To work around this you can apply the policy to "AllTenants" and have it reapplied on a schedule.
{% endhint %}

***

{% include "../../../.gitbook/includes/feature-request.md" %}
