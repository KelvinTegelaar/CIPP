# Custom Reports

Using the custom reporting functionality you can create your own reports inside of CIPP for any Best practices you can imagine. By default CIPP includes multiple reports and we are rapidly expanding these. However there are times you want more power of exactly what data goes into the reports.&#x20;

Custom reporting is currently done by creating JSON files that allow you to tell CIPP which APIs should be used or which commands should be execute, and how to save the results of these APIs.



#### **1. Setting the Foundation**:

Every report begins with a title and a presentation style, in our tutorial we'll attempt to make a Table based report, you can also make Tenant based reports which give more of an overview document. To start we'll create a document called "CompanyITOverview.JSON" and open it in our preferred editor. We'll start with the basics;

```json
{
"name": "Company IT Overview",
"style": "Table"
}
```

#### **2. Delving into the actual fields**

We'll get into the fields next, and add this to our JSON file

<pre class="language-json"><code class="lang-json">{
"name": "Company IT Overview",
"style": "Table"
"fields": [
"name": "SharepointSettings",
"API": "Graph",
"URL": "https://graph.microsoft.com/beta/admin/sharepoint/settings",
"Parameters": {"asApp": "True"},
"ExtractFields": ["sharingCapability", "isMacSyncAppEnabled"],
"StoreAs": "JSON",
"FrontendFields": [
    {
        "name": "Sharing capability",
        "value": "SharepointSettings.sharingCapability",
        "formatter": "string"
    },
    {
        "name": "Mac Sync Enabled",
        "value": "SharepointSettings.isMacSyncAppEnabled",
        "formatter": "warnBool"
    }
        ]
<strong>    ]
</strong>}
</code></pre>

#### **3. Let's also get some Exchange data**

Exchange offers a wealth of data. Instead of URLs, Exchange uses commands:

```json
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
        "value": "AccountDisabled",
        "formatter": "string"
    }
]
```

#### **End Result**:

By following the steps above, you've crafted a detailed JSON structure for the "Company IT Overview" report. This report fetches data from SharePoint, Exchange, and presents insights in a tabular format. You can modify this structure to fetch different data or adjust the presentation as needed.

\
