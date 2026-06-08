# DLP Policy Templates

This page will allow you to manage your Purview DLP Policy templates.

## Page Actions

<details>

<summary>Deploy DLP Policy</summary>

This will open an action drawer that will allow you deploy a DLP policy either by template or by pasting the JSON into the Parameters block. Select the tenant(s) you want to deploy the policy to, select the template or paste the JSON, and click Deploy.

</details>

<details>

<summary>Browse Catalog</summary>

This will open a drawer that will let you search configured GitHub repositories for templates to import.

{% hint style="info" %}
Be sure to check out [community-repos](../../../tools/community-repos/ "mention") for more on setting up repositories.
{% endhint %}

</details>

## Table Details

The table will display any templates that you have previously created.

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Save to GitHub</td><td>Saves the selected template(s) to your GitHub repository of choice.</td><td>true</td></tr><tr><td>Delete Template</td><td>Deletes the selected template(s).</td><td>true</td></tr><tr><td>More Info</td><td>Opens the extended info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
