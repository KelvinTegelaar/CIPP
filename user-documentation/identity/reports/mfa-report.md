# MFA Report

This report provides an overview of the Multi-Factor Authentication (MFA) status for all users within the tenant. It's a combination of the built in Entra MFA report and getting the Per User MFA state and combining them for a complete picture.

{% hint style="info" %}
**Note**: To utilize the Entra MFA report part of this report, the tenant must be licensed for Entra P1 or higher. Per-User MFA status will still function even if the tenant isn't licensed.
{% endhint %}

## MFA Protection Criteria

A user must have at least one checkmark in any of the following categories to be protected by MFA:

* **Per-User MFA**: This means MFA is enabled directly on a per-user basis. It ensures that any sign-in attempt by the user is subjected to MFA verification.
* **Covered by Security Defaults (SD)**: This indicates that the user is protected by default security settings, automatically enabling and enforcing usage of MFA, when Microsoft deems a sign-in as risky.
* **Covered by Conditional Access (CA)**: In this case, MFA is enabled through Conditional Access policies which might require MFA based on conditions like user location, device compliance, etc.

## Page Actions

{% include "../../../.gitbook/includes/live-cached-page-action.md" %}

## Table Details

The report lists every user in the tenant and provides detailed information about their MFA status, including:

* Whether MFA is enabled and enforced through Per-User MFA settings.
* If the user is safeguarded by Security Defaults that enforce MFA.
* Whether Conditional Access policies require MFA for the user.
* If the user is capable of using MFA.
* The MFA methods the user has setup.

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Set Per-User MFA</td><td>Allows you to select the per-user MFA state for the user. One of <code>Enforced</code>, <code>Enabled</code>, or <code>Disabled</code>.</td><td>true</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
