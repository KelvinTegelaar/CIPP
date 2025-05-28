# Table Features

{% hint style="info" %}
With the launch of CIPP v7, there are now new, more powerful tables at your disposal.
{% endhint %}

### Top Row Features

| Feature                  | Description                                                                                                                                                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔃 Refresh data          | This action will refresh the column data                                                                                                                                                                                                                                    |
| 🔍 Search                | This window will perform a search on table contents for the value you type into the box. Clicking on the magnifying glass will allow you to change from the default contains search method to fuzzy or starts with.                                                         |
| Preset Filters           | This will present options for preset filters for the table you are viewing. All tables have an option to "Reset all filters"                                                                                                                                                |
| Show/Hide Filters        | This will optionally display the column filters just below the column headers for more granular filtering than the fuzzy search                                                                                                                                             |
| Toggle Column Visibility | This will allow you to select which columns are visible on the page. You will also be presented with the options to "Reset to preferred columns", "Save as preferred columns", and "Delete preferred columns". Preferred columns are saved as part of your browser cookies. |
| Export to PDF            | This button will export the visible columns in PDF format                                                                                                                                                                                                                   |
| Export to CSV            | This button will export the visible columns in CSV format                                                                                                                                                                                                                   |
| View API Response        | This button will open a flyout window where you can view the API response received from the CIPP backend                                                                                                                                                                    |

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

| Filter                   | Description                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Fuzzy                    | Will return all results where the value is similar to what is input                                                        |
| Contains                 | Will return all results where the value contains the input                                                                 |
| Not Contains             | Will return all results where the value does not contain the input                                                         |
| Starts With              | Will return all results where the value starts with the input                                                              |
| Ends With                | Will return all results where the value ends with the input                                                                |
| Equals                   | Will return all results where the value exactly matches the input                                                          |
| Not Equals               | Will return all results where the value does not match the input                                                           |
| Between                  | Will return all results where the value is in between the inputs. This will not include the inputs in the returned results |
| Between Inclusive        | Will return all results where the value is in between the inputs. This will include the inputs in the returned results     |
| Greater Than             | Will return all results where the value is greater than the input                                                          |
| Greater Than Or Equal To | Will return all results where the value is greater than or equal to the input                                              |
| Less Than                | Will return all results where the value is less than the input                                                             |
| Less Than OR Equal To    | Will return all results where the value is less than or equal to the input                                                 |
| Empty                    | Will return all results where there is no value for this column                                                            |
| Not Empty                | Will return all results where there is a value for this column                                                             |

### Value Display

Some values have special display settings for ease of reading.

| Value Type | Description                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Boolean    | Colunns that display information in a Boolean will utilize a graphical representation instead of `true`and `false` . The value for `true`will display as a check mark. The value for `false`will display as a circle with an X in it. |

### Actions

Every table also includes an "Actions" column that will always be visible to the right of the table. Clicking the elipses will open the menu for available per-row actions that can be taken for this table.

***

{% include "../../.gitbook/includes/feature-request.md" %}
