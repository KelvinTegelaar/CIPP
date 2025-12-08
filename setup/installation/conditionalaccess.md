---
description: Setup your Conditional Access policies for CIPP.
---

# Conditional Access Best Practices

To make sure CIPP is able to access your tenants securely we recommend the usage of Conditional Access. Both your, and your clients Conditional Access Policies will need to be configured for optimal usage.

## Setup of Your Conditional Access Policies

{% stepper %}
{% step %}
### Open Azure

Browse to the [Conditional Access Policies](https://portal.azure.com/#view/Microsoft_AAD_ConditionalAccess/ConditionalAccessBlade/~/Policies) blade in Azure.
{% endstep %}

{% step %}
### Edit Existing Conditional Access Policies

Exclude the CIPP service account from **each** existing policy, this way we have a dedicated policy for the CIPP service account
{% endstep %}

{% step %}
### Create CIPP Specific Policy

Create a new policy and include the CIPP user. Enforce Azure Multi-Factor Authentication for each logon (set sign in frequency under session to every time) and for all cloud applications. Do not add any exclusions or trusted locations.

{% hint style="danger" %}
If you have trusted locations under the classic MFA portal you must always remove those.
{% endhint %}

Save this policy under the name "CIPP Service Account Conditional Access Policy"
{% endstep %}
{% endstepper %}

## Setup of Clients' Conditional Access Policies

GDAP is affected by your clients' conditional access policies. To make sure you can access your clients using your CIPP integration user we recommend excluding the MSP from the Conditional Access Policy per [Microsoft's Documentation](https://learn.microsoft.com/en-us/partner-center/gdap-faq#what-is-the-recommended-next-step-if-the-conditional-access-policy-set-by-the-customer-blocks-all-external-access-including-csps-access-aobo-to-the-customers-tenant)

{% stepper %}
{% step %}
### Open Azure

Browse to your client's [Conditional Access Policies](https://portal.azure.com/#view/Microsoft_AAD_ConditionalAccess/ConditionalAccessBlade/~/Policies) blade in Azure.
{% endstep %}

{% step %}
### Edit Conditional Access Policies

For each policy listed. Add an exclusion to "Users and Groups" with the following settings:&#x20;

* Guest or external users&#x20;
* Service Provider Users&#x20;
* Selected
* Enter your tenant ID. If you do not know what your tenant ID is, you can look this up [here](https://whatismytenantid.com/).

{% hint style="danger" %}
If you have any [Microsoft-Managed Conditional Access policies](https://learn.microsoft.com/en-us/entra/identity/conditional-access/managed-policies) showing up in your client tenants, these are an indication from Microsoft that they do not feel that your client's tenant meets minimum security posture. These policies cannot be deleted but they can be cloned and then disabled.
{% endhint %}
{% endstep %}
{% endstepper %}

{% hint style="warning" %}
Optional: If you are running in Direct Tenant mode, exclude the CIPP service account for this tenant instead of the tenant exclusion.
{% endhint %}
