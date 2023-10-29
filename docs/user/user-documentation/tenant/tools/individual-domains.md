---
description: Analyse external domain's mail-related DNS entries
---

# Individual Domain Check

The individual domain check lets you to check any domain enabling you to perform checks on vendors, potential customers, competitors - basically any domain. You are responsible for ensuring your use of this tool complies with applicable laws, registry terms and the terms of service for the Google and / or CloudFlare DNS APIs.

### Details

The checks are the same as those found in the [domains analyser](../../../usingcipp/tenantadministration/domainsanalyser/#interpreting-results).

#### Options

You can use the options, detailed below, to perform specific checks on domains:

* SPF Pre-validation
* Custom DKIM selectors
* HTTPS certificate verification

**Sender Policy Framework pre-validation**

Use this function to simulate a change to your SPF record and test that the syntax is valid and it passes the checks detailed [in the domains analyser](../../../usingcipp/tenantadministration/domainsanalyser/#sender-policy-framework-pass-test) documentation.

**Custom DomainKeys Identified Mail selectors**

Use this function to check the validity of a list of DKIM selectors instead of the ones detected from your mail provider. Supply a comma separated list of selectors in this field.

**HTTPS certificate validation**

Use this to run the following tests on your domain and an optional list of subdomains:

* Expiration date
* DNS name mismatch
* Certificate chain validation

### API Calls

The following APIs are called on this page:



{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListDomainHealth" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
