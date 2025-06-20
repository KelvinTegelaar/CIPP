---
description: >-
  Standards ensures consistent configuration across your Microsoft 365 tenants
  by reapplying baseline settings every three hours. This prevents unauthorized
  changes and maintains security.
---

# Standards

## **Overview**

Standards in CIPP ensure consistent configurations across your Microsoft 365 tenants by reapplying baseline settings every **three hours**. This automatic enforcement prevents unauthorized changes and helps maintain security.

### Actions

CIPP allows you to set standards in three different settings. Some standards can only be set to specific items, such as Intune standards which can only be "Remediated".

| Action    | Description                                                                                                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Report    | Logs the current configuration and stores this inside of the CIPP database for your standards reports or BPA reports.                                                                                           |
| Alert     | Sends you a notification via the configured method in CIPP -> Application Settings -> Notifications                                                                                                             |
| Remediate | Changes the configuration of the tenant and enables Report settings in the backend. You can optionally enable Report in addition to Remediate for visual clarity, but all Remediate Standards will also Report. |

For example, when you wish to create a report for Audit log state across all your tenants, you can create an "All Tenants" standard that has the Audit Log standard set to "Report" - This fills the CIPP database with the current setting without editing the clients settings.

Setting this same standard to "Alert" allows you to receive an alert inside of your e-mail or ticketing system.

Setting this same standard to "Remediate" changes the clients configuration, and in this case would enable the audit log for the client.

### **Precedence of Standards**

Standards are merged based on their specificity and creation date:

* **Specificity:** Standards applied to a specific tenant always override more general standards (like those set for 'All Tenants'). For instance, if an 'All Tenants' standard enables TOTP but you need it disabled for one tenant, creating and applying a tenant-specific standard will disable TOTP for that tenant.
* **Creation Date:** When two standards conflict at the same specificity level (e.g., both tenant-specific), the standard created most recently takes precedence. For example, if you create a tenant-specific standard enabling TOTP and later create another tenant-specific standard disabling TOTP, the more recently created standard (disabling TOTP) will be applied.

{% hint style="warning" %}
**Note**: By default, standards aren't applied to any tenants upon setup of CIPP. You must manually configure and enable them. Apply standards with a clear understanding of their effects.
{% endhint %}

{% hint style="danger" %}
### CIPP v7 Standards Updates

As of the update to v7 of CIPP, standards now operate via templates. Where previously, standards were either configured via the AllTenants "Edit Standards" page or an individual tenants "Edit Standards" page, multiple templates can be created to provide you with a more granular standards experience. Templates can be assigned to "AllTenants", "AllTenants" with excluded tenants, or just specific list of tenants.

If you are upgrading to v7 from a prior version of CIPP, you'll need to complete a one-time conversion of your existing standards by clicking the "Convert Standards" button at the top of the page. These standards will still not run on a schedule until you edit each template to your choosing and then toggling off the "Do not run on schedule" option.
{% endhint %}

### **Standards Categories**

For ease of reference, standards are grouped within the following categories. These categories match the Category label on the standard selection page.

| Category             | Description                                                                       |
| -------------------- | --------------------------------------------------------------------------------- |
| Global Standards     | Applied across all tenants to manage organization-wide configurations.            |
| Exchange Standards   | Email-related settings such as spam protection and message handling.              |
| Defender Standards   | Security measures to protect against phishing, malware, and other threats.        |
| Intune Standards     | Device and application management policies for a secure Intune environment.       |
| SharePoint Standards | SharePoint and OneDrive configuration incl. sharing and retention policies.       |
| Teams Standards      | Collaboration-related settings, i.e.: meeting policies and external file sharing. |

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
Plans exist to implement more standardized options and settings. If there's a standard that you want, see the "Feature Requests / Ideas" section below.
{% endhint %}

***

{% include "../../../.gitbook/includes/feature-request.md" %}
