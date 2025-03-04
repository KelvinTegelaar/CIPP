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

### Account Management Actions

| Action       | Description                                                                                                                                    | Requirements/Implications                                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 👁 View User | Displays comprehensive user account details in the admin interface                                                                             | <p>- Read access to user objects<br>- Shows all available user information<br>- Display advanced user account details. [<a href="user/">More information</a>]</p> |
| ✏️ Edit User | <p>Modifies user account details and settings:<br>- Basic information<br>- License assignments<br>- Group memberships<br>- Contact details</p> | <p>- Write access to user objects<br>- Can copy group memberships from another user<br>- Changes apply immediately</p>                                            |
| Delete User  | Permanently removes user account                                                                                                               | <p>- Administrative privileges required<br>- Irreversible action<br>- Consider backup/archival first</p>                                                          |

### Security Actions

| Action                           | Description                                                                                                      | Requirements/Implications                                                                                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Research Compromised Account     | <p>Analyzes Indicators of Compromise (IoC):<br>- Sign-in patterns<br>- Mail rules<br>- Suspicious activities</p> | <p>- Security admin rights<br>- Provides comprehensive security review<br>- Single pane of glass review of common indicators of compromise (IoC) [<a href="user/bec.md">More information</a>]</p>                                         |
| Create Temporary Access Password | Creates temporary password for passwordless enrollment                                                           | <p>- Time-limited access<br>- Create a temporary password to allow full passwordless enrollment. [<a href="./#create-temporary-access-password">More information</a>]</p>                                                                 |
| Re-require MFA registration      | <p>Forces new MFA setup by:<br>- Resetting MFA status to Enabled<br>- Requiring new registration</p>             | <p>- User must complete new MFA setup<br>- Affects all MFA methods<br>- Authentication Methods must be migrated from legacy<br>- You will need Security Defaults or a CA policy and registration campaign to force registration again</p> |
| Send MFA Push                    | Sends test MFA prompt to user's devices                                                                          | <p>- Verifies MFA configuration<br>- Tests user's registered devices</p>                                                                                                                                                                  |
| Set Per-User MFA                 | <p>Configures MFA state:<br>- Enforced<br>- Enabled<br>- Disabled</p>                                            | <p>- Overrides tenant-level settings<br>- Immediate effect on sign-ins</p>                                                                                                                                                                |
| Block Sign In                    | Prevents account access                                                                                          | <p>- Immediate effect<br>- Doesn't affect existing sessions</p>                                                                                                                                                                           |
| Unblock Sign In                  | Restores account access                                                                                          | <p>- Immediate effect<br>- User can sign in again</p>                                                                                                                                                                                     |
| Revoke all user sessions         | Forces re-authentication on all devices                                                                          | <p>- Terminates all active sessions<br>- Requires new sign-in everywhere</p>                                                                                                                                                              |

### Password Management

| Action                       | Description                            | Requirements/Implications                                                              |
| ---------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------- |
| Reset Password (Must Change) | Sets random password and forces change | <p>- User must create new password at next login<br>- Example format: 2WcAu%VMy89P</p> |
| Reset Password               | Sets new random password               | <p>- Password immediately active<br>- No change requirement</p>                        |

### Mail and Communication

| Action                    | Description                            | Requirements/Implications                                                                                                                                                               |
| ------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Convert to Shared Mailbox | Transforms user mailbox to shared type | <p>- Requires Exchange Online license<br>- Maintains data and access</p>                                                                                                                |
| Enable Online Archive     | Activates archival mailbox             | <p>- Requires appropriate license<br>- Additional storage space</p>                                                                                                                     |
| Set Out of Office         | Configures automatic replies           | <p>- Single message for internal/external<br>- No HTML formatting<br><strong>Note:</strong> <em>Setting a different internal and external autoreply is currently not supported</em></p> |
| Disable Out of Office     | Removes automatic replies              | <p>- Immediate effect<br>- Clears all auto-reply settings</p>                                                                                                                           |
| Disable Email Forwarding  | Removes all email forwarding rules     | <p>- Clears ForwardingAddress<br>- Clears ForwardingSMTPAddress</p>                                                                                                                     |

### OneDrive Management

| Action                 | Description                      | Requirements/Implications                                      |
| ---------------------- | -------------------------------- | -------------------------------------------------------------- |
| Pre-provision OneDrive | Initializes OneDrive storage     | <p>- No user login required<br>- Speeds up first access</p>    |
| Add OneDrive Shortcut  | Creates SharePoint site shortcut | <p>- Adds to OneDrive root<br>- Requires existing OneDrive</p> |

### Group and Directory Management

| Action             | Description                        | Requirements/Implications                                                        |
| ------------------ | ---------------------------------- | -------------------------------------------------------------------------------- |
| Add to Group       | Assigns user to specified group(s) | <p>- Immediate membership<br>- Inherits group permissions</p>                    |
| Clear Immutable ID | Breaks on-premises AD sync         | <p>- Sets onPremisesImmutableId to null<br>- Stops directory synchronization</p> |

### Information Access

| Action    | Description                                                                                  | Requirements/Implications                                                     |
| --------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| More info | <p>Opens Extended Info panel showing:<br>- Common profile fields<br>- Additional actions</p> | <p>- Quick access to key information<br>- Alternative action access point</p> |

{% hint style="info" %}
Note that clicking one of these actions will present a confirmation modal dialog.
{% endhint %}

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

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
