# Message Trace

Message Trace provides the ability for you to trace an e-mail instantly from to any recipient, or any sender over the last 10 days (max).

{% hint style="info" %}
Wildcard(\*) search is supported. Ex. "\*@contoso.com"
{% endhint %}

### Message Trace Options

| Option                   | Details                                                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Date Filter Type         | Select "Relative" or "Start/End" to provide different options on how you want to date range the search.                          |
| Number of days to search | If you select "Relative" for Date Filter Type, enter the number of days you would like to search. The maximum search is 10 days. |
| Start Date               | If you select "Start/End" for Date Filter Type, this will allow you to pick the date and time you want the search to begin       |
| End Date                 | If you select "Start/End" for Date Filter Type, this will allow you to pick the date and time you want the search to end         |
| Sender                   | The e-mail address of the sender you want to filter for                                                                          |
| Recipient                | The e-mail address of the recipient you want to filter for                                                                       |
| Message ID               | The message ID of the message you are searching for, if known                                                                    |
| Status                   | Select the message status from the drop down                                                                                     |
| From IP                  | Enter an IP address you are wanting to filter the results to just messages sent from this IP address                             |
| To IP                    | Enter an IP address you are wanting to filter the results to just messages received to this IP address                           |

### Table Details

Below are the default columns displayed in the table. Additional columns may be available by selecting the "Toggle Column Visibility" button at the top of the table.

| Column            | Description                                      |
| ----------------- | ------------------------------------------------ |
| Received          | The relative time since the message was received |
| Status            | The delivery status of the message               |
| Sender Address    | The e-mail address of the sender                 |
| Recipient Address | The e-mail address of the recipient              |
| Subject           | The subject of the email                         |

### Table Actions

<table><thead><tr><th>Action</th><th>Details</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>View Details</td><td>Opens a modal that displays a table with additional details regarding the message's routing.</td><td>true</td></tr><tr><td>View in Explorer</td><td>Opens the message in Microsoft Defender Explorer (Email &#x26; Collaboration -> Real-time detections)</td><td>false</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
