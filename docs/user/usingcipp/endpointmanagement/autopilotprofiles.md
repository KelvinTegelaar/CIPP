---
id: autopilotprofiles
title: Autopilot Profiles
description: Manage Autopilot profiles across your Microsoft 365 tenants.
slug: /usingcipp/endpointmanagement/autopilotprofiles
---

## Overview

There are two main pages related to Autopilot Profiles in CIPP.

### Add Profile - Overview

This page will allow you to add Autopilot profiles, Autopilot profiles allow you to setup devices exactly how you want them. You can create multiple profiles with this Wizard.

#### Add Profile - Details

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

#### Add Profile - Known Issues / Limitations

You can only assign one profile to "All Devices"

**400** - You've entered incorrect data, check the information and try again. You might already have one policy pointed at the "All Devices" group.

If you have any other issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

--- 

### List Profiles - Overview

This page allows you to list all the profiles that exist on the selected tenant, with a brief overivew of some of the settings.  

#### List Profiles - Detail

|  Field                 | Description                                          |
| -----------------------| ---------------------------------------------------  |
| Name                   | The name of the policy.                              |
| Description            | The profile description.                             | 
| Language               | The language the profile configures on the machine.  |
| Convert to Autopilot   | Converts targeted devices to use Autopilot.          |
| Device Name Template   | The device name template for the policy.             |

#### List Profiles - Actions

* View JSON - *Show all the options and their selected settings, in JSON format.*

#### List Profiles - Known Issues / Limitations

There are no known issues with the List Profiles page. If you have any issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
