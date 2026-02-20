---
description: Review all Conditional Access Polcies per tenant
---

# CA Policies

This page lists all the Conditional Access Policies on the selected tenant. This lists everything that's available in the Microsoft Endpoint Manager (MEM) portal, including the applications the CA applies to and used built-in controls.

## Page Actions

<details>

<summary>Deploy CA Policy</summary>

Deploying Conditional Access is possible in two ways; using the deploy conditional access wizard to deploy a single policy or using the CIPP standards to deploy a template that will automatically redeploy if any changes are made.

Using the Deploy Conditional Access Policy Wizard you can change several settings in the policy such as the way usernames are replaced, the method used to deploy the state, and which exclusions are in place. When using templates from other tenants into a new tenant, make sure you select the correct replacement method, e.g. "Replace IDs with Display Names".

When using a Standard, you also are able to select these options; however, the replacement mode used will always be "Replace IDs with Display Names" to prevent the policy from not working on other tenants.

</details>

<details>

<summary>View Logs</summary>

Opens a table of the results from the [logs](../../cipp/logs/ "mention") for Conditional Access

</details>

## Table Details

The properties returned are for the Graph resource type `conditionalAccessPolicy`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/conditionalaccesspolicy?view=graph-rest-1.0#properties). CIPP does some additional correlation to convert some of the GUID attributes into display names for ease of reading.

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Availables</th></tr></thead><tbody><tr><td>Create template based on policy</td><td>Creates a CIPP template based on the selected policy(ies) to deploy to any other tenant [<a href="list-policies.md#template-creation">More information</a>]</td><td>true</td></tr><tr><td>Change Display Name</td><td>Opens modal to change the display name of the selected policy(ies)</td><td>true</td></tr><tr><td>Enable policy</td><td>Enables the selected policy(ies) for the tenant</td><td>true</td></tr><tr><td>Disable policy</td><td>Disables the selected policy(ies) for the tenant</td><td>true</td></tr><tr><td>Set policy to report only</td><td>Opens a modal to set the selected policy(ies) to report only</td><td>true</td></tr><tr><td>Add service provider exception to policy</td><td>Opens a modal to add a service provider exception to the selected policy(ies)</td><td>true</td></tr><tr><td>Delete policy</td><td>Opens modal to confirm deletion of the selected policy(ies)</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

## Template Creation

Using the action button "Create Template based on rule" you can create a one-off template of a conditional access rule in a tenant that will be available in [list-template](list-template/ "mention").

Creating a template includes all properties of the conditional policy templated; Inclusions and exclusions are translated and stored in CIPP for redeployment. When redeploying the template on any tenant every setting is included, such as Conditional Access Named locations, Authentication strengths, and any other setting.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
