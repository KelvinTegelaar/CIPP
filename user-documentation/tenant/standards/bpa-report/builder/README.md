# Custom Reports

CIPP's custom reporting functionality empowers advanced users to create tailored reports for any best practice scenarios you can imagine. While CIPP includes multiple default reports that are rapidly expanding, custom reports let you take control of exactly what data is presented. By defining your own templates, you can specify APIs, commands, and display styles to meet unique organizational needs.

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

{% stepper %}
{% step %}
**Setting the Foundation**

Every report begins with a title and presentation style. Enter the Report Name and select your preferred Layout Mode.
{% endstep %}

{% step %}
**Adding Fields**

Define the data points to fetch from an API, specifying the endpoint, parameters, and how the data should be presented

For Exchange, define commands instead of API URLs, e.g. `Get-Mailbox`

{% hint style="info" %}
Click the "+ Add Field" button to display additional fields for configuration.
{% endhint %}
{% endstep %}

{% step %}
### Save

Click the "Save Report" button to write your template to your BPA reports.
{% endstep %}
{% endstepper %}

### Report Layouts

1. Table: Report will be displayed with your selected data appear in columns
2. Block: Report will be displayed with your selected data appear in a block (or card) fashion

### Field Options

Regardless of the type of report layout you choose, the fields will have the following options which will present you with different fields to populate to generate the field's output.

1. "Use information CIPP has previously gathered in another report" toggle: Toggle this to on to present you with options to populate the database name and card content from information from another report.
2. Data Source:&#x20;
   1. Graph: Use to enter a Graph Endpoint and PowerShell sytnax filter
   2. Exchange Online PowerShell: Use to enter the Exchange Command, PowerShell syntax Where object, and the data from the response that should be stored
   3. CIPP Function: Use of any CIPP Get- command to populate data for the report
3. Store this data as
   1. String: used when extracting a single string value from the data source
   2. JSON: used for storing more complex objects
   3. Boolean: used for true/false reporting

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
