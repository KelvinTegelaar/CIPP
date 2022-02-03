---
id: autopilotprofiles
title: Autopilot Profiles
description: Manage Autopilot profiles across your Microsoft 365 tenants.
slug: /usingcipp/endpointmanagement/autopilotprofiles
---

## Overview

There are two main pages to the Autopilot Profiles within the CIPP App

### Add Profiles - Overview

This page will allow you to add Autopilot profiles, Autopilot profiles allow you to setup devices exactly how you want them. You can create multiple profiles with this Wizard.

#### Add Profiles - Details

* Display Name
* Description
* Unique Name Template
* Convert all Targeted Devices to Autopilot
* Assign to all Devices
* Self-Deploying Mode
* Hide Terms and Conditions
* Hide Privacy Settings
* Hide Change Account Options
* Setup User as Standard User (Leave unchecked to setup user as a local admin)
* Allow White Glove OOBE
* Automatically Configure Keyboard

#### Add Profiles - Current known issues / Limitations


You can only assign one profile to "All Devices"

**400** - You've entered incorrect data, check the information and try again. You might already have one policy pointed at the "All Devices" group.

There are currently no further known issues with the Roles page.  If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

--- 

### List Profile - Overview

This page allows you to list all the profiles that exist on the selected tenant, with a brief overivew of some of the settings.  

#### List Profile - Detail

There is a *View JSON* option which shows all the options and their selected settings, in JSON format (with really cool syntax highlighting!)

#### List Profile - Current known issues / Limitations

There are currently no known issues with the Autopilot Profiles page.  If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
