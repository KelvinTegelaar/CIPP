---
description: Apply pre-defined standards to your Microsoft 365 CSP tenants.
---

# Edit Standards

## **Overview**

The **Edit Standards** page is where you manage and customize pre-defined standards. It allows you to configure reporting, apply settings, and tailor standards to meet the needs of specific tenants.

{% hint style="info" %}
Standards aren’t applied by default after initial setup. Admins must configure and enable them manually. **For first-time setup, refer to the** [**Implementation Guide.**](../../../setup/implementation-guide/standards-setup.md)
{% endhint %}

***

## **Key Features**

1. **Actionable Options**
   * **Report**: Log the current configuration in a Best Practices Report.
   * **Alert**: Notify admins of changes through tickets, emails, or webhooks.
   * **Remediate**: Automatically enforce the desired configuration.
   * _Disabling Remediate_ stops enforcement but does not revert previously applied changes.
2. **Customizing Standards**
   * Input fields or dropdowns are available for tailoring settings to specific requirements.
   * Use categories (e.g., Security, Compliance, Usability) to quickly find relevant standards.
3. **Running Standards**
   * Use the **Run Now** button to apply standards immediately.
   * Options include applying standards to:
     * A single tenant.
     * All tenants in your environment.
4. **Template Reapplication**
   * Templates reapply every **three hours** to maintain consistent configurations.
   * If changes are made by admins, they will automatically revert to match the template.
   * Templates simplify updates by allowing a single change to propagate across all linked tenants.
5.  **Excluding Tenants**

    * Exclude a tenant from **All Tenants** standards to prevent global enforcement.
    * This allows for custom configurations specific to that tenant.



    ***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
