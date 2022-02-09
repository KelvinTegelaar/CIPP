---
id: applications
title: List Applications
description: Interact with Microsoft Endpoint Manager applications.
slug: /usingcipp/endpointmanagement/applications
---

## Overivew 

The List Applications page will show you a list of all non-store applications configured for deployment in Microsoft Endpoint Manager / Intune.

You can assign the application to All Users / All Devices from the more button.

## Details

|  Fields                    | Description                                                    |
| -------------------------- | -------------------------------------------------------------- |
| Name                       | The name of the application.                                   |
| Published                  | Whether or not the application is published.                   |
| Install Command            | The command to install the application.                        |
| Uninstall Command          | The command to uninstall the application.                      |
| Install As                 | How the app should be installed                                |
| Restart Behaviour          | Whether install of the app allows a restart                    | 
| Assigned to Groups         | List the groups that app is assigned to                        |
| Created At                 | Time the app was created                                       |
| Modified At                | Last time the app was modified                                 |
| Featured App               | Whether the app is a featured app in the portal                |
| # of Dependent Apps        | How many apps dependent apps are assigned to this application  |
| Detection Type             | Detection rule, if one exists                                  |
| Detetion File/Folder Name  | Detection Rule Folder Name Details                             |
| Detection File/Fother Path | Detection Rule Path details                                    |

### Actions

* Assign to All Users
* Assign to All Devices
* Assign Globally (All Users / All Devices)
* Delete Application


## Known Issues / Limitations

There are no known issues with the List Applications page. If you have any issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
