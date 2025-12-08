# Relationships

This page shows all the relationships that are attached to your Microsoft partner tenant.\
It shows the status of the relationship, the tenant's name, when it was created, when it expires, if auto extend is enabled, if the relationship includes a Global Admin and more.

### Table Details

The properties returned are for the Graph resource type `delegatedAdminRelationship` . For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/delegatedadminrelationship?view=graph-rest-1.0#properties).

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox"></th></tr></thead><tbody><tr><td>View Relationship</td><td>Opens the relationship summary page for the selected relationship [<a href="relationship.md">More information</a>]</td><td>false</td></tr><tr><td>Start Onboarding</td><td>Opens the CIPP onboarding wizard for the selected relationship</td><td>false</td></tr><tr><td>Open Relationship in Partner Center</td><td>Opens a new link to the relationship in your Microsoft Partner Center</td><td>false</td></tr><tr><td>Enable automatic extension</td><td>If the relationship is eligible for automation extension, this will enable the relationship to auto extend</td><td>true</td></tr><tr><td>Remove Global Administrator from Relationship</td><td>The Global Administrator (Company Admin in GDAP) role will be removed from the relationship. This is the lone role edit that is currently able to be made on an existing relationship.</td><td>true</td></tr><tr><td>Reset Role Mapping</td><td>Allows you to select a new Role Template to map to the relationship fixing relationships that have overlapping roles or incorrect group assignments.</td><td>true</td></tr><tr><td>Terminate Relationship</td><td></td><td>true</td></tr><tr><td>More Info</td><td>Opens Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
