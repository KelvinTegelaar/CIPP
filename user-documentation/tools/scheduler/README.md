# Scheduler

The task scheduler allows you to schedule CIPP functionality to be executed at a later date, and send the results to your PSA, Webhook, or email.&#x20;

The scheduler allows you to schedule components to run once, every day, every 7 days, every 30 days, or every year.

{% hint style="warning" %}
Scheduling a task for the past will make it run immediately.
{% endhint %}

Scheduled tasks run every 15 minutes on their planned time. A recurring task will return to a planned state directly after execution. The latest results of a task can be viewed via the eye icon in the history table.

### Actions

The following actions are always available at the top of the page

| Action                | Description                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Show/Hide System Jobs | Depending on which is displayed, this will either show or hide the system jobs in the table below |
| Add Job               | Opens the [Add Job](job.md) page                                                                  |

### Table Columns

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

### Per-Row Actions

The following actions are available in the three dots action menu.

| Action             | Description                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ |
| View Task Details  | Will open a view only page with the full details of the job                                |
| Run Now            | Will run the task at the next quarter hour                                                 |
| Edit Job           | Will display the job in a state where you can edit the details                             |
| Clone and Edit Job | Creates a copy of the selected job and opens the edit window to make any necessary changes |
| Delete Job         | Deletes the job from the schedule                                                          |
| More Info          | Opens a flyout with the task details                                                       |

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
