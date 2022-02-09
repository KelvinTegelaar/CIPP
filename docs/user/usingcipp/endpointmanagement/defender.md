---
id: defender
title: Defender Status
description: Deploy applications using the Chocolatey package manager.
slug: /usingcipp/endpointmanagement/defender
---

## Overview

This page lists the defender status for all enrolled machines in a tenant, such as whether the device is clean, has certain services enabled and the status of scans.  There is also a status about whether action is required for a device.

## Detail

|  Field                     | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| Device Name                | The name of the device.                                 |
| Malware Protection         | Whether malware protection is enabled on the device.    | 
| Real Time Protection       | Whether real time protection is enabled on the device.  |
| Network Inspection         | Whether network inspection is enabled on the device.    |
| Last Reported Health State | The last reported health state of the device.           |
| Quick Scan Overdue         | Whether the quick scan is overdue.                      |
| Full Scan Overdue          | Whether the full scan is overdue.                       |
| Signature Update Required  | Whether signature updates are required.                 |
| Reboot Required            | Whether a reboot is required.                           |
| Attention Required         | Whether attention is required to resolve issues.        |


## Known Issues / Limitations

* You must be a current Microsoft Lighthouse partner, and your tenants must be onboarded before you can use this.
* The UI is somewhat mixed currently, as for example, it reports a "red cross - danger" warning if a Signature Update is **NOT** required.  This should arguably be a green tick.

If you have any other issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
