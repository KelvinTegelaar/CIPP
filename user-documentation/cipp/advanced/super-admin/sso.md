# SSO

This page will allow you to manage the CIPP-SSO app registration.

## Setting Up the CIPP-SSO App Registration

{% stepper %}
{% step %}
### (Optional) Toggle Multi-tenant Mode

The multi-tenant mode will enable the CIPP-SSO application to be logged in via multiple Microsoft tenants. Enable this if you have CIPP running in a tenant other than your CSP or if you foresee a situation like needing to provide access to CIPP to a comanaged client's internal IT.
{% endstep %}

{% step %}
### Click Create SSO App

The app will automatically deploy.
{% endstep %}
{% endstepper %}

## Changing Multi-tenant Mode

If you later decide that you need to change the setting for multi-tenant mode, you can return to this page and change the toggle. Click `Save Changes.`

## Rotating the Client Secret

If you later determine that you need to rotate the client secret, return to this page and click the `Rotate Secret` button.&#x20;

{% hint style="info" %}
CIPP will manage the rotation of the secret automatically at expiration. This function should be used when you need to rotate the secret outside of expiration.
{% endhint %}

## SSO Status Meanings

| Status                         | Description                                                 |
| ------------------------------ | ----------------------------------------------------------- |
| Not Configured                 | No record exists yet                                        |
| App Created - Secret Pending   | Step 2 done, secret not stored                              |
| App ID Stored - Secret Pending | Step 3 done, secret creation didn't run or failed           |
| Secrets Stored                 | All credentials stored, EasyAuth configures on next restart |
| Complete                       | EasyAuth is live and matches the stored app                 |
| Error                          | Something failed; error message surfaces in the UI          |

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
