# Alerts Configuration

## Audit Log Alerts

Audit Log Alerts are alerts that are pushed into CIPP by external resources, such as the Microsoft Audit log, or Microsoft Graph Subscriptions. CIPP receives these alerts and processes them by adding information or executing remediation tasks.

Audit Log Alerts have the following actions that can be performed when an alert rule matches:

- Execute a BEC Remediate
- Disable the user in the log entry
- Generate an email
- Generate a PSA ticket
- Generate a webhook

{% hint style="warning" %}
Audit Log Alerts cannot be shipped to Slack, Discord, or Teams via CIPP, as these products do not support receiving raw JSON information webhooks.
{% endhint %}

---

### Alert Criteria

CIPP allows you to create rules based on the received alerts from these audit logs. You can either select our preset alert types, or you can add a custom alert. Our custom alert engine uses the same logic as our [complex filters](../../shared-features/filters.md), with the difference that you cannot chain filters and must add them individually.

#### Example 1

To alert on all audit logs where the PathName contains "RSS"

```vbnet
MoveToFolder like *RSS*
```

#### Example 2

To alert on a specific operation

```vbnet
Operation eq CustomLogEntry
```

You can find all possible keys in the [Microsoft documentation](https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-schema), however as this documentation can get quite complex we recommend setting up an alert on "Any" log to a webhook or email, so you can easily find the fields you want to filter on without needing to read all of the Microsoft Documentation.

---

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
