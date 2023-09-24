# Custom Report options

#### **1. Basics of the Report**:

**a. `name`:**

* **Description**: The title or name of the report.
* **Example**: `"name": "My Custom SharePoint Report"`

**b. `style`:**

* **Description**: Specifies the layout or presentation style of the report.
* **Options**:
  * **Table**: Data presented in a tabular format.
  * **Tenant**: A single page overview that gives you the ability to get the overview for a single tenant.
* **Example**: `"style": "Table"`

#### **2. Data Definition (`Fields` Section)**:

**a. `name`:**

* **Description**: Identifier for each set or category of data.
* **Example**: `"name": "SharepointSettings"`

**b. `API`:**

* **Description**: Defines the source or type of API to fetch the data.
* **Options**:
  * **Graph**: Refers to Microsoft Graph, typically used for Microsoft 365 services data.
  * **Exchange**: For data related to Microsoft Exchange.
  * **CIPPFunction**: Custom functions or API specific to the application.
* **Example**: `"API": "Graph"`

**c. `URL` or `command`:**

* **Description**: The endpoint (for Graph and CIPPFunction) or command (for Exchange) to fetch the data.
* **Example (Graph)**: `"URL": "https://graph.microsoft.com/beta/admin/sharepoint/settings"`
* **Example (Exchange)**: `"command": "Get-MailboxDetail"`

**d. `Parameters`:**

* **Description**: Additional settings or parameters required for the API call.
* **Example**: `"Parameters": {"asApp": "True"}`

**e. `ExtractFields`:**

* **Description**: Lists the attributes or fields to extract from the returned data.
* **Example**: `"ExtractFields": ["sharingCapability", "isMacSyncAppEnabled"]`

**f. `StoreAs`:**

* **Description**: The format in which to store the fetched data.
* **Options**:
  * **JSON**: For structured data.
  * **bool**: For binary true/false values.
* **Example**: `"StoreAs": "JSON"`

**g. `FrontendFields`:**

* **Description**: Describes how each data attribute will be displayed in the report.
  * **name**: Label for the data in the report.
  * **value**: Reference to the data's location or attribute.
  * **formatter**: Specifies how the data will be formatted for display.
* **Options for `formatter`**:
  * **string**: Displays as plain text.
  * **bool**: Presents as "True" or "False".
  * **warnBool**: Shows boolean values with potential visual warnings.
  * **reverseBool**: Inverts the boolean value for display.
  * **table**: Represents the data in a table format.
  * **number**: Displays as a numerical value.
*   **Example**:

    ```json
    "FrontendFields": [{
        "name": "Sharing capability",
        "value": "SharepointSettings.sharingCapability",
        "formatter": "string"
    }]
    ```

**h. `where` (Optional):**

* **Description**: A conditional filter to determine which data gets displayed or processed. Use PowerShell's Where-Object Filterscript format.
* **Example**: `"where": "$_.definition -like '*WebSessionIdleTimeout*'"`

I. `desc`**`(Tenant overview only)`**\


* **Description**: A description field shown on the end of the card on the tenant overview page
* **Example**: `"This shows you how many users are in your tenant."`
