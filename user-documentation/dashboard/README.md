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

{% @storylane/embed subdomain="app" linkValue="zt4porabti6d" url="https://app.storylane.io/share/zt4porabti6d" %}

## Overview Tab

<details>

<summary>Universal Search</summary>

This is a universal search bar that allows you to quickly find the information you need using Lighthouse.  For example, enter a first name of a user. CIPP will return a list of all users in your connected tenants with that first name. You can toggle between "Users" and "Groups" to alter what the search is looking for.

{% hint style="info" %}
This feature relies on the cached data from the CIPP reporting database. You can force a databse refresh using the "Update Report" button in [#report-control](./#report-control "mention")
{% endhint %}

{% hint style="warning" %}
To utilize this search, you must have onboarded Lighthouse on your partner tenant.
{% endhint %}

</details>

<details>

<summary>Quick Access</summary>

This card will allow you to quickly access several options for the selected tenant:

* Portals: This dropdown will give you quick links to the Microsoft portals for the selected tenant.&#x20;

{% hint style="warning" %}
Clicking these links cause you to leave CIPP and will require your user - not the CIPP service account - to have GDAP permissions to access the appropriate resource.
{% endhint %}

* Executive Summary: This will allow you to generate a client friendly executive summary report gathered from CIPP data to present to your client. This is fully brandable via [#branding-settings](../cipp/settings/#branding-settings "mention") and you can select which sections you want to include by toggling them off or on.
* Report Builder: Functionality to be added in a future release!

</details>

<details>

<summary>Report Control</summary>

This card controls the report used in displaying the test information on the dashboard [#assessment-overview](./#assessment-overview "mention") and the [#identity-tab](./#identity-tab "mention") and [#devices-tab](./#devices-tab "mention").&#x20;

Select a report from the dropdown to change the display. Alternatively, you can click on the "Create custom report" button to select your own custom set of tests from the CIPP database to include in your report.&#x20;

The Update Report button will kick off a refresh of the cached database. Once that refresh is complete the test data will be updated.

The "Delete" button allows you to delete a custom report that you created.

</details>

<details>

<summary>Tenant Overview</summary>

This card displays basic information about the tenant's name, ID, and primary domain.

</details>

<details>

<summary>Tenant Metrics</summary>

This section displays basic counts about the tenant including users, groups, etc.

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

This card will display the licenses present on the tenant.&#x20;

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

## Previous Dashboard Experience

This will allow you to return to the [dashboard.md](dashboard.md "mention").

***

{% include "../../.gitbook/includes/feature-request.md" %}
