# SIEM

This page allows you to create a read-only SAS token to connect your SIEM to your CIPP logs table.

## Creating a SAS Token

{% stepper %}
{% step %}
### Select the Token Validity

Use the dropdown to select how long the token should be valid for
{% endstep %}

{% step %}
### Generate

Click the `Generate SAS Token` button at the bottom of that card. You will then receive the token that you can use for setting up your SIEM.
{% endstep %}
{% endstepper %}

{% hint style="warning" %}
SAS tokens are only displayed once. There will not be a way to obtain that token's value again. Be sure to copy the token and store it in a secure place. Generating a new token does not invalidate old tokens.
{% endhint %}

## Querying CIPP Logs

CIPP writes all log entries to an Azure Table Storage table called `CippLogs`. Each row is partitioned by date using the format `YYYYMMDD` as the `PartitionKey`, with a unique GUID as the `RowKey`.

{% hint style="warning" %}
**Always include a PartitionKey filter** in your queries. Azure Table Storage performs a full table scan without one, which is slow and expensive on large tables. Use `eq` for a single day or `ge` / `le` for a date range. **The date partition is in UTC time**, so you may need to use a date range to account for timezone differences.
{% endhint %}

### Available Columns

| Column       | Description                             |
| ------------ | --------------------------------------- |
| PartitionKey | Date in YYYYMMDD format                 |
| RowKey       | Unique log entry ID (GUID)              |
| Timestamp    | When the entry was written              |
| Tenant       | Tenant domain name                      |
| Username     | User who triggered the action           |
| API          | API endpoint or function name           |
| Message      | Log message text                        |
| Severity     | Log level (Info, Warning, Error, Debug) |
| LogData      | Additional JSON data (if any)           |
| TenantID     | Tenant GUID (when available)            |
| IP           | Source IP address (when available)      |

### **Example $filter Queries**

Append &$filter= to your SAS URL to filter results. Use eq, ne, gt, lt, ge, le, and combine with and / or.

### **Specific Day**

```
$filter=PartitionKey eq 'YYYYMMDD'
```

Replace YYYYMMDD with the current date, e.g. 20260312

### Date Range (last 7 days)

```
$filter=PartitionKey ge '20260305' and PartitionKey le '20260312'
```

Use ge/le to query a range of dates

### Azure Tables Documentation

* [Querying Tables and Entities](https://learn.microsoft.com/en-us/rest/api/storageservices/querying-tables-and-entities) — filter syntax, operators, and supported data types
* [Query Timeout and Pagination](https://learn.microsoft.com/en-us/rest/api/storageservices/query-timeout-and-pagination) — handling continuation tokens for large result sets

***

{% include "../../../.gitbook/includes/feature-request.md" %}
