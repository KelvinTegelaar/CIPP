# Filters

## Advanced Table Filtering

Harness the power of CIPPs filtering capabilities to effortlessly sift through data. Whether you're searching for a specific user or refining a larger dataset, this guide will walk you through the basic and advanced filtering techniques at your disposal.

***

### 1. Overview

There are two main filtering methods:

* **Basic Filtering**: Search for a keyword or phrase across all properties.
* **Advanced Filtering**: Apply specific conditions to filter data based on individual properties.

***

### 2. Basic Filtering

#### How to:

Simply type in the keyword or phrase you wish to search in the textbox.

#### Example:

To find all users with the name "Megan", type `Megan.`

***

### 3. Advanced Filtering

#### Syntax:

To utilize advanced filtering, start with the `Complex:` prefix. The general structure is:

```vbnet
Complex: [PROPERTY] [OPERATOR] [VALUE]; ...
```

#### Operators:

<table data-full-width="false"><thead><tr><th>Operator</th><th>Description</th><th>Example Input</th><th data-hidden>Example Matched Entry</th></tr></thead><tbody><tr><td>eq</td><td>Equals</td><td>Complex: department eq Marketing</td><td><code>{ "displayName": "Megan Bowen", "department": "Marketing" }</code></td></tr><tr><td>ne</td><td>Not equals</td><td>Complex: city ne Pittsburgh</td><td><code>{ "displayName": "John Doe", "city": "New York" }</code></td></tr><tr><td>like</td><td>Contains the value</td><td>Complex: displayName like Megan</td><td><code>{ "displayName": "Megan Bowen" }</code></td></tr><tr><td>notlike</td><td>Does not contain the value</td><td>Complex: userType notlike Guest</td><td><code>{ "displayName": "Megan Bowen", "userType": "Member" }</code></td></tr><tr><td>gt</td><td>Greater than (for numerical values)</td><td>Complex: createdDateTime gt 2023-01-01</td><td><code>{ "displayName": "Megan Bowen", "createdDateTime": "2023-07-06T18:01:16Z" }</code></td></tr><tr><td>lt</td><td>Less than (for numerical values)</td><td>Complex: postalCode lt 20000</td><td><code>{ "displayName": "Megan Bowen", "postalCode": "15212" }</code></td></tr></tbody></table>

* **PROPERTY**: Indicate the property name you wish to filter on. You can find the possible properties by using the column selector button.
* **OPERATOR**: Use the operation you want to perform from the table above.
* **VALUE**: Specify the value you want to compare the property against.

You can combine multiple conditions with a semicolon (`;`).

#### Example 1:

To find users located in Pittsburgh who are members, use:

```vbnet
Complex: city like Pittsburgh; userType eq Member
```

#### Example 2:

To identify users who are not enabled, are members, and have a `userPrincipalName` containing the word "diego", you can chain the filters as:

```vbnet
Complex: accountEnabled eq false; userType eq Member; userPrincipalName like diego
```

### 4. Graph Filtering

Select pages support Graph Filtering, which allow you to directly use a Graph filter Query.&#x20;

#### Syntax:

To utilize Graph filtering, start with the Graph`:` prefix. The general structure is:

```vbnet
Graph: [GRAPH QUERY STATEMENT]
```

A Graph query can not be combined with other filters, and requires the query to be exactly as you would use it in the `$filter` parameter in a graph request. For example to filter on users with an assigned license, you enter:

```
Graph: assignedLicenses/$count ne 0
```

For more information refer to the Microsoft documentation about Filtering [here](https://learn.microsoft.com/en-us/graph/filter-query-parameter?tabs=http)
