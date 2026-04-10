---
description: About the Dashboard which includes versions and quick links
icon: chart-line
---

# CIPP Dashboard

Welcome to the CIPP Dashboard! This page provides you with both an overview of your client tenants and a powerful way to assess them. This page is laid out in a tabbed format with different important information on each tab.

{% hint style="warning" %}
The data CIPP uses to display the dashboard is cached in a database that gets updated at 3AM UTC each day. The first time you load the dashboard for a tenant, you will not see any data until the next refresh cycle occurs.
{% endhint %}

## Walkthrough

{% @storylane/embed subdomain="app" url="https://app.storylane.io/share/zt4porabti6d" linkValue="zt4porabti6d" %}

## Overview Tab

<details>

<summary>Portals Quick Access</summary>

This dropdown will give you quick links to the Microsoft portals for the selected tenant.

{% hint style="warning" %}
Clicking these links cause you to leave CIPP and will require your user - not the CIPP service account - to have GDAP permissions to access the appropriate resource.
{% endhint %}

</details>

<details>

<summary>Executive Summary</summary>

This will allow you to generate a client friendly executive summary report gathered from CIPP data to present to your client. This is fully brandable via [#branding-settings](../cipp/settings/#branding-settings "mention") and you can select which sections you want to include by toggling them off or on.

</details>

<details>

<summary>Report Builder</summary>

This button will take you to the [#report-builder](./#report-builder "mention") tool where you are able to leverage the data collected by CIPP's test suites to generate custom client-facing reports.

</details>

<details>

<summary>Test Suite Control</summary>

This dropdown controls the test suite used in displaying the test information on the dashboard [#assessment-overview](./#assessment-overview "mention") and the [#identity-tab](./#identity-tab "mention") and [#devices-tab](./#devices-tab "mention"). Select a test suite from the dropdown to change the display.&#x20;

**Available Built-In Test Suites:**

* CISA ScubaGear Tests for Exchange Online: Security configuration assessment tests based on CISA's Secure Cloud Business Applications (SCubaGear) project for Microsoft Exchange Online. These tests validate compliance with federal security baselines.
* Microsoft 365 Copilot Readiness Tests: Assess tenant readiness for Microsoft 365 Copilot deployment. Tests cover prerequisite licensing, Copilot license assignment, and active M365 app usage that determines which users would benefit most from Copilot.
* Entra ID Security Configuration Analyzer (EIDSCA) Tests: Comprehensive security assessment for Microsoft Entra ID (formerly Azure AD) covering authorization policies, authentication methods, consent policies, password policies, and group settings. Based on Microsoft's EIDSCA framework for identity security best practices.
* Generic Tenant Tests: Executive-level informational reports covering licensing, MFA posture, secure score trends, and tenant capabilities. These tests provide a clear snapshot of your tenant's current state without pass/fail criteria.
* ORCA (Office 365 Recommended Configuration Analyzer) Tests: Comprehensive security assessment for Microsoft Exchange Online and Office 365 security configurations. Tests cover anti-spam, anti-phish, anti-malware, safe links, safe attachments, DKIM, transport rules, and other Exchange Online security settings.
* Zero Trust Network Access Tests: Microsoft's Comprehensive security assessment covering identity and device compliance, conditional access policies, authentication methods, and endpoint protection aligned with Zero Trust principles.

</details>

<details>

<summary>Refresh Test Suites</summary>

Pulls in a fresh version of the latest cached data for the referenced test suite.

</details>

<details>

<summary>Create Suite</summary>

This will allow you to utilize existing tests to create your own custom test suite. Set a name, description, and select from the available Identity, Device, and Custom Tests.

</details>

<details>

<summary>Refresh</summary>

This will trigger CIPP to pull in fresh data for the tenant. This update happens in the background so you may have to revisit the dashboard after allowing the tests to complete.

</details>

<details>

<summary>Edit</summary>

When a custom test suite is selected, this option allows you to edit the test suite.

</details>

<details>

<summary>Delete</summary>

When a custom test suite is selected, this option allows you to delete the test suite.

</details>

<details>

<summary>Tenant Overview</summary>

This card displays basic information about the tenant's name, ID, and primary domain.

</details>

<details>

<summary>Tenant Metrics</summary>

This section displays basic counts about the tenant including users, groups, etc.

{% hint style="info" %}
These sections are clickable and will take you to the respecitve area in CIPP to do a deeper dive on the respective information behind the metric.
{% endhint %}

</details>

<details>

<summary>Assessment Overview</summary>

This card will provide you with a high-level display of how the tenant scored on the report selected in the [#report-control](./#report-control "mention") section.

</details>

<details>

<summary>Secure Score</summary>

This card will display the historical trend of the Microsoft Secure Score collected for the tenant.

</details>

<details>

<summary>User Authentication</summary>

This will provide you with an easy-to-read chart of user authentication and MFA/Conditional Access status.

</details>

<details>

<summary>Authentication Methods</summary>

This card will display the types of authentication methods users in the tenant are utilizing. Clicking on any category in this chart will jump to the MFA report with some filtering enabled so you can review the users associated with the method. This is especially helpful to know which users you need to work with to strengthen their authentication.

</details>

<details>

<summary>License Overview</summary>

This card will display the licenses present on the tenant.

{% hint style="info" %}
To exclude a license from this and all other reports in CIPP, add the license in [licenses.md](../cipp/settings/licenses.md "mention").
{% endhint %}

</details>

## Identity Tab

This tab will display information about the Identity tests, including links to remediation steps for any failed tests. To review the information on any specific test, click the three dots Action and select "More Info". Once you've selected a test you can use the up and down arrows in the top right to page through the tests or the X to close the window.

### Test Result Data

<details>

<summary>Overview</summary>

This section will display high level information regarding the test.

* Risk: an indicator of how much risk to the client this setting presents if misconfigured.
* User Impact: an indicator of how much impact to the end user this setting presents when the recommended remediation is enabled.
* Effort: an indicator of how much effort it will take to remediate.
* Standard Available: an indicator if a CIPP standard exists to implement the recommended remediation.

</details>

<details>

<summary>Test Outcome</summary>

This section displays the test name, description, and result of the test outcome in a Pass/Fail status.

</details>

<details>

<summary>Additional Information</summary>

This section will display the test category, outline in detail what the test is looking for, and provide documentation links on the recommended remediation.

</details>

## Devices Tab

This tab will display information about the Device tests, including links to remediation steps for any failed tests. The format of the page is identical to the [#identity-tab](./#identity-tab "mention").

## Custom Tab

This tab will display information about the Custom tests, including links to remediation steps for any failed tests. The format of the page is identical to the [#identity-tab](./#identity-tab "mention").

{% hint style="info" %}
Custom test can be reviewed and created via [custom-tests](../tools/custom-tests/ "mention").
{% endhint %}

## Previous Dashboard Experience

This will allow you to return to the [dashboard.md](dashboard.md "mention").

***

{% include "../../.gitbook/includes/feature-request.md" %}
