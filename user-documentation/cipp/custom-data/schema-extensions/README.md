# Schema Extensions

[Schema extensions](https://learn.microsoft.com/en-us/graph/extensibility-overview?tabs=http#schema-extensions) allow you to add custom properties to Microsoft Entra directory objects.

* Schema extensions can only be Deprecated once they are set to Available.
* Properties cannot be deleted once they are created.
* There is a limit of 100 extension values per resource instance (directory objects only)
* There is a limit of 5 total schema extensions.

### Actions

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}

### Table Details

| Column      | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| ID          | The calculated ID of the extension                               |
| Status      |                                                                  |
| Description | The descirption set on the                                       |
| Target Type |                                                                  |
| Properties  | Opens a new table with the properties configured for the schema. |

### Per-Row Actions

| Action            | Description                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------- |
| Add Property      | Opens a modal to add a property name and type to the schema                               |
| Set to Available  | For In Development schemas, this will set the schema to Available status                  |
| Set to Deprecated | For Available schemas, this will set the schema to Deprecated                             |
| Delete Schema     | For Deprecated schemas, this will allow you to delete the schema from your CIPP instance. |



***

{% include "../../../../.gitbook/includes/feature-request.md" %}
