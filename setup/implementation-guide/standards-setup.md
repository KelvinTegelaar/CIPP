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

{% embed url="https://app.guidde.com/share/playbooks/evB2vKUYjj1CAPCm6dQQAY?origin=IEPB08VSavefFaCa9OSp3Y87aGu1" %}

## **Accessing Standards**

1. Navigate to **Tenant Administration > Standards**.
2. Click **Edit Standards** to manage or add new standards.
   * Example: Add an **"All Tenants"** standard to apply settings across all tenants.

![Click 'Edit Standards'](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2F9PtA6nkRnRJKCAyvwoUvwq_doc.png?alt=media\&token=ce2be33a-dfe8-4208-b3ca-d55cbb5cb66a)

## **Reporting Options**

Each standard offers three options:

* **Report**: Logs the current configuration in a Best Practices Report.
* **Alert**: Sends notifications (via ticket, email, or webhook).
* **Remediate**: Automatically applies the desired configuration.

_Note_: Turning off **Remediate** prevents future fixes but doesn’t undo changes already applied.

![Reporting](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2Fro5DLkaAP3uvXCiV9VqS6w_doc.png?alt=media\&token=01535725-2019-4e77-8707-83f6c4844715)

## **Understanding Impact**

* Each standard includes:
  * A **description** of what it does.
  * An **impact label** (Low, Medium, High) to indicate user impact.
* Review these details to ensure changes align with your needs.

![Standards impact](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2FumFDArrjyZLHEdfwTPyWgN_doc.png?alt=media\&token=9485eb28-0148-4d40-94bf-84951dcdba38)

## Customizing Standards

### Input Fields

* Some standards require settings, like custom text fields or dropdown selections.
* Enter the required values to customize the standard.

![Standards input](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2F4sfQ1tpUosgrhMZ8fLXeQx_doc.png?alt=media\&token=918741b5-07b6-4677-9060-c52afe137791)

### Categories

* Standards are grouped by categories, like security, compliance, or usability.
* There are [over 60 standards](../../user-documentation/tenant/standards/list-standards/), with more added regularly.

![Catagories](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2Fp8vzXiAHDU9mroKFtMhJPr_doc.png?alt=media\&token=39f2ccea-d611-43d4-9e23-59ac7821273c)

## Deploying Templates

* Use templates for consistent configurations across clients.
* Examples include templates for **Intune**, **Exchange**, and **Conditional Access**

![Templates Standard Deployment](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2Fwp8XgyP3RwzKJXEym97Tb9_doc.png?alt=media\&token=25aaa44a-cb51-42a3-b6dd-c71d739a611f)

### Template Reapplication

* Templates reapply every **3 hours**, maintaining the desired state.
* If changes are made by admins, they are automatically reverted to match the template.
* Update a template once, and all linked tenants will receive the changes.

![Deployment of a Template Standard](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2Fd2vyBpSr5h75z5E4k4NikT_doc.png?alt=media\&token=033b29e7-9bb3-4b41-a30e-bd5d5facb7e0)

### **Run Standards Manually**

* Use the **Run Now** option at the top of the Standards page.
* Apply standards immediately to:
  * A specific tenant.
  * All tenants in one go.

![Run now](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2FeMGbXx2ph7iQ3U25hyfv2y_doc.png?alt=media\&token=f547ab85-d62f-46ac-9de3-d55e94358d26)

### **Excluding Tenants**

* Exclude specific tenants from **All Tenants** standards to:
  * Prevent global standards from applying.
  * Allow custom standards for that tenant only.

![Click 'Enabling this feature excludes this tenant from any top-level 'All Tenants' standard. This means that only the standards you explicitly set for this tenant will be applied. Standards previously...'](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2FpQex4jGu9BfWANuECiTbjW_doc.png?alt=media\&token=d5fd4762-604a-420f-ae9b-3a08eeffd48c)

#### **Key Takeaways**

* Standards automatically reapply settings every **3 hours** for consistency.
* Categories and templates simplify management across multiple tenants.
* Customization and manual runs give you flexibility to meet tenant-specific needs.

By following these steps, you’ll ensure your M365 tenants remain secure, consistent, and compliant with minimal manual effort.
