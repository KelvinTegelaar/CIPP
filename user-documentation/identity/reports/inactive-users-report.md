# Inactive Users



The report indicates whether inactive users have licenses assigned. It examines both interactive and non-interactive sign-in dates to determine this. This page lists all inactive users in the tenant who have not logged in for 180 days or more.

### Table Columns

|                                        |                                                                                                                                                                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                                     | The GUID of the tenant concatenated with the GUID of the user separated by an underscore                                                                                                                                                           |
| Tenant ID                              | GUID of the tenant                                                                                                                                                                                                                                 |
| Tenant Display Name                    |                                                                                                                                                                                                                                                    |
| Azure Ad User Id                       | GUID of the user                                                                                                                                                                                                                                   |
| Display Name                           | User's display name                                                                                                                                                                                                                                |
| User Principal Name                    | User's UPN                                                                                                                                                                                                                                         |
| User Type                              | User type of "Member", "Guest", or "SharedMailbox"                                                                                                                                                                                                 |
| Created Date Time                      | Relative time since the account was created                                                                                                                                                                                                        |
| Number of Assigned Licenses            |                                                                                                                                                                                                                                                    |
| Last Refreshed Date Time               | Relative time since the last refresh on the login statistics                                                                                                                                                                                       |
| Last Sign In Date Time                 | Relative time since the last login                                                                                                                                                                                                                 |
| Last Non Interactive Sign In Date Time | Relative time since the last non interactive sign in. For more information on what a non interactive sign in is, please see [Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-noninteractive-sign-ins). |

### Per-User Actions

|               |                                                                    |
| ------------- | ------------------------------------------------------------------ |
| View User     | Opens the CIPP user page for the selected user                     |
| Edit User     | Opens the CIPP edit user page for the selected user                |
| Block Sign In | Opens a modal to confirm if you want to block sign in for the user |
| Delete User   | Opens a modal to confirm if you want to delete the user            |
| More Info     | Opens Extended Info flyout                                         |

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
