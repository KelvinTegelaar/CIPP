# CIPP Backup

{% hint style="info" %}
This page is accessed from the General settings tab.
{% endhint %}

### Information Bar

The top bar will display statistical information about your CIPP backups including the number of backups run, the relative time since the last backup, the status of automatic backups, and when the next backup is scheduled.

### Action Buttons

| Action                 | Description                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Run Backup             | Triggers a backup to run                                                                      |
| Enable Backup Schedule | Enables automatic backups. This button only appears if you have not enabled automatic backups |
| Restore From File      | Allows you to upload a previous CIPP backup to restore those settings                         |

### Table Details

The table will display a list of previous backups.

{% hint style="info" %}
Backups are stored indefinitely. The low cost of Azure Table storage allows this to have minimal to no impact on self-hosted costs.
{% endhint %}

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Restore Backup</td><td>Restores CIPP using the selected backup</td><td>false</td></tr><tr><td>Download Backup</td><td>Downloads the selected backup(s)</td><td>true</td></tr></tbody></table>

### What Gets Backed Up

The following tables will get copied into the backup:

* AccessRoleGroups
* ApiClients
* AppPermissions
* CommunityRepos
* Config
* CustomData
* CustomRoles
* CustomVariables
* Domains
* ExcludedLicenses
* Extensions - This table does not include the authentication for the extensions. You will need to manually set up the extensions again if you restore from a backup.
* GDAPRoles
* GDAPRoleTemplates
* GraphPresets
* ScheduledTasks
* SchedulerConfig
* Standards
* templates
* TenantProperties
* WebhookRules

***

{% include "../../../.gitbook/includes/feature-request.md" %}
