# Integration Sync

This page will display a table of the scheduled integration syncs for the integrations you have configured.

### Details

| Column         | Details                                                                                |
| -------------- | -------------------------------------------------------------------------------------- |
| Tenant         | Displays the tenant(s) the sync job will run for                                       |
| Sync Type      | Displays information relating to which integration or integration sync job is running. |
| Scheduled Time | The relative time until the next sync runs.                                            |
| Executed Time  | The relative time since the last sync run.                                             |
| Repeats Every  | The task recurrence for the sync.                                                      |
| Results        | The results of the last sync.                                                          |

{% hint style="info" %}
Scheduled tasks run on the quarter hour (:00, :15, :30, :45). Tasks that are due or past due will be picked up at that time. The Scheduled Time can help you know which quarter hour the task will be picked up at.
{% endhint %}

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
