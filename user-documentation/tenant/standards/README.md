---
description: >-
  The Standards page ensures consistent configuration across your Microsoft 365
  tenants by reapplying baseline settings every three hours. This prevents
  unauthorized changes and maintains security.
---

# Standards

## Overview

The Standards page provides the ability for you to apply or reapply specific standards to your entire client base. Standards are collections of configuration items applied to your M365 tenants. The standards in CIPP make sure your tenant is in a specific baseline by reapplying the setting every 3 hours. This prevents admins from making an accidental change that could impact security. Some of the standards are explained below.

{% hint style="danger" %}
**Important Points on Standards Configuration:**

* **Companion Policies:** Some standards require companion policies in Microsoft Intune to be effective. Ensure all necessary policies are set up to achieve the desired results.
* **Deselecting Standards:** Deselecting a standard prevents it from being applied but does not disable the current setting. e.g.: If you deselect `Enable FIDO2 capabilities`, the standard will stop enforcing it, but if it was already enabled, it remains on.
* **Precedence of Standards:** Tenant-level standards override `AllTenants` standards. e.g.: If `Enable or disable 'external' warning in Outlook` is set to `false` for a specific tenant, it will stay disabled for that tenant even if the `AllTenants` standard is `true`.
* **Application Cadence:** Standards reapply to your tenants every **three hours** by default. If a setting covered by a standard changes the next time the standards apply the value specified in the standard takes precedence.
{% endhint %}

### Impact levels

* **Low Impact** changes have no user-facing impact or minimal impact.
* **Medium Impact** changes have a user impact mitigated with a little communication.
* **High Impact** changes should require thought and planning. Should ideally co-ordinate deployment with customers - may have significant impacts on how users interact with Microsoft 365.

### Feature Requests / Ideas

Plans exist to implement more standardised options and settings, along with an alerting system supporting Remote Monitoring and Management (RMM) systems, webhooks or, e-mail.

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
