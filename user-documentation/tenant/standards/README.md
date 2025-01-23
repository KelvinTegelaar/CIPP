---
description: >-
  Standards ensures consistent configuration across your Microsoft 365 tenants
  by reapplying baseline settings every three hours. This prevents unauthorized
  changes and maintains security.
---

# Standards

{% hint style="danger" %}
### CIPP v7 Standards Updates

As of the update to v7 of CIPP, standards now operate via templates. Where previously, standards were either configured via the AllTenants "Edit Standards" page or an individual tenants "Edit Standards" page, multiple templates can be created to provide you with a more granular standards experience. Templates can be assigned to "AllTenants", "AllTenants" with excluded tenants, or just specific list of tenants.

If you are upgrading to v7 from a prior version of CIPP, you'll need to complete a one-time conversion of your existing standards by clicking the "Convert Standards" button at the top of the page. These standards will still not run on a schedule until you edit each template to your choosing and then toggling off the "Do not run on schedule" option.
{% endhint %}

## **Overview**

Standards in CIPP ensure consistent configurations across your Microsoft 365 tenants by reapplying baseline settings every **three hours**. This automatic enforcement prevents unauthorized changes and helps maintain security.

{% hint style="info" %}
**Developer Note:** For a full list of current and future standards in JSON format, reference the [standards.json](https://github.com/KelvinTegelaar/CIPP/blob/main/src/data/standards.json) file or review the category-specific subpages below.
{% endhint %}

{% hint style="warning" %}
**Note**: By default, standards aren't applied to any tenants upon setup of CIPP. You must manually configure and enable them. Apply standards with a clear understanding of their effects, detailed in the video and walkthrough on[ this page](../../../setup/implementation-guide/).
{% endhint %}

### **Standards Categories**

For ease of reference, standards are grouped into pages within the following categories. These categories match the Category label on the standard selection page.

| Category                                                       | Description                                                                       |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [Global Standards](list-standards/global-standards.md)         | Applied across all tenants to manage organization-wide configurations.            |
| [Exchange Standards](list-standards/exchange-standards.md)     | Email-related settings such as spam protection and message handling.              |
| [Defender Standards](list-standards/defender-standards.md)     | Security measures to protect against phishing, malware, and other threats.        |
| [Intune Standards](list-standards/intune-standards.md)         | Device and application management policies for a secure Intune environment.       |
| [SharePoint Standards](list-standards/sharepoint-standards.md) | SharePoint and OneDrive configuration incl. sharing and retention policies.       |
| [Teams Standards](list-standards/teams-standards.md)           | Collaboration-related settings, i.e.: meeting policies and external file sharing. |

### **Table Columns**

Each of the separate standards category pages have a table listing of their respective standards that includes the following columns:

| Column                | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| Standard Name         | The name of the standard.                                     |
| Description           | A brief explanation of what the standard does.                |
| Recommended By        | The organization recommending the standard (e.g., CIS, CIPP). |
| API Name              | Useful for logs and automation.                               |
| PowerShell Equivalent | The PowerShell command used to apply the standard manually.   |

{% hint style="info" %}
**Sorting:** Standards are listed by their **API Names**. For example:

* Display Name: "Set Sharing Level for Default Calendar"
* API Name: `calDefault`
{% endhint %}

### Standards Actions:

| Action    | Description                                        |
| --------- | -------------------------------------------------- |
| Report    | Logs the current configuration.                    |
| Alert     | Sends notifications via ticket, email, or webhook. |
| Remediate | Applies the configuration to the tenant.           |

**Note**: Disabling the "Remediate" option prevents future enforcement but does not undo previously applied changes.

### **Impact Levels**

Each standard is labeled based on the level of change it introduces and its impact on users:

| Impact | Description                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------- |
| Low    | Minimal or no user-facing effects.                                                              |
| Medium | May require some communication with users to prepare them for changes.                          |
| High   | Significant changes that could affect daily workflows; coordinate with clients before applying. |

{% hint style="warning" %}
### Important Considerations

* **Companion Policies:** Some standards rely on additional policies in tools like **Microsoft Intune** to be fully effective. Ensure all required companion policies are configured to achieve the desired results.
* **Deselecting Standards:** Deselecting a standard prevents it from being enforced in future cycles, but it does not undo its current configuration.
  * **Example:** If you deselect `"Enable FIDO2 capabilities`," the standard will stop enforcing this policy. However, if FIDO2 was already enabled, it will remain enabled.
* **Precedence of Standards:** Standards that are updated via multiple templates for a tenant will only apply the settings from the most recently created template.
* **Application Cadence:** Standards reapply **every three hours** by default. If a setting changes outside of the standard, it will be overridden by the value specified in the standard during the next reapplication cycle.
{% endhint %}

{% hint style="info" %}
Plans exist to implement more standardized options and settings, along with an alerting system supporting RMM systems, webhooks or, e-mail.
{% endhint %}

***

{% include "../../../.gitbook/includes/feature-request.md" %}
