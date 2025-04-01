---
description: Components of a Best Practice Analyzer Report Template
hidden: true
---

# Custom Report Components

### **Basics of the Report**

**a. `name`**

* **Description**: The title or identifier of the report.
* **Purpose**: Helps users recognize the purpose of the report.
*   **Example**:

    ```json
    "name": "My Custom SharePoint Report"
    ```

**b. `style`**

* **Description**: Defines how the report data will be displayed.
* **Options**:
  * **Table**: Presents data in a tabular layout.
  * **Tenant**: A single-page overview for individual tenants.
*   **Example**:

    ```json
    "style": "Table"
    ```

***

### **Data Definition (Fields Section)**

**a. `name`**

* **Description**: Identifies each category or set of data within the report.
* **Purpose**: Organizes the data into logical sections.
*   **Example**:

    ```json
    "name": "SharepointSettings"
    ```

**b. `API`**

* **Description**: Specifies the API or data source type.
* **Options**:
  * **Graph**: Microsoft Graph API, used for Microsoft 365 services.
  * **Exchange**: Commands specific to Microsoft Exchange.
  * **CIPPFunction**: Custom APIs or application-specific functions.
*   **Example**:

    ```json
    "API": "Graph"
    ```

**c. `URL` or `command`**

* **Description**: Indicates the endpoint (Graph or CIPPFunction) or PowerShell command (Exchange) to fetch the data.
* **Example**:
  *   **Graph**:

      ```json
      "URL": "https://graph.microsoft.com/beta/admin/sharepoint/settings"
      ```
  *   **Exchange**:

      ```json
      "command": "Get-MailboxDetail"
      ```

**d. `Parameters`**

* **Description**: Additional arguments or settings required for the API call.
*   **Example**:

    ```json
    "Parameters": {"asApp": "True"}
    ```

**e. `ExtractFields`**

* **Description**: Lists the attributes to extract from the returned data.
* **Purpose**: Specifies what information to pull from the API response.
*   **Example**:

    ```json
    "ExtractFields": ["sharingCapability", "isMacSyncAppEnabled"]
    ```

**f. `StoreAs`**

* **Description**: Determines how the fetched data is stored.
* **Options**:
  * **JSON**: For structured data.
  * **bool**: For binary (true/false) values.
*   **Example**:

    ```json
    "StoreAs": "JSON"
    ```

***

### **Frontend Definition**

**a. `FrontendFields`**

* **Description**: Describes how the extracted data will appear in the report.
* **Subfields**:
  * **`name`**: The label displayed in the report.
  * **`value`**: Reference to the extracted data’s location.
  * **`formatter`**: Defines the format for displaying the data.
    * **Options for `formatter`**:
      * **`string`**: Displays as plain text.
      * **`bool`**: Displays true/false values.
      * **`warnBool`**: Highlights boolean values with warnings.
      * **`reverseBool`**: Inverts boolean values for display.
      * **`table`**: Displays data in a table format.
      * **`number`**: Presents numerical values.
*   **Example**:

    ```json
    "FrontendFields": [{
        "name": "Sharing Capability",
        "value": "SharepointSettings.sharingCapability",
        "formatter": "string"
    }]
    ```

**b. `where` (Optional)**

* **Description**: A conditional filter that determines which data is processed or displayed.
* **Purpose**: Enables precise control over data inclusion using PowerShell-style filters.
*   **Example**:

    ```json
    "where": "$_.definition -like '*WebSessionIdleTimeout*'"
    ```

**c. `desc` (Tenant View Only)**

* **Description**: Adds a description displayed at the bottom of a tenant overview card.
* **Purpose**: Provides context or additional information about the data shown.
*   **Example**:

    ```json
    "desc": "This shows you how many users are in your tenant."
    ```

***

### **Example Report Template**

Here’s a complete example combining all components:

```json
{
  "name": "Custom SharePoint Report",
  "style": "Table",
  "fields": [{
      "name": "SharepointSettings",
      "API": "Graph",
      "URL": "https://graph.microsoft.com/beta/admin/sharepoint/settings",
      "Parameters": {"asApp": "True"},
      "ExtractFields": ["sharingCapability", "isMacSyncAppEnabled"],
      "StoreAs": "JSON",
      "FrontendFields": [{
          "name": "Sharing Capability",
          "value": "SharepointSettings.sharingCapability",
          "formatter": "string"
      }]
  }]
}
```

This structure ensures clear, actionable insights while offering flexibility for customization. Let me know if you'd like further explanation or a specific example tailored to your needs!

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
