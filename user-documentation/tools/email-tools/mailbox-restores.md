# Mailbox Restores

The Mailbox Restores page displays the current status of mailbox restores in Exchange Online. This page provides valuable information about ongoing restores, allowing administrators to monitor the progress and ensure successful restoration of user mailboxes.

## Page Actions

<details>

<summary>New Restore Job</summary>

This will open a flyout with the mailbox restore wizard that will allow you to restore a soft-deleted mailbox.&#x20;

</details>

## Table Details

| Column         | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| Name           | A unique identifier for the restore operation                                      |
| Status         | The current status of the restore operation (e.g., In Progress, Completed, Failed) |
| Target Mailbox | The destination of the restored content                                            |
| Created        | The date and time when the restore operation started                               |
| Change         | The last modified date and time                                                    |

## Restore Details

1. Click on the 3 dots to the right of the Restore Request to view additional details.
2. In this pane you can do the following:
   * Show the Mailbox Restore Report
   * Resume the Restore Request (if it was suspended)
   * Suspend the Restore Request
   * Remove the Restore Request

***

{% include "../../../.gitbook/includes/feature-request.md" %}
