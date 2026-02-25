# Configuration Backup

## Current Configuration

This button will change what is displayed depending on if you have already configured a backup schedule or not.

<details>

<summary>Add Backup Schedule</summary>

Select the tenant (or All Tenants) you want to create a backup task for. Toggle on or off the settings you want backed up prior to hitting the Submit button at the bottom of the page.

</details>

<details>

<summary>Remove Backup Schedule</summary>

If a backup has been scheduled, this button will display to allow you to delete the scheduled task.

</details>

## Backup Schedule Details

This section will display the details of the configured backup schedule, including the recurrance, last run, and next scheduled run.

## Backup Components

This will display the components configured for backup.

## Backup History

This table will output information for the backup history for the tenant(s) if it has been configured. Clicking the refresh button at the top of this section will pull in the latest backups from storage.

### Backup Card Information

| Item              | Description                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| Name              | The name given to the backup which is typically the date and time the backup was taken.               |
| Time Since Backup | A relative timestamp since this backup was taken.                                                     |
| Preview           | This will open an extended information window where you are able to preview the backed-up components. |
| Download          | This will download the backup as a JSON file.                                                         |
| Restore           | This will open the [#restore-wizard](backup.md#restore-wizard "mention") for the selected backup.     |

## Restore Wizard

This wizard allows you to select what will be restored from backup for the tenant.&#x20;

{% hint style="warning" %}
Note that entire categories will be replaced when you select this.
{% endhint %}

***

{% include "../../../.gitbook/includes/feature-request.md" %}
