---
description: >-
  This page will allow you to test your conditional access policies before
  putting them in production. The returned results will show you if the user is
  allowed or denied access based on the policy.
---

# Conditional Access

## Parameters

| Parameter           | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| Application to Test | Select the application you wish to test against the policy.            |
| Country             | Select the country you want to test logging in from.                   |
| IP Address          | Enter the IP address you want to test logging in from.                 |
| Device Platform     | Select the device platform you want to test.                           |
| Client Application  | Select the client application you want to test.                        |
| Sign-In Risk Level  | Select the sign-in risk level of the user signing in you want to test. |
| User Risk Level     | Selec thte user risk level of the user signing in you want to test.    |

### CA Test Results

This table will outline the following information about the conditional access policies configured for the tenant and the results of the test.

| Column         | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| Display Name   | The display name of the conditional access policy.             |
| State          | The enablement state of the conditional access policy.         |
| Policy Applies | A Boolean showing if the policy applies to the test settings.  |
| Reasons        | A value for the reason for the decision on policy application. |

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
