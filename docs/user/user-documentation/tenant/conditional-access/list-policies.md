---
description: Review all Conditional Access Polcies per tenant
---

# Policies

This page lists all the Conditional Access Policies on the selected tenant. This lists everything that's available in the Microsoft Endpoint Manager (MEM) portal, including the applications the CA applies to and used built-in controls.

### Details

| Fields               | Description                                           |
| -------------------- | ----------------------------------------------------- |
| Name                 | The name of the policy.                               |
| State                | The current state of the policy, for example enabled. |
| Last Modified        | The date the policy was last modified.                |
| Client App Types     | Any client applications targeted.                     |
| Platform Inc         | Any platforms/operating systems targeted.             |
| Platform Exc         | Any platforms/operating systems excluded.             |
| Include Locations    | Any locations targeted.                               |
| Exclude Locations    | Any locations excluded.                               |
| Include Users        | Any users targeted.                                   |
| Exclude Users        | Any users excluded.                                   |
| Include Groups       | Any groups targeted.                                  |
| Exclude Groups       | Any groups excluded.                                  |
| Include Applications | Any Azure AD applications targeted.                   |
| Exclude Applications | Any Azure AD applications excluded.                   |
| Control Operator     | The operator used to combine the filters.             |
| Built-in Controls    | Any built-in controls applied.                        |

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListConditionalAccessPolicies" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
