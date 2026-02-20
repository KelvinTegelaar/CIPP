# Reusable Settings

This page will display all reusable settings that have been configured for the selected tenant. If you want to know more about reusable settings, see [Microsoft's documentation](https://learn.microsoft.com/en-us/intune/intune-service/protect/reusable-settings-groups).

## Page Actions

<details>

<summary>Deploy Reusable Settings</summary>

This wizard will allow you to select a tenant or tenants to deploy one of your reusable settings templates to. Select the tenant(s) and select the template. You can review the "Policy Details" section to find out more about what exactly will be deployed to the template. Hit "Deploy" when you are ready to add the reusable settings to the tenant(s).

</details>

{% hint style="info" %}
Save time by deploying one of your reusable settings templates with the [available-standards.md](../../tenant/standards/alignment/templates/available-standards.md "mention") "Reusable Settings Template".
{% endhint %}

## Table Details

The properties returned are for the Graph resource type `deviceManagementConfigurationSettingDefinition`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/intune-mam-managedapppolicy?view=graph-rest-1.0#properties).

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Template</td><td>Edits the selected template</td><td>false</td></tr><tr><td>Save to GitHub</td><td>Saves the selected template(s) to GitHub</td><td>true</td></tr><tr><td>Delete Template</td><td>Deletes the selected template(s)</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Information flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
