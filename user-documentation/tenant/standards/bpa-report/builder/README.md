# Custom Reports

CIPP's custom reporting functionality empowers advanced users to create tailored reports for any best practice scenarios you can imagine. While CIPP includes multiple default reports that are rapidly expanding, custom reports let you take control of exactly what data is presented. By defining your own JSON templates, you can specify APIs, commands, and display styles to meet unique organizational needs.

***

### **Best Practices for Building Custom BPA Reports**

**1. Starting with Existing Templates**

Begin with a pre-configured report like the `"CIPP Best Practices Table View"` to use as a foundation. Copy and modify the template to suit your needs. This approach simplifies the process and ensures compatibility with CIPP's structure.

**2. Defining Data Sources**

Custom reports pull data from sources such as:

* **Microsoft Graph API**: Requires specifying endpoints, fields, and parameters.
* **PowerShell Commands**: Allows extracting specific metrics from Exchange or similar environments.

**3. Understanding Report Structures**

Each custom report is a JSON template with three key components:

* **Fields**: Specifies which data points to extract.
* **Display Format**: Determines how the data appears (e.g., Booleans, tables, or JSON objects).
* **Data Sources**: Defines the API endpoints or PowerShell commands to use.

**4. Validating and Executing**

Once configured, force a data refresh to validate your report. This step ensures all APIs and commands execute correctly, and the report functions as intended.

***

### **Step-by-Step Guide to Creating a Custom Report**

**1. Setting the Foundation**

Every report begins with a title and presentation style.\
For example, to create a table-based report:

```json
{
    "name": "Company IT Overview",
    "style": "Table"
}
```

Alternatively, for a tenant-based overview, set the style to `"Tenant"`.

***

**2. Adding Fields**

Define the data points to fetch from an API, specifying the endpoint, parameters, and how the data should be presented:

```json
{
    "name": "Company IT Overview",
    "style": "Table",
    "fields": [
        {
            "name": "SharepointSettings",
            "API": "Graph",
            "URL": "https://graph.microsoft.com/beta/admin/sharepoint/settings",
            "Parameters": {"asApp": "True"},
            "ExtractFields": ["sharingCapability", "isMacSyncAppEnabled"],
            "StoreAs": "JSON",
            "FrontendFields": [
                {
                    "name": "Sharing Capability",
                    "value": "SharepointSettings.sharingCapability",
                    "formatter": "string"
                },
                {
                    "name": "Mac Sync Enabled",
                    "value": "SharepointSettings.isMacSyncAppEnabled",
                    "formatter": "warnBool"
                }
            ]
        }
    ]
}
```

This example fetches SharePoint settings, extracting sharing capabilities and Mac sync status.

***

**3. Fetching Exchange Data**

For Exchange, define commands instead of API URLs:

```json
{
    "name": "MailboxOverview",
    "API": "Exchange",
    "command": "Get-Mailbox",
    "Parameters": {"DetailLevel": "Full"},
    "ExtractFields": ["UserPrincipalName", "AccountDisabled"],
    "StoreAs": "JSON",
    "FrontendFields": [
        {
            "name": "Mailbox Size",
            "value": "MailboxOverview.MailboxSize",
            "formatter": "number"
        },
        {
            "name": "Last Login Date",
            "value": "MailboxOverview.LastLoginDate",
            "formatter": "string"
        }
    ]
}
```

This configuration retrieves mailbox details, including size and last login date.

***

**4. The End Result**

By following the steps above, you've crafted a detailed JSON structure for the "Company IT Overview" report. This report fetches data from SharePoint, Exchange, and presents insights in a tabular format. You can modify this structure to fetch different data or adjust the presentation as needed.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
