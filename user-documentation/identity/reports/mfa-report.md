# MFA Report

## Multi-Factor Authentication Status Report

### Introduction

This report provides an overview of the Multi-Factor Authentication (MFA) status for all users within the tenant. It's a combination of the built in Entra MFA report, and getting the Per User MFA state and combining them for a complete picture.

{% hint style="info" %}
**Note**: To utilize the Entra MFA report part of this report, the tenant must be licensed for Entra P1 or higher. Per-User MFA status will still function even if the tenant isn't licensed.
{% endhint %}

### MFA Protection Criteria

A user must have at least one checkmark in any of the following categories to be protected by MFA:

* **Per-User MFA**: This means MFA is enabled directly on a per-user basis. It ensures that any sign-in attempt by the user is subjected to MFA verification.
* **Covered by Security Defaults (SD)**: This indicates that the user is protected by default security settings, automatically enabling and enforcing usage of MFA, when Microsoft deems a sign-in as risky.
* **Covered by Conditional Access (CA)**: In this case, MFA is enabled through Conditional Access policies which might require MFA based on conditions like user location, device compliance, etc.

### Detailed User MFA Status

The report lists every user in the tenant and provides detailed information about their MFA status, including:

* Whether MFA is enabled and enforced through Per-User MFA settings.
* If the user is safeguarded by Security Defaults that enforce MFA.
* Whether Conditional Access policies require MFA for the user.
* If the user is capable of using MFA.
* The MFA methods the user has setup.

{% hint style="warning" %}
For tenants with over 250 user accounts, the Per User MFA status might appear as blank or null due to API throttling. In such cases, it could indicate any of the following states: disabled, enabled, or enforced.
{% endhint %}



### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
