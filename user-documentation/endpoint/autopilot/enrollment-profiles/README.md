# Enrollment Profiles

This page lists all the Windows Autopilot profiles that exist on the selected tenant, with a brief overview of some configured settings. There are additional tabs for [apple-ade.md](apple-ade.md "mention") and [android-enterprise.md](android-enterprise.md "mention").

## Action Buttons

<details>

<summary>Add Profile</summary>

This drawer provides the ability for you to add Autopilot profiles; Autopilot deployment profiles are groups of settings you can deploy to devices. You can create various profile types with this Wizard.

#### Details <a href="#addprofile-details" id="addprofile-details"></a>

* Display Name
* Description
* Unique Name Template
* Convert all Targeted Devices to Autopilot
* Assign to all Devices
* Self-Deploying Mode
* Hide Terms and Conditions
* Hide Privacy Settings
* Hide Change Account Options
* Setup User as Standard User (Leave unchecked to setup user as a local administrator)
* White Glove OOBE
* Automatically Configure Keyboard

</details>

## Table Details <a href="#listprofiles-details" id="listprofiles-details"></a>

The properties returned are for the Graph resource type `windowsAutopilotDeploymentProfile`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/intune-shared-windowsautopilotdeploymentprofile?view=graph-rest-beta#properties).

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Delete Profile</td><td>Opens modal to confirm you want to delete the selected profile(s)</td><td>true</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
