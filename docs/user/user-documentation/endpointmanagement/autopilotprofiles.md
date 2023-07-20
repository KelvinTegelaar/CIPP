---
id: autopilotprofiles
title: Autopilot Profiles
slug: /usingcipp/endpointmanagement/autopilotprofiles
description: Manage Autopilot profiles across your Microsoft 365 tenants.
---

# Autopilot Profiles

The following two pages in CIPP give you the ability to manage Autopilot Profiles:

### Add Profile

This page provides the ability for you to add Autopilot profiles, Autopilot deployment profiles are groups of settings you can deploy to devices. You can create various profile types with this Wizard.

#### Details <a href="#addprofile-details" id="addprofile-details"></a>

* Display Name
* Description
* Unique Name Template
* Convert all Targeted Devices to Autopilot
* Assign to all Devices
* Self-Deploying Mode
* Hide Terms and Conditions
* Hide Privacy Settings
* Hide Change Account Options
* Setup User as Standard User (Leave unchecked to setup user as a local administrator)
* White Glove OOBE
* Automatically Configure Keyboard

#### Known Issues / Limitations <a href="#addprofile-knownissues" id="addprofile-knownissues"></a>

You can only assign one profile to "All Devices"



### List Profiles

This page lists all the profiles that exist on the selected tenant, with a brief overview of some configured settings.

#### Details <a href="#listprofiles-details" id="listprofiles-details"></a>

| Field                | Description                                         |
| -------------------- | --------------------------------------------------- |
| Name                 | The name of the policy.                             |
| Description          | The profile description.                            |
| Language             | The language the profile configures on the machine. |
| Convert to Autopilot | Converts targeted devices to use Autopilot.         |
| Device Name Template | The device name template for the policy.            |

#### Actions <a href="#listprofiles-actions" id="listprofiles-actions"></a>

* View JSON - _Show all the options and their selected settings, in JSON format._

#### &#x20;<a href="#listprofiles--knownissues" id="listprofiles--knownissues"></a>
