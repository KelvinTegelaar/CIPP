# Table Features

{% hint style="info" %}
With the launch of CIPP v7, there are now new, more powerful tables at your disposal.
{% endhint %}

### Top Row Features

| Feature              | Description                                                                                                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔃 Refresh data      | This action will refresh the column data                                                                                                                                                                                                                                    |
| 🔍 Search input text | This window will perform a search on table contents for the value you type into the box. Clicking on the magnifying glass will allow you to change from the default contains search method to fuzzy or starts with.                                                         |
| Filters              | This will present options for preset filters for the table you are viewing. All tables have an option to "Reset all filters"                                                                                                                                                |
| Columns              | This will allow you to select which columns are visible on the page. You will also be presented with the options to "Reset to preferred columns", "Save as preferred columns", and "Delete preferred columns". Preferred columns are saved as part of your browser cookies. |
| Export               | This will present you with different options on how to export the table data: CSV, PDF, API response (JSON)                                                                                                                                                                 |
| 📈 Queue Status      | When present, this button will show you the status of the background tasks for longer-running queries. When complete, the queue tracking will refresh the results table.                                                                                                    |

### Column Features

| Feature                           | Description                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Clear sort                        | This will clear any sorting set on this column                                              |
| Sort by \<column name> ascending  | This will sort the column by ascending values (smallest to largest, 0 to 9, and/or A to Z)  |
| Sort by \<column name> descending | This will sort the column by descending values (largest to smallest, 9 to 0, and/or Z to A) |
| Clear filter                      | Clears any filters placed on the column                                                     |
| Filter by \<column name>          | This will present additional filtering options (See below)                                  |
| Pin to left                       |                                                                                             |
| Pin to right                      |                                                                                             |
| Unpin                             |                                                                                             |
| Hide \<column name> column        |                                                                                             |
| Show all columns                  |                                                                                             |

### Column Filtering Options

| Filter                   | Description                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fuzzy                    | Will return all results where the value is similar to what is input                                                                                    |
| Contains                 | Will return all results where the value contains the input                                                                                             |
| Starts With              | Will return all results where the value starts with the input                                                                                          |
| Ends With                | Will return all results where the value ends with the input                                                                                            |
| Equals                   | Will return all results where the value exactly matches the input                                                                                      |
| Not Equals               | Will return all results where the value does not match the input                                                                                       |
| Between                  | Will return all results where the value is in between the inputs. This will not include the inputs in the returned results                             |
| Between Inclusive        | Will return all results where the value is in between the inputs. This will include the inputs in the returned results                                 |
| Greater Than             | Will return all results where the value is greater than the input                                                                                      |
| Greater Than Or Equal To | Will return all results where the value is greater than or equal to the input                                                                          |
| Less Than                | Will return all results where the value is less than the input                                                                                         |
| Less Than OR Equal To    | Will return all results where the value is less than or equal to the input                                                                             |
| Empty                    | Will return all results where there is no value for this column                                                                                        |
| Not Empty                | Will return all results where there is a value for this column                                                                                         |
| Not Contains             | Will return all results where the value does not contain the input                                                                                     |
| Regex                    | Will return all results that match the Regex search pattern                                                                                            |
| Boolean (not in list)    | Boolean columns will have a special drop down shown in the filters text entry area that will allow you to filter on `Yes` for true and `No` for false. |

### Value Display

Some values have special display settings for ease of reading.

| Value Type | Description                                                                                                                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boolean    | Columns that display information in a Boolean will utilize a graphical representation instead of `true` and `false`. The value for `true` will display as a check mark. The value for `false` will display as a circle with an X in it. |
| Table      | Columns that return data in a complex list will an orange button with the number of items in the list. Clicking the button will open a modal that will display a second table with the contents of that list.                           |

### Actions

Most tables also include an "Actions" column that will be visible to the right of the table. Clicking the ellipses will open the menu for available per-row actions that can be taken for this table. In many tables, selecting multiple check boxes next to rows will enable a `Bulk Actions` button for you to take the same action on every row selected.

***

{% include "../../.gitbook/includes/feature-request.md" %}
