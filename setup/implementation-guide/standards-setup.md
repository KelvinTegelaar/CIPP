---
description: >-
  This guide will walk you through the process of setting up standards in CIPP.
  Follow these instructions to configure and run standards for your
  organization.
---

# Standards Setup

{% hint style="info" %}
For more information on Standards, what they are, and where to find the available ones, check out the [standards](../../user-documentation/tenant/standards/ "mention") section of the user documentation
{% endhint %}

## **Walkthrough Steps for Setting Up Standards**

***

## **Purpose**

This guide walks you through setting up **Standards** in CIPP for the first time. It focuses on applying and managing standards to maintain security and compliance across your organization.

## **Accessing Standards**

1. Navigate to **Tenant Administration > Standards**.
2. Here you'll be presented with a table of Standards templates and an action in the upper right to create new templates.

## **Reporting Options**

Each standard offers three options:

* **Report**: Logs the current configuration in a Best Practices Report.
* **Alert**: Sends you a notification via the configured method in CIPP -> Application Settings -> Notifications.
* **Remediate**: Automatically applies the desired configuration.

{% hint style="info" %}
Turning off **Remediate** prevents future fixes but doesn’t undo changes already applied
{% endhint %}

## **Understanding Impact**

* Each standard includes:
  * A **description** of what it does.
  * An **impact label** (Low, Medium, High) to indicate user impact.
* Review these details to ensure changes align with your needs.

## Customizing Standards

### Input Fields

* Some standards require settings, like custom text fields or dropdown selections.
* Enter the required values to customize the standard.

### Categories

* Standards are grouped by categories, like security, compliance, or usability.
* There are over 60 standards ([#available-standards](../../user-documentation/tenant/standards/list-standards/#available-standards "mention")), with more added regularly.

## Deploying Templates

* Use templates for consistent configurations across clients.
* Examples include templates for **Intune**, **Exchange**, and **Conditional Access**

### **Excluding Tenants**

* Exclude specific tenants from **All Tenants** standards to:
  * Prevent global standards from applying.
  * Allow custom standards for that tenant only.

### Template Reapplication

* Templates reapply every **3 hours**, maintaining the desired state.
* If changes are made by admins, they are automatically reverted to match the template.
* Update a template once, and all linked tenants will receive the changes.

### **Run Standards Manually**

* Use the **Run Template Now** options from the Actions menus.
* Apply standards immediately to:
  * A specific tenant by selecting (Currently Selected Tenant only) to match the tenant in the menu Tenant Selector.
  * All tenants in one go for all tenants in the template.

## **Key Takeaways**

* Standards automatically reapply settings every **3 hours** for consistency.
* Categories and templates simplify management across multiple tenants.
* Customization and manual runs give you flexibility to meet tenant-specific needs.

By following these steps, you’ll ensure your M365 tenants remain secure, consistent, and compliant with minimal manual effort.
