---
id: individualdomaincheck
title: Individual Domain Check
description: Analyse external domain's mail-related DNS entries
slug: /usingcipp/tenantadministration/individualdomaincheck
---

## Overview

This can check any external domain enabling you to perform checks on vendors, potential customers, competitors - basically any domain. You are responsible for ensuring your use of this tool complies with any applicable laws, registry terms and the terms of service for the Google and CloudFlare DNS APIs depending on which you have selected in the settings.

## Details

The checks are the same as those found in the [domains analyser](/docs/user/usingcipp/tenantadministration/domainsanalyser#interpreting-results).

### Options

The following options can be used to perform additional checks against a domain:

* SPF Pre-validation
* Custom DKIM selectors
* HTTPS certificate verification

#### SPF Pre-validation

Use this function to simulate a change to your SPF record and ensure that the syntax is valid and it passes all of our standard checks.

#### Custom DKIM selectors

Use this function to check the validity of a list of DKIM selectors instead of the ones detected from your mail provider. Supply a comma separated list in this field.

#### HTTPS certificate validation

Use this function to check your domain and optional subdomain list against the following tests:

* Expiration date
* DNS name mismatch
* Certificate chain validation

## Known Issues / Limitations

There are currently no known issues with the Individual Domain Access Check page. If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+)
