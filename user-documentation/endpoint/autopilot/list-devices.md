# Autopilot Devices

This page lists all devices registered for Autopilot.

## Page Actions

{% content-ref url="add-device.md" %}
[add-device.md](add-device.md)
{% endcontent-ref %}

<details>

<summary>Sync Devices</summary>

Kicks off a sync of all autopilot devices to pull down up to date configuration profiles

</details>

## Table Details <a href="#listdevices-details" id="listdevices-details"></a>

The properties returned are for the Graph resource type `windowsAutopilotDeviceIdentity`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/intune-enrollment-windowsautopilotdeviceidentity?view=graph-rest-1.0#properties).

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Assign Device</td><td>Opens a modal to select the user to assign the device to</td><td>true</td></tr><tr><td>Rename Device</td><td>Opens a modal to set a new display name for the device</td><td>true</td></tr><tr><td>Edit Group Tag</td><td>Opens a modal to enter a new Autopilot group tag for the device</td><td>true</td></tr><tr><td>Delete Device</td><td>Opens a modal to confirm deletion of the device from Autopilot</td><td>true</td></tr><tr><td>More Info</td><td>Opens the extended information flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
