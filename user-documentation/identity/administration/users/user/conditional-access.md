---
description: >-
  This page will allow you to test your conditional access policies before
  putting them in production. The returned results will show you if the user is
  allowed or denied access based on the policy.
---

# Conditional Access

{% hint style="info" %}
This page works off of conditional access policies that would be applied to the user. Be sure to deploy your test policy in "Report Only" mode to ensure that you can test without breaking the user's login experience.
{% endhint %}

{% stepper %}
{% step %}
### Select the Application to Test

This drop down contains the list of applications available for login scenarios
{% endstep %}

{% step %}
### Select Optional Parameters

See the [#optional-parameters](conditional-access.md#optional-parameters "mention")table below for more information
{% endstep %}

{% step %}
### Click the "Test policies" button


{% endstep %}

{% step %}
### Review the Test Results

See the [#test-results](conditional-access.md#test-results "mention") table below for more information
{% endstep %}
{% endstepper %}

### Optional Parameters

| Parameter          | Description                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Country            | Select the country you want to test logging in from via the drop down.                   |
| IP Address         | Enter the IP address you want to test logging in from. Format must be similar to 8.8.8.8 |
| Device Platform    | Select the device platform you want to test.                                             |
| Client Application | Select the client application you want to test.                                          |
| Sign-In Risk Level | Select the sign-in risk level of the user signing in you want to test.                   |
| User Risk Level    | Select the user risk level of the user signing in you want to test.                      |

### Test Results

This table will outline the following information about the conditional access policies configured for the tenant and the results of the test.

| Column         | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| Display Name   | The display name of the conditional access policy.             |
| State          | The enablement state of the conditional access policy.         |
| Policy Applies | A Boolean showing if the policy applies to the test settings.  |
| Reasons        | A value for the reason for the decision on policy application. |

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
