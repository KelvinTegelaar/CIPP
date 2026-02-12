# Standards v Drift: How Do I Know Which to Use?

This question has become a regular one since the introduction of Drift Management. While there is some overlap in how the two can work, they are very different approaches to how you manage the security baseline for your clients' tenants. This is fundamentally a question of how much you want to manage and how much visibility you want to the entire tenant.

### Standards

#### What Does Standards Do?

Standards are the Ron Popeil Showtime Rotisserie method: "set it and forget it!". Anything that you configure with a standard will be reinforced every four hours. You can have multiple templates that can apply to any given tenant and settings priority follow the precedence set out on the main [standards](../../user-documentation/tenant/standards/ "mention") page.&#x20;

#### What Visibility Does Standards Provide?

Compliance reporting for standards is limited to only those standards included in the template. Everything else going on outside of your limited list of standards is left to be reviewed by other methods (alerts, etc.)

### Drift Management

#### What Does Drift Management Do?

Drift Management is a more managed approach to tenant monitoring. Ideally, you create fewer templates as each tenant can only have one template applied. Drift Management is evaluated every twelve hours. You can optionally select to have certain settings in the template set to automatically remediate if they are found to be out of alignment with the settings in the template. This behavior is similar to Standards for those settings that you identify must be applied across all tenants assigned to the template.

#### What Visibilty Does Drift Management Provide?

Compliance reporting for Drift Management includes everything whether the setting is included in the template or not. Anything not defined by the template is automatically considered a deviation that must be managed along with settings that don't match the template.

### Which One Should I Use?

This is ultimately going to be a decision based on how you want to operate your business and the services you provide to your clients. Drift Management provides you with the greatest visibility into your clients' tenants allowing you to offer drift alignment and deviation review as a part of a more managed security services offering. Standards provides an ease of use with less ongoing review needed but requires more work upfront to clearly define multiple templates for granular control over the various nuances between tenants (licensing, industry, etc.).

***

{% include "../../.gitbook/includes/feature-request.md" %}
