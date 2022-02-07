---
id: reports
title: Reports
description: Reports available within CIPP - Identity Management
slug: /usingcipp/identitymanagement/reports
---

## Overview

There are currently multiple reports that can be run against users, see below for further details.

### Details

#### Devices

This report lists all the devices from Azure AD on the tenant, including whether they are compliant, enabled and various other fields related to the device. These can all be filtered, exported to PDF or CSV.

#### MFA Report

This report lists all the users in the tenant and the status of the user in regards to MFA.  For instance, it reports on whether they are enabled via Per-User MFA or enabled via Conditional Access - or alternatively whether it is enforced via Security Defaults. These can all be filtered, exported to PDF or CSV.

#### Basic Auth Report

This report lists all users that have signed in using Basic Auth across all ClientApps in the last 30 days. These can all be filtered, exported to PDF or CSV.

## Current known issues / Limitations

There are currently no known issues with the Reports page.  If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
