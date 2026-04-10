---
description: Check your managed domains against security and configuration best practices.
---

# Domains Analyser

The domain analyser is a series of best practice checks that run on all your e-mail enabled domains across your delegated Microsoft 365 tenants.

It analyses the DNS records that are available and assesses the following areas:

* Sender Policy Framework (SPF)
* Domain-based Message Authentication, Reporting & Conformance (DMARC)
* DomainKeys Identified Mail (DKIM)
* Domain Name System Security Extensions (DNSSEC)

{% hint style="info" %}
If this is your first ever run you may see an error initially because there is no data, please wait for the analyser to run or use the refresh button.
{% endhint %}

## Page Actions

<details>

<summary>Check Individual Domain</summary>

This will open [individual-domains.md](../../../tools/tenant-tools/individual-domains.md "mention")

</details>

<details>

<summary>Run Analysis Now</summary>

This will add a task to the queue to update the analysis for the selected tenants. If you have offloading enable, this will begin at the next quarter hour. It can take several minutes for CIPP to check all the required tests.

</details>

## Table Details

The table will display the results of CIPP's tests for all domains in the included tenant(s) from the [tenant-select.md](../../../shared-features/menu-bar/tenant-select.md "mention") dropdown.

<table data-full-width="false"><thead><tr><th>Column</th><th>Description</th><th>Score Implications</th></tr></thead><tbody><tr><td>Domain</td><td>The domain name being analysed.</td><td></td></tr><tr><td>Score Percentage</td><td><code>(Score / 160) * 100</code></td><td></td></tr><tr><td>Mail Provider</td><td>Name of the detected mail provider (e.g. Microsoft, Google, Unknown), derived from MX record lookup.</td><td></td></tr><tr><td>SPF Pass All</td><td><code>true</code> if the SPF record passes all validation checks (zero validation failures).</td><td><p></p><ul><li>SPF record present (exactly 1 record) → <strong>+10 pts</strong></li><li>SPF passes all validation → <strong>+20 pts</strong></li><li>Multiple SPF records or missing record → 0, adds explanation</li></ul></td></tr><tr><td>MX Pass Test</td><td><code>true</code> if MX record passes all validation checks (zero validation failures).</td><td><p></p><ul><li>MX passes validation → <strong>+10 pts</strong></li></ul></td></tr><tr><td>DMARC Present</td><td><code>true</code> if a DMARC record exists for the domain.</td><td><p></p><ul><li>DMARC record found → <strong>+10 pts</strong></li></ul></td></tr><tr><td>DMARC Action Policy</td><td>The enforced DMARC policy. Values: <code>Reject</code>, <code>Quarantine</code>, <code>None</code>.</td><td><p></p><ul><li>Policy = <code>reject</code> AND subdomain policy = <code>reject</code> → <strong>+30 pts</strong></li><li>Policy = <code>quarantine</code> → <strong>+20 pts</strong></li><li>Policy = <code>none</code> → 0 pts, adds "DMARC is not being enforced" to explanation</li></ul></td></tr><tr><td>DMARC Reporting Active</td><td><code>true</code> if at least one <code>rua</code> reporting email is configured.</td><td><p></p><ul><li>Reporting active → <strong>+20 pts</strong></li></ul></td></tr><tr><td>DMARC Percentage Pass</td><td><code>true</code> if DMARC percentage (<code>pct</code>) is set to 100.</td><td><p></p><ul><li>pct = 100 → <strong>+20 pts</strong></li><li>pct &#x3C; 100 → 0 pts, adds "DMARC Not Checking All Messages"</li></ul></td></tr><tr><td>DNSSEC Present</td><td><code>true</code> if DNSSEC passes with zero validation failures/warnings.</td><td><p></p><ul><li>DNSSEC passes → <strong>+20 pts</strong></li></ul></td></tr><tr><td>DKIM Enabled</td><td><code>true</code> if at least one DKIM record is found and passes validation (zero failures).</td><td><p></p><ul><li>DKIM active and valid → <strong>+20 pts</strong></li><li>Uses configured selectors, falls back to Microsoft selectors if none set</li></ul></td></tr><tr><td>Enterprise Enrollment</td><td><p></p><p>CNAME check for <code>enterpriseenrollment.&#x3C;domain></code>. Values:</p><ul><li><code>Correct</code> — points to <code>enterpriseenrollment-s.manage.microsoft.com</code></li><li><code>Legacy</code> — points to old <code>enterpriseenrollment.manage.microsoft.com</code> endpoint</li><li><code>Unexpected: &#x3C;value></code> — unknown CNAME target</li><li><code>No CNAME</code> — record missing</li></ul></td><td>Adds to <code>ScoreExplanation</code> if not Correct, but contributes <strong>0 pts</strong>.</td></tr><tr><td>Enterprise Registration</td><td><p></p><p>CNAME check for <code>enterpriseregistration.&#x3C;domain></code>. Values:</p><ul><li><code>Correct</code> — points to <code>enterpriseregistration.windows.net</code></li><li><code>Unexpected: &#x3C;value></code> — unknown target</li><li><code>No CNAME</code> — record missing</li></ul></td><td>Adds to <code>ScoreExplanation</code> if not Correct, but contributes <strong>0 pts</strong>.</td></tr></tbody></table>

{% hint style="info" %}
Additional columns exist for informational purposes. Information from those columns is also used to build the Extended Info panel viewable from each row.
{% endhint %}

## Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Add/Modify DKIM Selectors</td><td>This will allow you to update the DKIM Selectors for the selected domain(s)</td><td>true</td></tr><tr><td>Delete from analyser</td><td>Deletes the selected domain(s) from the analyser</td><td>true</td></tr><tr><td>More Info</td><td>This opens an enhanced Extended Info flyout. Here you can view further detail on each test performed. Success/failure is easy to identify through the use of standard red/green colored icons next to each test. Additional features can help you review the results and dig deeper:</td><td>false</td></tr></tbody></table>

### Reviewing the Extended Information Panel

#### Settings

You can click the settings icon to toggle the visibility of additional options for the domain check. Here you can set specific SPF records, a DKIM Selector, or set HTTPS subdomains to check. Click `Check` to run the tests again after configuring your desired options.

#### Results List

The test results will display below with the following features:

* Easy to identify pass/fail indicators using green check marks for pass and red exclamation marks for fail.
* Detailed information on the information returned for each test including the same pass/fail for multi-part tests
* A three dots icon that will open a further Extended Info window allowing you to view the full results of that specific test.
* A question mark icon that will launch external documentation on how to influence the test results.

## Common Problems

* This feature requires that your Secure Application Model (SAM) app has the delegated permission `Domain.Read.All`.
* You must give adequate time for the Best Practice Analyser to run. In an environment with 100 tenants this takes on average 2 minutes.
* Check that your permissions are correct by navigating to **CIPP > Application Settings > Permissions** and review the results of Permissions Check.
* Make sure both CIPP-API and CIPP are fully up to date. There is extensive logging in the log files in the CIPP-API Function App.

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
