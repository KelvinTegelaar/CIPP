---
hidden: true
---

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

To utilize advanced filtering, start with the `Complex:` prefix (case sensitive). The general structure is:

```vbnet
Complex: [PROPERTY] [OPERATOR] [VALUE]; ...
```

#### Operators:

| Operator | Description                         | Example Input                          | Example Matched Entry                                                         |
| -------- | ----------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| eq       | Equals                              | Complex: department eq Marketing       | `{ "displayName": "Megan Bowen", "department": "Marketing" }`                 |
| ne       | Not equals                          | Complex: city ne Pittsburgh            | `{ "displayName": "John Doe", "city": "New York" }`                           |
| like     | Contains the value                  | Complex: displayName like Megan        | `{ "displayName": "Megan Bowen" }`                                            |
| notlike  | Does not contain the value          | Complex: userType notlike Guest        | `{ "displayName": "Megan Bowen", "userType": "Member" }`                      |
| gt       | Greater than (for numerical values) | Complex: createdDateTime gt 2023-01-01 | `{ "displayName": "Megan Bowen", "createdDateTime": "2023-07-06T18:01:16Z" }` |
| lt       | Less than (for numerical values)    | Complex: postalCode lt 20000           | `{ "displayName": "Megan Bowen", "postalCode": "15212" }`                     |

* **PROPERTY**: Indicate the property name you wish to filter on. You can find the possible properties by using the column selector button.
* **OPERATOR**: Use the operation you want to perform from the table above.
* **VALUE**: Specify the value you want to compare the property against.

You can combine multiple conditions with a semicolon (`;`) or with (`or`).\
The (`;`) separator operates as an `AND`, while the (`or`) operates as an `OR`.

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

#### Example 3:

To find login enabled users where per user MFA is enabled or enforced, use:

```vbnet
Complex: accountEnabled eq true; PerUser eq enforced or PerUser eq enabled
```

### 4. Graph Filtering

Select pages support Graph Filtering, which allow you to directly use a Graph filter Query.

#### Syntax:

To utilize Graph filtering, start with the `Graph:` prefix. The general structure is:

```vbnet
Graph: [GRAPH QUERY STATEMENT]
```

A Graph query can not be combined with other filters, and requires the query to be exactly as you would use it in the `$filter` parameter in a graph request. For example to filter on users with an assigned license, you enter:

```vbnet
Graph: assignedLicenses/$count ne 0
```

For more information refer to the Microsoft documentation about Filtering [here](https://learn.microsoft.com/en-us/graph/filter-query-parameter?tabs=http)

### 5. Alert rules Filter

Alerts can be filtered using the same method as Complex filtering, allowing the same rules and operators except chaining statements together. For example to filter on logs that only have the userId 123:

```vbnet
UserId eq 123
```



{% include "../../.gitbook/includes/feature-request.md" %}
