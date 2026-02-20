# CA Vacation Mode

The "Vacation Mode" feature enables administrators to schedule tasks that temporarily modify Conditional Access (CA) policies for users. This feature is particularly useful for managing user access during vacation periods, ensuring that CA exclusions are applied and removed automatically according to a defined schedule.

## Action Buttons

<details>

<summary>Add Vacation Schedule</summary>

This flyout allows you to schedule a task to add and remove a user or multiple users from CA exclusions for the specified period of time. Select the user(s), the conditional access policies to exclude the user(s) from during vacation, and the start and end dates. You can also optionally exclude this user from any location-based audit log alerts during the scheduled vacation. Be sure to include a note in the reference field for ease of identification later and this will be used in the notification title, if enabled. Click `Submit` once you have completed and reviewed all fields.

</details>

## **Table Details**

This table will display relevant information for previously scheduled vacations.

## Table Actions

<table><thead><tr><th></th><th></th><th data-type="checkbox"></th></tr></thead><tbody><tr><td>View Task Details</td><td>Opens the <a data-mention href="../../tools/scheduler/task.md">task.md</a> to the selected vacation mode task.</td><td>false</td></tr><tr><td>Cancel Vacation Mode</td><td>Opens a modal to cancel the remaining tasks on the schedule vacation</td><td>false</td></tr><tr><td>More Info</td><td>Opens Extended Info flyout</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}

