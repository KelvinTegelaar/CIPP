---
description: >-
  The Standards page ensures consistent configuration across your Microsoft 365
  tenants by reapplying baseline settings every three hours. This prevents
  unauthorized changes and maintains security.
---

# Standards

## **Overview**

Standards in CIPP ensure consistent configurations across your Microsoft 365 tenants by reapplying baseline settings every **three hours**. This automatic enforcement prevents unauthorized changes and helps maintain security.

{% hint style="info" %}
**Note**: By default, standards aren't applied to any tenants upon setup of CIPP. You must manually configure and enable them. Apply standards with a clear understanding of their effects, detailed in the video and walkthrough on[ this page](../../../setup/implementation-guide/).
{% endhint %}

### **Key Options**:

* **Report**: Logs the current configuration.
* **Alert**: Sends notifications via ticket, email, or webhook.
* **Remediate**: Applies the configuration to the tenant.

**Note**: Disabling the "Remediate" option prevents future enforcement but does not undo previously applied changes.

{% hint style="warning" %}
**Important Considerations:**

* **Companion Policies** Some standards rely on additional policies in tools like **Microsoft Intune** to be fully effective. Ensure all required companion policies are configured to achieve the desired results.
* **Deselecting Standards** Deselecting a standard prevents it from being enforced in future cycles, but it does not undo its current configuration.
  * **Example:** If you deselect `"Enable FIDO2 capabilities`," the standard will stop enforcing this policy. However, if FIDO2 was already enabled, it will remain enabled.
* **Precedence of Standards:** Tenant-level standards override All Tenants standards. Example: If "`Enable or disable 'external' warning in Outlook`" is set to "false" for a specific tenant, it will stay disabled even if the All Tenants standard sets it to "true."
* **Application Cadence:** Standards reapply **every three hours** by default. If a setting changes outside of the standard, it will be overridden by the value specified in the standard during the next reapplication cycle.
{% endhint %}

## **Impact Levels**

Each standard is labeled based on the level of change it introduces and its impact on users:

* **Low Impact**: Minimal or no user-facing effects.
* **Medium Impact**: May require some communication with users to prepare them for changes.
* **High Impact**: Significant changes that could affect daily workflows; coordinate with clients before applying.

## **Where to Next?**

* Learn how to configure and apply standards for the first time on the[ **Standards Setup**](../../../setup/implementation-guide/standards-setup.md) page.
* Explore specific standards and their details on the [**List Standards**](list-standards/) page.

{% hint style="info" %}
Plans exist to implement more standardized options and settings, along with an alerting system supporting RMM systems, webhooks or, e-mail.
{% endhint %}
