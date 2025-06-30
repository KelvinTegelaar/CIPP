# Add App Approval Template

This page will allow you to create an approval template for a multi-tenant application. Set the template name, application to deploy, and the permission set.

{% hint style="warning" %}
As a prerequisite, you must first create a permissions template. See the documentation on [add.md](../permission-sets/add.md "mention").
{% endhint %}

{% stepper %}
{% step %}
### Name the Template


{% endstep %}

{% step %}
### Select the Application to Deploy

{% hint style="warning" %}
This drop down will only display applications with a sign in audience set to multi-tenancy.
{% endhint %}
{% endstep %}

{% step %}
### Select the previously created Permission Set


{% endstep %}

{% step %}
### Click "Create Template"


{% endstep %}
{% endstepper %}

{% hint style="success" %}
You can now deploy the application with the permissions template in [standards](../../standards/ "mention") or [appapproval.md](../../../tools/tenant-tools/appapproval.md "mention").
{% endhint %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
