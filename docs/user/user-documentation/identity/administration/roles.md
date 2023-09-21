---
description: Explore and review members for M365 roles
---

# Roles

### Overview

The Roles page provides a comprehensive list of all Microsoft 365 roles such as Billing Administrator, Global Administrator, etc. It offers the ability to view members associated with each role. This capability promotes efficiency and transparency in managing role assignments.

### Details

The Roles page presents each role in a structured table, including the following details:

#### Fields

<table><thead><tr><th width="209">Field</th><th>Description</th></tr></thead><tbody><tr><td>Role Name</td><td>The official name of the role.</td></tr><tr><td>Description</td><td>A brief summary of the role.</td></tr><tr><td>Members</td><td>A list of members assigned to the role.</td></tr></tbody></table>

### Actions and Features

The Roles page offers various actions and features to enhance user experience and functionality:

<table><thead><tr><th width="206">Action / Feature</th><th>Description</th></tr></thead><tbody><tr><td>View Members</td><td>Enables viewing of members associated with a specific role. Clicking on the 'View' button under the 'Members' column opens a sidebar displaying the members of that role.</td></tr><tr><td>Filter Roles</td><td>Provides the ability to filter roles with or without members.</td></tr><tr><td>Export</td><td>Supports exporting of role information to CSV and PDF formats.</td></tr></tbody></table>

### Considerations

While navigating the Roles page, please consider the following:

1. **Tenant Selection**: This page does not yet support the "All Tenants" overview. Please use the tenant selector to view roles specific to a selected tenant.
2. **Scope of Roles**: This page displays Microsoft 365 admin roles only. Exchange, Azure IAM, and Pervue rights are outside the scope of this area.
3. **Role Members**: Only roles with assigned members are displayed.

### API Calls

The `ListRoles` API is responsible for fetching the list of M365 roles along with their associated members for the current tenant.

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListRoles" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

We value your feedback and ideas. If you have any feature requests or ideas to improve the Roles page, please raise them on our [GitHub issues page](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+).
