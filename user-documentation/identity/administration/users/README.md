---
description: Interact with Microsoft 365 users.
---

# Users

User management. Equal to and extending [Microsoft 365 admin center > Active Users](https://admin.microsoft.com/Adminportal/Home#/users).

### Overview

The main table provides an overview of information including display name, email address, licensing, enabled/disabled status, and if the account is AD synchronized. Behind the ellipsis menu user creation date, last sync date, and user GUID are also available.

### Actions

{% content-ref url="bulk-add.md" %}
[bulk-add.md](bulk-add.md)
{% endcontent-ref %}

{% content-ref url="invite.md" %}
[invite.md](invite.md)
{% endcontent-ref %}

{% content-ref url="add.md" %}
[add.md](add.md)
{% endcontent-ref %}



### Per-User Actions:

| Field                            | Description                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 👁 View User                     | Display advanced user account details. \[[More information](./#view-user-details)]                                                                                                          |
| ✏️Edit User                      | Allows editing user details, same as user edit view from Microsoft 365 admin. Additionally, you can copy group membership to the target user from another active user.                      |
| Research Compromised Account     | Single pane of glass review of common indicators of compromise (IoC) \[[More information](./#research-compromised-account)]                                                                 |
| Create Temporary Access Password | Create a temporary password to allow full passwordless enrollment. \[[More information](./#create-temporary-access-password)]                                                               |
| Re-require MFA registration      | Sets user legacy MFA status to **Enabled**                                                                                                                                                  |
| Send MFA Push                    | Sends an MFA approval prompt to a user's registered devices. A simple way to verify functionality.                                                                                          |
| Set Per-User MFA                 | Sets the per-user MFA state for the selected user(s). Available options are "Enforced", "Enabled", or "Disabled".                                                                           |
| Convert to Shared Mailbox        | Convert a mailbox to shared.                                                                                                                                                                |
| Enable Online Archive            | Enables the online archive for this user's mailbox.                                                                                                                                         |
| Set Out of Office                | Set an out of office message for the user or shared mailbox. **Note:** _Setting a different internal and external autoreply is currently not supported_                                     |
| Disable Out of Office            | Disables out of office message for the user or shared mailbox.                                                                                                                              |
| Add to Group                     | Add user to a group.                                                                                                                                                                        |
| Disable Email Forwarding         | Disables all email forwarding set both ForwardingAddress and ForwardingSMTPAddress to $null                                                                                                 |
| Pre-provision OneDrive           | This will start the provisioning of the user's OneDrive without a need for the user's first login.                                                                                          |
| Add OneDrive Shortcut            | Adds a OneDrive shortcut in the root of the users OneDrive to a SharePoint site.                                                                                                            |
| Block Sign In                    | Disable account sign in.                                                                                                                                                                    |
| Unblock Sign In                  | Enable account sign in.                                                                                                                                                                     |
| Reset Password (Must Change)     | Reset account password to a random value (Example: `2WcAu%VMy89P`) and require user to set a new password on login.                                                                         |
| Reset Password                   | Reset account password to a random value (Example: `2WcAu%VMy89P`).                                                                                                                         |
| Clear Immutable ID               | Sets the user's onPremisesImmutableId to $null to break the sync of the object from on-premises Active Directory.                                                                           |
| Revoke all user sessions         | Revoke all sessions, requiring user to sign in again.                                                                                                                                       |
| Delete User                      | Delete user account.                                                                                                                                                                        |
| More info                        | Opens the Extended Info flyout panel for the user which shows some of the more common profile fields for the user. The other per-user actions are also listed at the bottom of this window. |

{% hint style="info" %}
Note that clicking one of these actions will present a confirmation modal dialog.
{% endhint %}

#### View user details

Displays details about the user account.

* Azure AD user attributes (Names, Job Title, Address, Phone)
* Last sign in details
* Sign in logs
* Conditional access details
* Email usage
* OneDrive usage
* Email settings
* Devices
* Groups

#### Research Compromised Account

The _Business Email Compromise Overview_ retrieves common data used when reviewing a possibly-compromised account.

{% hint style="info" %}
For more in-depth analysis, [Hawk](https://cloudforensicator.com/) is well-regarded.
{% endhint %}

Data Retrieved

* User devices (including first sync time)
* Recently added email forwarding rules
* Recently added users
* User last logon details
* Recent password changes
* Mailbox permission changes
* Application changes
* Mailbox logons

If an account appears compromised, **Remediate User** performs the following actions:

* Block user signin
* Reset user password
* Disconnect all current sessions
* Disable all inbox rules for the user

#### Create Temporary Access Password

Create a temporary access password for a user to enroll in [passwordless for Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/authentication/concept-authentication-passwordless).

{% hint style="info" %}
Both passwordless authentication and the temporary access password function must be enabled on the tenant. See [AzureAD: Configure Temporary Access Pass in Azure AD to register Passwordless authentication methods](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-temporary-access-pass)
{% endhint %}

### Query String Support

The Add User has the ability to be form filled via URL query strings. This table shows all supported query strings. For example https://yourcipp.app/identity/administration/users/add?customerId=Mydomain.onmicrosoft.com\&city=Rotterdam would automatically fill in the city for a user.

| QueryString    | Field                                                     |
| -------------- | --------------------------------------------------------- |
| customerId     | Client Tenant ID(Only required field)                     |
| businessPhones | Business Phone Number                                     |
| city           | User City Location                                        |
| companyName    | Company Name                                              |
| country        | Country                                                   |
| department     | Department                                                |
| displayName    | Display Name                                              |
| givenName      | First Name                                                |
| jobTitle       | Job Title                                                 |
| mailNickname   | Username before the email address part(User<@domain.com>) |
| mobilePhone    | Mobile Phone Number                                       |
| addedAliasses  | Added Aliasses, Multiple allowed via linebreak(%0A)       |
| postalCode     | Zip or post code                                          |
| streetAddress  | Address information                                       |
| surname        | Last Name                                                 |
| usageLocation  | User location for license, can be left blank for default. |
| primDomain     | User Primary Domain (User<@domain.com>)                   |
| MustChangePass | Boolean, default is false.                                |

#### AutoTask LiveLink

If you want to create your own LiveLink you can use the QueryString below.

{% code overflow="wrap" %}
```
?city=<CITY>&country=<COUNTRY>&customerId=<UDF-TenantId(tblCustomers)>&primDomain=<ACCOUNTWEBSITEADDRESS>&usageLocation=NL&streetAddress=<ACCOUNTADDRESS1>&companyName=<ACCOUNTNAME>&businessPhones=<ACCOUNTPHONE>&postalCode=<ACCOUNTPOSTALCODE>&givenName=<CONTACTFIRSTNAME>&surname=<CONTACTLASTNAME>
```
{% endcode %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
