---
description: Review all Conditional Access Polcies per tenant
---

# CA Policies

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

## Actions

Under the three dots for Conditional Access policies you'll find these actions:

* Create template based on rule - Creates a CIPP template based on this rule to deploy to any other tenant.
* Enable Rule - Enables the rule
* Disable Rule - Disables the rule
* Set rule to report only - Sets the rule to report only
* Delete Rule - Deletes the rule. This cannot be undone.

## Template Creation

Using the action button "Create Template based on rule" you can create a one-off template of a conditional access rule in a tenant.

Creating a template includes all properties of the conditional policy templated; Inclusions and exclusions are translated and stored in CIPP for redeployment. When redeploying the template on any tenant every setting is included, such as Conditional Access Named locations, Authentication strengths, and any other setting.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
