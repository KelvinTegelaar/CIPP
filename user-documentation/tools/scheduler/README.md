# Scheduler

The task scheduler allows you to schedule CIPP functionality to be executed at a later date, and send the results to your PSA, Webhook, or email.&#x20;

The scheduler allows you to schedule components to run once, every day, every 7 days, every 30 days, or every year.

{% hint style="warning" %}
Scheduling a task for the past will make it run on the next interval the scheduler runs.&#x20;
{% endhint %}

Scheduled tasks can be used to run tasks at 15 minute intervals. The system does not allow you to schedule a task for any other intervals. If you add a task via the API for 10:10, the task will run at 10:15.

A recurring task will return to a planned state directly after execution. The latest results of a task can be viewed via the eye icon in the history table.

### Action Buttons

| Action                | Description                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Show/Hide System Jobs | Depending on which is displayed, this will either show or hide the system jobs in the table below |
| Add Job               | Opens the [job.md](job.md "mention") page                                                         |

### Table Details

| Column         | Description                                                                     |
| -------------- | ------------------------------------------------------------------------------- |
| Executed Time  | The relative time since the task was last run                                   |
| Task State     | Displays information on if the task is "Planned", "Completed", or "Failed".     |
| Tenant         | The tenant selected for the job                                                 |
| Name           | The job's name                                                                  |
| Scheduled Time | The relative time since the task ran or until the task is scheduled to run next |
| Command        | The command selected for the task                                               |
| Post Execution | The settings for post execution notification                                    |
| Recurrence     | The recurrence selected for the task                                            |
| Results        | The results of the most recently run execution of the task                      |

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>View Task Details</td><td>Will open a view only page with the full details of the job</td><td>false</td></tr><tr><td>Run Now</td><td>Will run the task at the next quarter hour</td><td>true</td></tr><tr><td>Edit Job</td><td>Will display the job in a state where you can edit the details</td><td>false</td></tr><tr><td>Clone and Edit Job</td><td>Creates a copy of the selected job and opens the edit window to make any necessary changes</td><td>false</td></tr><tr><td>Delete Job</td><td>Deletes the job from the schedule</td><td>true</td></tr><tr><td>More Info</td><td>Opens a flyout with the task details</td><td>false</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
