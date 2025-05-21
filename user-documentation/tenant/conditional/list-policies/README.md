---
description: Review all Conditional Access Polcies per tenant
---

# CA Policies

This page lists all the Conditional Access Policies on the selected tenant. This lists everything that's available in the Microsoft Endpoint Manager (MEM) portal, including the applications the CA applies to and used built-in controls.

### Table Details

The properties returned are for the Graph resource type conditionalAccessPolicy. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/conditionalaccesspolicy?view=graph-rest-1.0#properties). CIPP does some additional correlation to convert some of the GUID attributes into display names for ease of reading.

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Availables</th></tr></thead><tbody><tr><td>Create template based on policy</td><td>Creates a CIPP template based on this policy to deploy to any other tenant [<a href="./#template-creation">More information</a>]</td><td>true</td></tr><tr><td>Enable policy</td><td>Enables policy for the tenant</td><td>true</td></tr><tr><td>Disable policy</td><td>Disables policy for the tenant</td><td>true</td></tr><tr><td>Set policy to report only</td><td></td><td>true</td></tr><tr><td>Delete policy</td><td>Opens modal to confirm deletion</td><td>true</td></tr><tr><td>More Info</td><td></td><td>false</td></tr></tbody></table>

### Template Creation

Using the action button "Create Template based on rule" you can create a one-off template of a conditional access rule in a tenant.

Creating a template includes all properties of the conditional policy templated; Inclusions and exclusions are translated and stored in CIPP for redeployment. When redeploying the template on any tenant every setting is included, such as Conditional Access Named locations, Authentication strengths, and any other setting.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
