---
hidden: true
---

# New Tenant Deployment

This page will open a wizard that allows you to easily create a new customer tenant.

{% stepper %}
{% step %}
### Tenant Type

Select the type of tenant that you would like to deploy. For now, this is limited to a Customer Tenant.
{% endstep %}

{% step %}
### Enter Tenant Details

Enter all details on this page as all information is required for a successful tenant setup.

{% hint style="warning" %}
The tenant name must be unique and is the .onmicrosoft.com desired domain. Once you enter this field, CIPP will check to ensure that domain is available and alert if it is already taken.
{% endhint %}
{% endstep %}

{% step %}
### Confirm and Submit

Review the information entered in the previous step. If any changes need to be made, go back. If all information is correct, then click submit.
{% endstep %}
{% endstepper %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
