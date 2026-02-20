# View Device

This page will allow you to view in depth information on the device you selected from the [devices.md](../../../identity/administration/devices.md "mention") page.

## Page Actions

These page actions are nearly identical to the [#table-actions](../../../identity/administration/devices.md#table-actions "mention") from the Devices page. Please see that reference for information on the actions and what they do.

## Device Quick View

* Device Name: This is a click-to-copy field to allow you to see the name of the selected device
* Device Id: This is a click-to-copy field to allow you to see the deviceId of the selected device
* Last Sync: The relative time since the device's last sync with Intune
* View in Intune: This will launch the Intune portal to the selected device. NOTE: To view the Intune portal, your user account - not the CIPP service account - will need rights through either direct assignment if the partner tenant or GDAP if a client tenant.

## Device Details

This card will output some basic information about the device and the information you can gather from Intune. This includes hardware details like manufacturer, model, serial number, etc. in addition to Intune compliance status, enrollment date, etc.

## Compliance Policies

These cards allow you to view the device's compliance to the applicable compliance policies. Each card can be expanded to see the setting being measured and the current state. Compliance will report on a pass, fail, unknown, or no policies status.

## Configuration Policies

These cards allow you to view the device's compliance to the applicable configuration policies. Each card can be expanded to see the setting being measured and the current state. Compliance will report on a pass, fail, unknown, or no policies status.

## Detected Applications

This card will display a list of the applications Intune has detected as installed on the computer.

## Associated Users

This card will display a list of the users associated with the device. The table has an action to View User that will allow you to jump to [user](../../../identity/administration/users/user/ "mention") for the selected user.

## Memberships

This card will display a list of the groups the device is a member of.

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
