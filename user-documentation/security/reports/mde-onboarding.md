# MDE Onboarding

{% include "../../../.gitbook/includes/cached-data-report.md" %}

This page will reflect the state of the connector between Microsoft Defender for Endpoint and Mobile Threat Defense. This page will have different views depending on if being accessed via All Tenants or a single tenant. All Tenants displays an informational table. Single tenant will also show a link to "Start Onboarding" that will send you to the MDE onboarding page within the Microsoft Defender portal if the state is not enabled or available.

## Partner State

* `enabled` — MDE connector is set up and active
* `available` — connector exists and is reachable but not fully configured/enrolled
* `unavailable` — connector can't be reached or isn't responding
* `unresponsive` — connector was set up but has stopped communicating
* `notSetUp` — no connector configured at all
* `error` — something went wrong retrieving the state

{% hint style="warning" %}
The connector being configured is a prerequisite, not a confirmation of full deployment. See [deployment.md](../defender/deployment.md "mention") for how to complete a full deployment.
{% endhint %}

***

{% include "../../../.gitbook/includes/feature-request.md" %}
