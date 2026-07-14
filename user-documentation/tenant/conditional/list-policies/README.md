---
description: Review all Conditional Access Policies per tenant
---

# CA Policies

This page lists all the Conditional Access Policies on the selected tenant. This lists everything that's available in the Microsoft Endpoint Manager (MEM) portal, including the applications the CA applies to and used built-in controls.

## Page Actions

<details>

<summary>Deploy CA Policy</summary>

Conditional Access policies reference users, groups, and named locations by GUID, and those GUIDs are tenant-specific — a template built in tenant A will not resolve correctly when deployed to tenant B unless the references are translated.

CIPP supports two ways to deploy:

* **Deploy Conditional Access Policy Wizard** — single-tenant, one-shot deployment with options for state, exclusions, and how user/group references are translated.
* **CIPP Standards** — template-based deployment that auto-redeploys whenever drift is detected. Standards always use the **Replace IDs with Display Names** translation mode so templates remain portable across tenants.

### Replacement modes

| Mode                                             | Behavior                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Replace IDs with Display Names** (recommended) | Before deployment, CIPP enumerates all users and groups in the target tenant and substitutes any display-name reference in the template's `includeUsers` / `excludeUsers` / `includeGroups` / `excludeGroups` with the matching object's GUID in the target tenant. Special tokens (`All`, `None`, `GuestOrExternalUsers`) are left alone. Existing GUIDs in the template pass through unchanged. |
| **All Users**                                    | Strips all user and group includes/exclusions and scopes the policy to **All Users**. Use for tenant-wide baseline policies that should not be limited by group membership.                                                                                                                                                                                                                       |
| **None**                                         | Deploys the template verbatim. The original tenant's GUIDs are sent as-is, so this only works if those exact IDs already exist in the target tenant.                                                                                                                                                                                                                                              |

### "Create groups if missing"

When combined with **Replace IDs with Display Names**, if a group named in the template does not exist in the target tenant, CIPP creates it automatically:

* If a CIPP Group Template with the same display name exists, the group is created from that template (preserving group type, membership rules, etc.).
* Otherwise, a basic security group is created with the template's display name.

If this option is disabled and a referenced group is missing, deployment fails with an error so you can create or rename the group manually before retrying.

When deploying any template that originated from a different tenant, you almost always want **Replace IDs with Display Names** plus **Create groups if missing** enabled. This is also what CIPP Standards/Drift use internally, which is why standard deployments are portable across tenants without additional configuration.

</details>

<details>

<summary>View Logs</summary>

Opens a table of the results from the [logs](../../../cipp/logs/ "mention") for Conditional Access

</details>

## Table Details

The properties returned are for the Graph resource type `conditionalAccessPolicy`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/conditionalaccesspolicy?view=graph-rest-1.0#properties). CIPP does some additional correlation to convert some of the GUID attributes into display names for ease of reading.

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Policy</td><td>Opens the selected policy to the <a data-mention href="edit-ca-policy.md">edit-ca-policy.md</a> page.</td><td>false</td></tr><tr><td>Create template based on policy</td><td>Creates a CIPP template based on the selected policy(ies) to deploy to any other tenant [<a href="./#template-creation">More information</a>]</td><td>true</td></tr><tr><td>Change Display Name</td><td>Opens modal to change the display name of the selected policy(ies)</td><td>true</td></tr><tr><td>Enable policy</td><td>Enables the selected policy(ies) for the tenant</td><td>true</td></tr><tr><td>Disable policy</td><td>Disables the selected policy(ies) for the tenant</td><td>true</td></tr><tr><td>Set policy to report only</td><td>Opens a modal to set the selected policy(ies) to report only</td><td>true</td></tr><tr><td>Add service provider exception to policy</td><td>Opens a modal to add a service provider exception to the selected policy(ies)</td><td>true</td></tr><tr><td>Delete policy</td><td>Opens modal to confirm deletion of the selected policy(ies)</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

## Template Creation

Using the action button "Create Template based on rule" you can create a one-off template of a conditional access rule in a tenant that will be available in [list-template](../list-template/ "mention").

Creating a template includes all properties of the conditional policy templated; Inclusions and exclusions are translated and stored in CIPP for redeployment. When redeploying the template on any tenant every setting is included, such as Conditional Access Named locations, Authentication strengths, and any other setting.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
