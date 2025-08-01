---
description: >-
  Learn how to make the most of the logbook functionality to help you keep a
  pulse of actions taken, and easily identify issues within CIPP.
---

# Logbook

The Logbook is a feature within CIPP that records and displays all actions performed by the system on a given day. This page is essential for monitoring and troubleshooting as it helps users track the execution of various tasks, identify issues, and confirm successful operations.

### **Using the Logbook for troubleshooting**&#x20;

Users can verify if specific actions have occurred by checking the log entries. For example, if a user wants to verify if a specific scheduled task, such as the "Hudu Extension Sync," was executed successfully. They select the appropriate date, use the filter to search for "Hudu Extension Sync," and review the log entries to confirm successful execution.

{% hint style="warning" %}
If an expected action is not logged, it might indicate a failure that occurred before the data was collected. If an alert is expected but not present in the logbook, it could indicate a failure in the data collection process. Such issues typically require developer intervention for identification and resolution. If you are a sponsor, please reach out to the helpdesk in these cases.
{% endhint %}

### Logbook Filters

Expanding the Logbook Filters section at the top of the page will present you with the following options for how you would like to retrieve data from the logbook:

* Start Date
* End Date
* Filter by Username
* Filter by Severity

### **Logbook Results Table**

| Column    | Description                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------- |
| Date Time | The exact time the action was logged                                                                             |
| Tenant    | The primary domain of the tenant                                                                                 |
| Tenant ID | The tenant ID associated with the log entry                                                                      |
| User      | Indicates the user associated with the action                                                                    |
| Message   | Provides a brief description of the action performed                                                             |
| API       | Identifies the API endpoint involved in the action                                                               |
| Severity  | Indicates the severity level of the log entry. Options include: `debug`, `info`, `warn`, `error`, and `critical` |
| App Id    |                                                                                                                  |
| Log Data  | Opens a second table to display information relevant to the logbook entry                                        |

### Table Actions

<table><thead><tr><th>Action</th><th>Details</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>View Log Entry</td><td>Opens the selected log entry to <a data-mention href="logentry.md">logentry.md</a></td><td>false</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
