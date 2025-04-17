# Compare Tenant to Standard

When selected from the per-row actions on the [List Standards Templates](list-standards/) page, this report will provide you with an outline of the tenant currently selected menu bar against the standard template.

{% hint style="info" %}
Note that the standard must be set to "Report" for the system to collect the current settings from the tenant. Once report is set, it may take a couple of cycles for the orchestrator to correctly gather and apply any standards that are set to both Report and Remediate since the system will first Report before Remediate actions are taken.
{% endhint %}

For standards templates that include a lot of configured standards, you can use the same filters available on the [Add/Edit Standards Template](template.md) page.

{% hint style="warning" %}
Standards must have "Report" enabled for the report to function. If you do not have "Report" enabled, you should see an error `Reporting is disabled for this standard in the template configuration.` display in the information box.
{% endhint %}

***

{% include "../../../.gitbook/includes/feature-request.md" %}
