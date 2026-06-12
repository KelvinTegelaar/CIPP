# Standards v Drift: How Do I Know Which to Use?

This question has become a regular one since the introduction of Drift Management. While there is some overlap in how the two can work, they are very different approaches to how you manage the security baseline for your clients' tenants. This is fundamentally a question of how much you want to manage and how much visibility you want to the entire tenant.

### Standards

#### What Does Standards Do?

Standards are the Ron Popeil Showtime Rotisserie method: "set it and forget it!". Anything that you configure with a standard will be reinforced every twelve hours. You can have multiple templates that can apply to any given tenant and settings priority follow the precedence set out on the main [standards](../../user-documentation/tenant/standards/ "mention") page.

#### What Visibility Does Standards Provide?

Compliance reporting for standards is limited to only those standards included in the template. Everything else going on outside of your limited list of standards is left to be reviewed by other methods (alerts, etc.)

### Drift Management

#### What Does Drift Management Do?

Drift Management is a more managed approach to tenant monitoring. Ideally, you create fewer templates as each tenant can only have one template applied. Drift Management is evaluated every twelve hours. You can optionally select to have certain settings in the template set to automatically remediate if they are found to be out of alignment with the settings in the template. This behavior is similar to Standards for those settings that you identify must be applied across all tenants assigned to the template.

#### What Visibility Does Drift Management Provide?

Compliance reporting for Drift Management includes everything whether the setting is included in the template or not. Anything not defined by the template is automatically considered a deviation that must be managed along with settings that don't match the template.

### Which One Should I Use?

This is ultimately going to be a decision based on how you want to operate your business and the services you provide to your clients. Drift Management provides you with the greatest visibility into your clients' tenants allowing you to offer drift alignment and deviation review as a part of a more managed security services offering. Standards provides an ease of use with less ongoing review needed but requires more work upfront to clearly define multiple templates for granular control over the various nuances between tenants (licensing, industry, etc.).

Standards apply specific settings. Drift monitors the full tenant state.

### Do I Need Both a Classic Template and a Drift Template With the Same Settings?

No. A Drift Management template with **auto-remediate enabled** on a setting behaves the same as a Classic standard set to **Remediate** for that setting — it will bring the tenant back into alignment with the template value every twelve hours. With auto-remediate **disabled**, the setting reports as a deviation in [Manage Drift](../../user-documentation/tenant/manage/drift.md) for review.

The auto-remediate toggle is per-setting inside the drift template, so you can mix-and-match: auto-remediate the non-negotiables (audit log, anonymous reporting), and just report on settings you want eyes on first (Conditional Access changes).

You only need a separate Classic template alongside Drift when you want to override a single setting for a specific tenant (see "Mixing All-Tenants, Groups, and Tenant Overrides" below) — and remember each tenant can only be assigned to **one** Drift template.

### Mixing All-Tenants, Groups, and Tenant Overrides

A common pattern that works well for MSPs with a mixed-license customer base:

1. **One Classic standard, assigned to All Tenants**, containing the settings you want enforced everywhere regardless of license — enable audit log, anonymous reporting, helpdesk email as a security contact, etc.
2. **One Drift template per license tier or customer segment**, assigned via tenant groups. For example:
   * An *Education* tenant group → Drift template with Entra P1-dependent settings (Conditional Access, App Protection policies).
   * A *Business Standard* tenant group → Drift template with the Security Defaults standard and other settings appropriate for tenants without Entra P1.

   Tenant groups can be **static** (you add tenants manually) or **dynamic** (membership based on a license SKU or a tenant custom variable), letting group membership follow tenant state automatically. See [Tenant Groups](../../user-documentation/tenant/administration/tenants/groups/README.md) for setup.
3. **Tenant-specific Classic templates for one-off variances.** If one client needs `Set SharePoint File Version Limits` set to 200 but your group-level drift template has 100, create a Classic template containing **only** that one standard set to 200 and assign it directly to that tenant. Per the [precedence rules](../../user-documentation/tenant/standards/#precedence-of-standards), the tenant-specific Classic will win for that setting.

This pattern keeps your group-level templates clean and your exceptions visible and named, without duplicating the rest of the configuration.

{% hint style="info" %}
Because license-incompatible settings are automatically skipped, you _can_ lump everything into one big template — but the group-based pattern above gives you cleaner alignment reporting and makes "why is this tenant non-compliant?" easier to answer.
{% endhint %}

***

{% include "../../.gitbook/includes/feature-request.md" %}
