# Graph Explorer

The Graph Explorer allows you to generate ad hoc reports using the Microsoft Graph API. Instead of a JSON representation the Graph object, Graph Explorer returns a table with exporting options. You can run any of the preset reports or enter your own settings to generate a report. This allows you to customize the data to your liking.

{% hint style="warning" %}
Graph Explorer is a moderately advanced tool. Understanding the Microsoft Graph API and all of the various ways to interact and influence the output can be difficult to understand. If you get stuck trying to craft a query, please don't hesitate to ask questions in the CyberDrain Discord server or contact support if you are a sponsoring user/organization.
{% endhint %}

## Microsoft Graph

Microsoft Graph is the source of the data for much of CIPP and is the vehicle for the data you'll see in the Graph Explorer. Familiarity with how API GET calls are made to Microsoft Graph can be helpful for you to be able to create custom queries. Information on the available data from Microsoft Graph can be found in their references. Since CIPP can call both the v1.0 and beta endpoints, both references are below:

{% embed url="https://learn.microsoft.com/en-us/graph/api/overview?view=graph-rest-1.0" %}

{% embed url="https://learn.microsoft.com/en-us/graph/api/overview?view=graph-rest-beta" %}

## How To Use Graph Explorer

{% @storylane/embed subdomain="app" linkValue="p0ljufhpgkmb" url="https://app.storylane.io/share/p0ljufhpgkmb" %}

### Using a Preset

From "Select a query" dropdown at the top of the page, select the preset report that you would like to run. This list will include both CIPP built-in reports along with any custom reports that you may create. Once you select the report, click the "Run" button to the right. CIPP will then fetch the report from Graph for the selected tenant in the [tenant-select.md](../../shared-features/menu-bar/tenant-select.md "mention") at the top of the page.&#x20;

### Running a Custom Query

If what you are looking for is not one of the preset queries, click the "Edit Query" button to the right. This will open a flyout that will allow you to customize the Graph API request you'd like to make. You can optionally select a preset query to use as a starting point which will prepopulate the query settings from the preset.

{% stepper %}
{% step %}
#### (Optional) Select Preset

Select a preset from the dropdown to populate the settings from the preset as a starting point
{% endstep %}

{% step %}
#### Enter Graph Endpoint

For the data you want to review, enter the Graph API endpoint. For example, if your report is based on user data, you would enter `users`.
{% endstep %}

{% step %}
#### Select Options

There are several options below on how to return data from the selected endpoint. These are all options included with Graph API so refer to their documentation or ask questions in Discord or of support if you're unsure.
{% endstep %}

{% step %}
#### Run

Clicking "Apply Filter" will tell CIPP to go fetch the data from the Graph API. The query window will close, and your data will display once returned.
{% endstep %}
{% endstepper %}

### Custom Presets

CIPP gives you the ability to create, edit, and share preset queries. From the Edit Query window, you have the options presented to you at the bottom of the window to "Save Preset", "Delete Preset", and "Import/Export. "Save Preset" will also act as the save button when editing a preset.

The "Import/Export" button will open up a JSON editor. If you have a preset selected, the JSON will be present for you to copy and share. If someone shares JSON with you, paste it here and CIPP will import it to your custom presets.

Setting the "Share Preset" to enabled will make that preset available for other users in your CIPP instance.

### Reviewing Query Output

By default, CIPP will output the query results as a table. This table comes with all the standard  [table-features.md](../../shared-features/table-features.md "mention"), including exporting as PDF or CSV. If you would like to review the data in JSON format, click the "View JSON" button in the top right. Click "View Table" to return to the table view.

### Scheduling Reports

Graph Explorer has the option for you to schedule the output of a query. From the "Edit Query" window, click "Schedule Report". This will open up a new window that will let you set up how you want the schedule to run. Pick the notification option (PSA, Email, Webhook), set a reference description for logging, and then choose "Scheduled Task" and the appropriate options.

***

{% include "../../../.gitbook/includes/feature-request.md" %}
