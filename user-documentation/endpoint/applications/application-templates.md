# Application Templates

This page allows you to manage application templates. Templates can contain one or multiple applications that you deploy consistently across clients.

## Page Actions

<details>

<summary>Create Template</summary>

This will open a drawer that will allow you to create a template based on each of the types of applications CIPP can deploy. Each template can contain multiple apps. Once you have completed the configuration of your app, click the `Add App to Template` button to configure additional apps.

{% hint style="warning" %}
MSP Vendor App templates save the app type and name. Tenant-specific parameters (keys, URLs) must be provided during deployment.
{% endhint %}

After saving the template, the drawer will remain open for you to create additional templates. Adjust the current template as you desire to save variations for rapid development of similar templates!

</details>

## Table Details

| Column       | Description                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Display Name | The name given to the app template at creation or last edit.                                                               |
| Description  | The description given to the app template at creation or last edit.                                                        |
| App Count    | The number of apps contained in the template.                                                                              |
| App Types    | The app types contained in the app template. Options: `mspApp`, `StoreApp`, `chocolateyApp`, `officeApp`, `win32ScriptApp` |
| App Names    | The names given to the apps in the template at creation or last edit.                                                      |

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Edit Template</td><td>Opens the template drawer with the selected template to allow changes to be made.</td><td>true</td></tr><tr><td>Save to GitHub</td><td>Saves the selected template(s) to GitHub. Only repositories configured in <a data-mention href="../../tools/community-repos/">community-repos</a> will be available.</td><td>true</td></tr><tr><td>Deploy Template</td><td>Opens a modal to deploy the selected template(s). Select the tenant(s) and optionally override the assignment setting.</td><td>true</td></tr><tr><td>Delete Template</td><td>Permanently deletes the selected template(s).</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Information flyout for the selected template.</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
