---
description: Streamline group creation across multiple tenants in Microsoft 365
---

# Deploy Group Templates

### Overview

The Deploy Group Templates page provides an interface for creating and deploying group templates in Microsoft 365. This feature offers an easy and efficient way to manage group creation, allowing users to select from a list of pre-defined templates and apply them across chosen tenants.

This document provides a step-by-step guide on how to navigate and utilize the Deploy Group Templates page.

### Components

The Deploy Group Templates page comprises three main steps:

1. **Tenant Choice**
2. **Select Options**
3. **Review and Confirm**

#### Step 1: Tenant Choice

In this step, you choose the tenants for which you want to create the group. Each tenant has a `displayName` and `defaultDomainName`.

#### Step 2: Select Options

In this step, you can choose to apply one of the previously created templates or manually enter the group information. If you opt for a template, select it from the dropdown menu. The page will automatically populate the rest of the fields based on the chosen template.

However, you have the flexibility to adjust the options as needed:

* **Group Type**: Select the type of group. Options include Dynamic Group, Security Group, Distribution Group, Azure Role Group, and Mail Enabled Security Group.
* **Group Display Name**: Enter the name that will be displayed for the group.
* **Group Description**: Provide a brief description of the group. This field is optional.
* **Group Username**: Specify the username for the group.
* **Let people outside the organization email the group**: Check this box if you want the group to be able to receive emails from outside the organization. This option is available only for Distribution Groups.
* **Membership Rule**: If you chose Dynamic Group as the group type, you can specify the rule for membership here.

Remember, the options presented depend on the Group Type selected. For instance, the "Membership Rule" field only appears if you select "Dynamic Group" as the Group Type.

For more details on these settings, please refer to the [Group Templates page](group-templates.md).

#### Step 3: Review and Confirm

In this step, you review your input and confirm to apply. The application sends a POST request to the `AddGroup` endpoint listed below with your input as values.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListGroupTemplates" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/AddGroup" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

We value your feedback and ideas. If you have any feature requests or ideas to improve the Deploy Group Templates page, please raise them on our [GitHub issues page](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+).
