---
description: List applied standards to your Microsoft 365 CSP tenants.
---

# List Standards

## **Page Functionality**

This page displays all applied standards in a table format for each tenant. The output is available as a JSON object for each tenant.

{% hint style="warning" %}
**Understanding Standards**

* Standards are listed by their **API Names**. For example:
  * Display Name: "Set Sharing Level for Default Calendar"
  * API Name: `calDefault`
* **Developer Note:** For a full list of current and future standards in JSON format, reference the [standards.json](https://github.com/KelvinTegelaar/CIPP/blob/main/src/data/standards.json) file or review the category-specific subpages below.
{% endhint %}

## Meet the Standards

More details about the currently available standards can be found on the [List Standards](./) page and it's respective sub pages (listed in the standard categories below) based on their categories. The tables contain the following columns:

* **Standard Name**: The name of the standard.
* **Description**: A brief description of the standard. This will help you understand what the standard does.
* **Recommended By**: The organization that recommends the standard. This can be CIS, CIPP, or any other organization.
* **APIName**: The API name of the standard. Useful for identifying the standard in the logbook.
* **PowerShell Equivalent**: The PowerShell command that can be used to apply the standard.

## **Standard Categories**

Standards are grouped into pages within the following categories:

* [**Global Standards:**](global-standards.md) Applied across all tenants to manage organization-wide configurations.
* [**Exchange Standards**](exchange-standards.md)**:** Email-related settings such as spam protection and message handling.
* [**Defender Standards:**](defender-standards.md) Security measures to protect against phishing, malware, and other threats.
* [**Intune Standards:**](intune-standards.md) Device and application management policies for a secure Intune environment.
* [**SharePoint Standards:**](sharepoint-standards.md) SharePoint and OneDrive configuration incl. sharing and retention policies.
* [**Teams Standards:**](teams-standards.md) Collaboration-related settings, i.e.: meeting policies and external file sharing.

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
