---
id: onedrive
title: OneDrive
description: View OneDrive information for users in your Microsoft 365 tenants.
slug: /usingcipp/teamsonedrivesharepoint/onedrive
---

:::caution Anonymous Data
The data returned by this API might be pseudonymised. Run the [standard "Enable Usernames instead of pseudo anonymised names in reports"](../../tenantadministration/standards/) to prevent this.
:::

## Overview

This page can be used to report on OneDrive and SharePoint usage. This usage allows you to check how well implementation is going and if users are actively using their OneDrive and Sharepoint sites. You can also see if users have received maximum file usage or not.

## Detail

|  Fields                | Description                                             |
| -----------------------| ------------------------------------------------------- |
| Name                   | The name of the user.                                   |
| UPN                    | The UserPrincipalName of the user.                      | 
| Last Active            | The date the OneDrive was last active for the user.     |
| File Count (Total)     | The total number of files in the users' OneDrive.       |
| Used (GB)              | The total size in GB in the users' OneDrive.            |
| Allocated (GB)         | The total space in GB available in the users' OneDrive. |

## Known Issues / Limitations

There are no known issues with the OneDrive page.  If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
