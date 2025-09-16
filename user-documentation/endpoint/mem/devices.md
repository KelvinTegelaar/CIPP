---
description: Manage Intune devices across your Microsoft 365 tenants.
---

# Devices

The following page in CIPP gives you the ability to manage Intune devices:

### Table Details <a href="#listdevices-details" id="listdevices-details"></a>

The properties returned are for the Graph resource type `userExperienceAnalyticsDeviceScores`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/intune-devices-manageddevice?view=graph-rest-1.0#properties).

### Actions <a href="#listdevices-actions" id="listdevices-actions"></a>

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Available</th></tr></thead><tbody><tr><td>View in Intune</td><td>Opens the device in the Intune portal</td><td>false</td></tr><tr><td>Rename Device</td><td>Allows you to rename the device</td><td>true</td></tr><tr><td>Change Primary User</td><td>Updates the primary user assigned to the device</td><td>true</td></tr><tr><td>Sync Device</td><td>Starts a task to sync the device with Intune</td><td>true</td></tr><tr><td>Reboot Device</td><td>Sends a command to the device to reboot</td><td>true</td></tr><tr><td>Locate Device</td><td>Sends a command to locate the device</td><td>true</td></tr><tr><td>Retrieve LAPS password</td><td>Will retrieve the stored LAPS password from Entra</td><td>true</td></tr><tr><td>Rotate Local Admin Password</td><td>Will send a command to the device to rotate the LAPS password</td><td>true</td></tr><tr><td>Retrieve BitLocker Keys</td><td>Will retrieve the device's BitLocker key from Entra</td><td>true</td></tr><tr><td>Windows Defender Full Scan</td><td>Starts a Windows Defender full scan</td><td>true</td></tr><tr><td>Windows Defender Quick Scan</td><td>Starts a Windows Defender quick scan</td><td>true</td></tr><tr><td>Update Windows Defender</td><td>Triggers an update of the Windows Defender signatures</td><td>true</td></tr><tr><td>Generate logs and ship to MEM</td><td></td><td>true</td></tr><tr><td>Fresh Start (remove user data)</td><td>Triggers an Intune Fresh Start process with the option selected to remove user data</td><td>true</td></tr><tr><td>Fresh Start (do not remove user data)</td><td>Triggers an Intune Fresh Start process with the option selected to retain user data</td><td>true</td></tr><tr><td>Wipe Device, keep enrollment data</td><td>Triggers an Intune Wipe Device process with the option selected to retain enrollment data</td><td>true</td></tr><tr><td>Wipe Device, remove enrollment data</td><td>Triggers an Intune Wipe Device process with the option selected to remove enrollment data</td><td>true</td></tr><tr><td>Wipe Device, keep enrollment data, and continue at powerloss</td><td>Triggers an Intune Wipe Device process with the options selected to retain enrollment data and continue even if the device loses power</td><td>true</td></tr><tr><td>Wipe Device, remove enrollment data, and continue at powerloss</td><td>Triggers an Intune Wipe Device process with the options selceted to remove enrollment data and continue even if the device loses power</td><td>true</td></tr><tr><td>Autopilot Reset</td><td>Triggers an Intune Autopilot Reset process</td><td>true</td></tr><tr><td>Delete Device</td><td>Opens a modal to confirm you want to delete the device from Intune</td><td>true</td></tr><tr><td>Retire Device</td><td>Triggers an Intune Retire Device process</td><td>true</td></tr><tr><td>More info</td><td>Opens Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
