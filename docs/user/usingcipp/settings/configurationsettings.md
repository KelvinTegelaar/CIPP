---
id: configurationsettings
title: Configuration Settings
description: View and amend the settings for your CIPP instance.
slug: /usingcipp/settings/configurationsettings
---

## Overview

You can access diagnostic information, helpful links, check configuration and more from the CIPP Settings section by accessing the Configuration settings menu item.

## Detail

### Permissions Settings

You can use the "Run permissions check" button to check that your CIPP Azure AD Application has the correct permissions assigned.

### Tenant, Best Practice and Domain Analyser Cache

:::caution Performance & Data

Note that this option can severely impact performance of your CIPP Application and will also remove any personal settings such as the selected theme
:::

You can clear the cached information used by the tenant selector, best practices analyser and domain analyser features.


### Tenant Access Check

You can check that the required access and configuration is in place for specific tenants using the tenant selector and "Run access check" button.

### DNS Resolver

You can switch providers to either Google or Cloudflare for your DNS Analysis results.

### Excluded Tenants

You can add tenants to the excluded tenant list to prevent CIPP from taking any action against these tenants, removing them from display.

### Access backend

You can get the URLs to access backend features directly in the Azure AD portal from the Security tab.

## Current known issues / Limitations

There are currently no known issues with the Settings page.  If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).


