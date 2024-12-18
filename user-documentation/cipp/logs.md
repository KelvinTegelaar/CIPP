---
description: >-
  Learn how to make the most of the logbook functionality to help you keep a
  pulse of actions taken, and easily identify issues within CIPP.
---

# Logbook

## **Overview**

The Logbook is a feature within CIPP that records and displays all actions performed by the system on a given day. This page is essential for monitoring and troubleshooting as it helps users track the execution of various tasks, identify issues, and confirm successful operations.

## **Using the Logbook for troubleshooting**&#x20;

Users can verify if specific actions have occurred by checking the log entries. For example, if a user wants to verify if a specific scheduled task, such as the "Hudu Extension Sync," was executed successfully. They select the appropriate date, use the filter to search for "Hudu Extension Sync," and review the log entries to confirm successful execution.

{% hint style="warning" %}
If an expected action is not logged, it might indicate a failure that occurred before the data was collected. If an alert is expected but not present in the logbook, it could indicate a failure in the data collection process. Such issues typically require developer intervention for identification and resolution. If you are a sponsor, please reach out to the helpdesk in these cases.
{% endhint %}

## **Interface Components**

1. **Date Selector:** The date selector allows users to change the date and view logs for that particular day. Only one day can be viewed at a time.
2. **Filter Search Bar:** Allows you to narrow down the logs based on specific criteria.
3. **Icons and Actions:** Allows for various ways to take action on your data, including:
   * **Refresh** the log entries to show the most recent actions.
   * **Adjust column** visibility or reset to defaults.
   * **Export** data to PDF / CSV for the selected date.
   * **View API response** in JSON format.
4. **Log Entries Table:** Displays the log entries for the selected date and filtered criteria, with the following available columns:
   * **Timestamp:** Shows the exact time the action was logged.
   * **Tenant ID:** Displays the tenant ID associated with the log entry.
   * **User:** Indicates the user associated with the action.
   * **Message:** Provides a brief description of the action performed
   * **API:** Identifies the API endpoint involved in the action.
   * **Severity:** Indicates the severity level of the log entry. Options include: `debug`, `info`, `warn`, `error`, and `critical`.
   * **Data:** Provides a link to any associated data, if available.

