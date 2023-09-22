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

Please note - clicking **More** at the end of each row provides detailed information on identified problems.

### Getting Started

If this is your first ever run you may see an error initially because there is no data, please wait for the analyser to run or use the refresh button.

### Refreshing / Generating the Data

At the top of the page there is button called **Force Refresh All Data**. You should only use this once.

### Interpreting Results

The reporting here follows a standard colour theme. Red is bad and not something that should be happening on your tenant. Orange is either a warning or subjective. It doesn't necessarily indicate something is wrong. Green means there are no issues or the setting's configured in a manner that's meets the best practice.

#### Security Score

A measure of the overall security of the domain calculated by taking the following into account:

* SPF
* MX
* DMARC
* DKIM
* DNSSEC

There's a detailed breakdown of each check and the score points available for it below:

| Item                      | Description                             |  Points |
| ------------------------- | --------------------------------------- | :-----: |
| SPF Present               | SPF is present.                         |    10   |
| SPF Correct All           | SPF is present and set correctly.       |    20   |
| MX Present                | MX records are present.                 |    10   |
| DMARC Present             | DMARC is present.                       |    10   |
| DMARC Action              | DMARC set to quarantine. (-10 pts)      |    20   |
| DMARC Action              | DMARC set to reject.                    |    30   |
| DMARC Reporting Active    | DMARC reporting is active.              |    20   |
| DMARC Percentage Good     | DMARC percentage set to a value of 100. |    20   |
| DNSSEC Present            | DNSSEC is present.                      |    20   |
| DKIM Active and Working   | DKIM is active and working.             |    20   |
| **Total Possible Points** |                                         | **160** |

#### Sender Policy Framework Pass Test

A check that your domains meet the following conditions:

* Using the recommended SPF record that your mail provider suggests.
* SPF set to hard fail as opposed to soft fail.

#### Mail Exchanger Pass Test

A check that your MX records are present and set correctly based on what your mail provider recommends. Where this is failing you likely have a domain in your 365 tenant that's using e-mail elsewhere, or has a mis-configured MX record.

#### Domain-based Message Authentication, Reporting & Conformance Present

A check that you have a DMARC record. Your domains absolutely should have a correctly configured DMARC or you are putting this domain at risk of spoofing.

#### Domain-based Message Authentication, Reporting & Conformance Action Policy

Your DMARC record is only as good as the action set on it.

If you're just starting out with DMARC, start by creating a record in reporting only mode, and utilising a DMARC aggregation / reporting service to assess reports. The ideal setting for your DMARC policy is reject.

#### Domain-based Message Authentication, Reporting & Conformance % Pass

It's possible to configure your DMARC to subject less than 100% of your mail to filtering. This test makes sure you have your DMARC record configured to filter 100% of e-mails.

#### Domain Name System Security Extensions

A check that you have configured DNSSEC for the domain.

Domain Name System Security Extensions (DNSSEC) is a feature of DNS that authenticates responses to domain name look-ups, preventing attackers from manipulating or poisoning the responses to DNS requests.

#### DomainKeys Identified Mail Enabled

A check that you have configured DKIM for the domain.

DKIM (DomainKeys Identified Mail) is an e-mail security standard designed to make sure messages aren't altered in transit between the sending and recipient servers. It uses public-key cryptography to sign e-mail with a private key as it leaves a sending server.

### Common Problems

This feature requires that your Secure Application Model (SAM) app has the delegated permission `Domain.Read.All`.

You must give adequate time for the best practice Analyser to run. In an environment with 100 tenants this takes on average 2 minutes.

Check that your permissions are correct by navigating to **CIPP Settings > Configuration Settings > Run Permission Check**.

Make sure both CIPP-API and CIPP are fully up-to-date. There is extensive logging in the log files in the CIPP-API Function App.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/DomainAnalyser_List" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
