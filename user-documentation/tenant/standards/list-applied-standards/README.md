---
description: Apply pre-defined standards to your Microsoft 365 CSP tenants.
---

# Edit Standards

{% hint style="danger" %}
A standard with Remediate applies actual configuration to the selected tenant, not just monitoring.

Note that by default, Standards aren't applied to any tenants upon setup / configuration of CIPP. Applying any standard should only be undertaken with full understanding of the effects of the standard, detailed below.
{% endhint %}

The Standards page provides the ability for you to apply or reapply specific standards to your entire client base. Standards reapply to your tenants every **three hours** by default. If a setting covered by a standard changes the next time the standards apply the value specified in the standard takes precedence.

Some of the standards are explained below:

{% hint style="warning" %}
Note that some standards may require one or more companion (Intune) policies to be set to be effective.

Deselecting an option on the standard simply means it will no longer try to apply that standard. However, it DOES NOT turn the setting off.

IE, if you disable the setting "Enable FIDO2 capabilities", the next time the standard runs, it will no longer try to turn that setting on, but if the option was already on it will not turn it off.
{% endhint %}

{% hint style="warning" %}
The set value for a tenant level standard, will take precedence over the value set in the AllTenants standard.  
Ex : If you set the "Enable or disable 'external' warning in Outlook" standard to false for a specific tenant, it will not be enabled for that tenant, even if the AllTenants standard is set to true.
{% endhint %}

## Impact levels

**Low Impact** changes have no user-facing impact or minimal impact.  
**Medium Impact** changes have a user impact mitigated with a little communication.  
**High Impact** changes should require thought and planning. Should ideally co-ordinate deployment with customers - may have significant impacts on how users interact with Microsoft 365.

## Meet the Standards

All the currently available standards are in the tables in the subpages of this page.  
The tables contain the following columns:

- **Standard Name**: The name of the standard.
- **Description**: A brief description of the standard. This will help you understand what the standard does.
- **Recommended By**: The organization that recommends the standard. This can be CIS, CIPP, or any other organization.
- **APIName**: The API name of the standard. Useful for identifying the standard in the logbook.
- **PowerShell Equivalent**: The PowerShell command that can be used to apply the standard.

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
