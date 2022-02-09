---
id: domainsanalyser
title: Domains Analyser
description: Check your managed domains against security and configuration best practices.
slug: /usingcipp/tenantadministration/domainsanalyser
---

## Overview

The domain analyser is a series of best practice checks that run against all email enabled domains that can been found in your delegated 365 tenants. It analyses the DNS records that are available and assesses SPF, DMARC, DKIM and DNSSEC. Please note - clicking **More** at the end of each row will give you extended information about the problems identified.

## How do I get started?

In the left hand menu, navigate to **Tenant Administration > Standards > Domain Analyser**. If this is your first ever run you may see an error initially because there is no data; this is expected.

## How do I refresh or generate the data?

At the top of the page there is button called **Force Refresh All Data**. You only need to click this once.

## Interpreting Results

The reporting here generally follows a standard colour theme.
Red is bad and generally not something that should be happening on your tenant.
Orange is either a warning or subjective. It does not necessarily indicate something is wrong.
Green means there are no issues or the setting is set in a manner that is generally agreed as Best Practice.

### Security Score

This is a measure of the overall security of the domain and is calculated by taking the following into account:

* SPF
* MX
* DMARC
* DKIM
* DNSSEC

| Item                      | Description                                                      | Points  |
|---------------------------|------------------------------------------------------------------|:-------:|
| SPF Present               | SPF is present                                                   | 10      |
| SPF MX Recommended        | SPF is present and is set as determined from the MX records.     | 10      |
| SPF Correct All           | SPF is present and is set correctly.                             | 10      |
| MX Provider Recommended   | MX records are present and are set as recommended by provider.   | 10      |
| DMARC Present             | DMARC is present                                                 | 10      |
| DMARC Set Quarantine      | DMARC is set to quarantine                                       | 20      |
| DMARC Set Reject          | DMARC is set to reject                                           | 30      |
| DMARC Reporting Active    | DMARC reporting is active                                        | 20      |
| DMARC Percentage Good     | DMARC percentage is set to a value of 100                        | 20      |
| DNSSEC Present            | DNSSEC is present                                                | 20      |
| DKIM Active and Working   | DKIM is active and working                                       | 20      |
| **Total Possible Points** |                                                                  | **180** |


### SPF Pass Test

This is looking primarily for two conditions; that you are using the recommended SPF record that Microsoft suggests. It also looks to ensure that your domains are set to hard fail as opposed to soft fail.

### MX Pass Test

This is looking to ensure that your MX record is set correctly based on what Microsoft thinks it should be. Where this is failing you likely have a domain in your 365 tenant that is using e-mail elsewhere, or has a misconfigured MX record.

### DMARC Present

This is the first of a number of tests that we are performing on the DMARC record. First we are making sure one exists; your domains absolutely should have a properly configured DMARC or you are putting this domain at risk of being spoofed.

### DMARC Action Policy

Your DMARC record is only as good as the action set on it. If you have never added a DMARC record before, you'll want to start by creating a record in reporting only, and utilising a service like report-uri.com to assess reports. The ideal setting for this is Reject.

### DMARC % Pass

It is possible to configure your DMARC to only pay attention to a certain percent of mail. This test makes sure it is assessing 100% of it.

### DNSSEC

DNSSEC is the "Domain Name System Security Extensions) and is a feature of DNS that authenticates responses to domain name lookups, preventing attackers from manipulating or poisoning the responses to DNS requests. This test is a simple enable/disable test.

### DKIM Enabled

DKIM (DomainKeys Identified Mail) is an email security standard designed to make sure messages aren't altered in transit between the sending and recipient servers. It uses public-key cryptography to sign email with a private key as it leaves a sending server. This is a simple enabled/disabled test.

## I am having Problems

The adding of this feature requires a new permission granting in your delegated permissions - _Domain.Read.All_. Please ensure that you have given adequate time for the Domain Analyser to run. In an environment with 100 tenants this takes on average 2 minutes. Please ensure that your permissions are correct by going in to **CIPP Settings > Configuration Settings > Run Permission Check**. Make sure your CIPP-API and CIPP modules are both fully up-to-date. There is extensive logging in the log file in the root of the CIPP-API Function App.

## I have something to add or an idea for Domain Analyser

Excellent! [Please add them to the GitHub Issues as a feature request](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=feature_request.md&title=FEATURE+REQUEST%3A+)

## Known Issues / Limitations

There are currently no known issues with the Domains Analyser page.  If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
