# View Tenant Report

When selected from the per-row actions on the [classic-standards](list-standards/classic-standards/ "mention") page, this report will provide you with an outline of the tenant currently selected menu bar against the standard template. It will also display any tenant that is missing licensing for the standard.

{% hint style="info" %}
Note that the standard must be set to "Report" or "Remediate" for the system to collect the current settings from the tenant. Once report is set, it may take a couple of cycles for the orchestrator to correctly gather and apply any standards that are set to both Report and Remediate since the system will first Report before Remediate actions are taken.
{% endhint %}

For standards templates that include a lot of configured standards, you can use the same filters available on the [template.md](template.md "mention") page.

{% hint style="warning" %}
Standards must have "Report" or "Remediate" enabled for the report to function. If you do not have "Report" enabled, you should see an error `Reporting is disabled for this standard in the template configuration.` display in the information box.
{% endhint %}

### Known Issues

* There is currently a limitation with Conditional Access standards due to the complexity of the comparison the standard settings and the Conditional Access response object. We hope to resolve this in a future update.

***

{% include "../../../.gitbook/includes/feature-request.md" %}
