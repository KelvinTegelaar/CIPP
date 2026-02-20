---
description: Deploy JSON formatted Intune policy templates to your Microsoft 365 tenants.
---

# Policy Templates

This page gives you the ability to view all configured templates, in addition to viewing the raw JSON and the type of policy.

## Page Actions

<details>

<summary>Browse Policy Catalog</summary>

This flyout wizard will allow you to browse the policy catalog. Select one of your configured [community-repos](../../../tools/community-repos/ "mention") and then import the desired templates.

</details>

{% @storylane/embed subdomain="app" linkValue="939rpjvy23oy" url="https://app.storylane.io/share/939rpjvy23oy" %}

## Table Details <a href="#listmempolicytemplates-details" id="listmempolicytemplates-details"></a>

| Field        | Description                                       |
| ------------ | ------------------------------------------------- |
| Display Name | The name of the template.                         |
| Description  | The description for the template.                 |
| Type         | The template type, for example Catalog or Device. |

## Table Actions <a href="#listmempolicytemplates-actions" id="listmempolicytemplates-actions"></a>

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Template</td><td>Opens the <a data-mention href="edit.md">edit.md</a> page</td><td>false</td></tr><tr><td>Edit Template Name and Description</td><td>Opens a modal to edit the name and description of the selected template(s)</td><td>true</td></tr><tr><td>Add to package</td><td>Opens a modal to add the selected template(s) to an Intune tag. Enter the name of the tag you want to add the template(s) to</td><td>true</td></tr><tr><td>Remove from package</td><td>Opens a modal to remove the selected template(s) from their package. </td><td>true</td></tr><tr><td>Save to GitHub</td><td>Saves the selected template(s) to your chosen GitHub repo</td><td>true</td></tr><tr><td>Delete Template</td><td>Opens a modal to confirm deletion of the selected template(s)</td><td>true</td></tr><tr><td>More Info</td><td>Opens Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
