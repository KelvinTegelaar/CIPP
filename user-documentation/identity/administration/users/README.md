---
description: Interact with Microsoft 365 users.
---

# Users

User management. Equal to and extending [Microsoft 365 admin center > Active Users](https://admin.microsoft.com/Adminportal/Home#/users).

## Action Buttons

<details>

<summary>Add User</summary>

**Basic Information:**

1. **User Identity:** `First Name`, `Last Name`, `Display Name`, `Username` (before the @ symbol), `Primary Domain name` (select from dropdown)
2. **Email Aliases:**  Add multiple email aliases one per line without domain (added automatically)

**Account Settings**

1. **Password Options**
   * `Create password manually` (toggle)
     * When `enabled`: Enter custom password
     * When `disabled`: System generates secure password
   * `Require password change at next logon` (toggle)
2. **Location Settings**
   * `Usage Location` (required for licensing)
   * Select `country` from dropdown

**License Management**

1. **License Assignment:** Allows you to select license(s) to assign & shows available license count
2. **SherWeb Integration** (if enabled): Auto-purchase option appears when licenses unavailable, allows you to select license SKU for purchase for system to handle for you along with onboarding.

{% hint style="info" %}
When the [sherweb.md](../../../cipp/integrations/sherweb.md "mention")integration is enabled and a license shows "(0 available)", you'll see an alert stating: "_This will Purchase a new Sherweb License for the user, according to the terms and conditions with Sherweb. When the license becomes available, CIPP will assign the license to this user."_
{% endhint %}

**Contact Information**

1. **Professional Details:** `Job Title`, `Department`, `Company Name`
2. **Contact Details:** `Street Address`, `City`, `State/Province`, `Postal Code`, `Mobile Phone`, `Business Phone`, `Alternate Email Address`
3. **Management:** `Set Manager` (select from existing users), `Copy groups from another user`
4. **Custom Attributes**
   * Custom attributes can be configured in **Preferences > General Settings**
   * These include specific Azure AD attributes that will be available when creating new users:
   * **Available Attributes:** `consentProvidedForMinor`, `employeeId`, `employeeHireDate`, `employeeLeaveDateTime`, `employeeType`, `faxNumber`,`legalAgeGroupClassification`, `officeLocation`, `otherMails`, `showInAddressList`, `state`
   * **Configuration:**
     * Go to **Preferences** page under your user profile.
     * Under **General Settings**
     * Find **Added Attributes when creating a new user**
     * Select desired attributes from dropdown
     * Selected attributes will appear on **Add User** form

{% hint style="info" %}
**Notes about Custom Attributes:**

* Attributes selected will appear as additional fields on the Add User form
* Each attribute has its own text field
* Values are saved with the user's profile in Azure AD
* Must be configured before they appear on the form.&#x20;
* Attributes are standard Azure AD attributes
* Values persist in Azure AD and can be queried/updated later
* Not all attributes may be relevant for every user
* Changes to Preferences affect all new user creation forms
{% endhint %}

**Additional Details**

* License assignment requires valid usage location
* Password complexity rules apply to manual passwords
* Group copying includes all accessible groups
* Scheduled creation can be monitored in tasks

</details>

<details>

<summary>Bulk Add Users</summary>

This wizard will allow you to bulk create new users.&#x20;

1. Usage Selection - This is the usage location for the users to create
2. User Selection - There is an example CSV on the User Selection step of the wizard that you can use to speed up larger bulk creation tasks. Alternatively, you can add individual rows one by one by pressing the "Add User Manually" action just above the table prior to moving to Step 3.
3. Create Users - Click this button to submit your users.

</details>

<details>

<summary>Invite Guest</summary>

This will allow you to add a guest user. Enter the user's "Display Name", "E-mail Address", and an optional "Redirect URL". Toggle the "Send invite via e-mail" option on if you'd like the guest user to receive a Microsoft generated invite e-mail.

</details>

<details>

<summary>Bulk Invite Guests</summary>

This wizard will allow you to bulk create new guest users.&#x20;

1. Send invite via e-mail - Toggling this controls whether the standard Microsoft guest user invite will be sent.
2. Guest User Selection - There is an example CSV on the User Selection step of the wizard that you can use to speed up larger bulk creation tasks. Alternatively, you can add individual rows one by one by pressing the "Add User Manually" action just above the table prior to moving to Step 3.
3. Send Invites - Click this button to submit your users.

</details>

## Table Columns

The properties returned are for the Graph resource type `user`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/user?view=graph-rest-1.0#properties).

## Table Actions

### Account Management Actions

<table><thead><tr><th>Action</th><th>Description</th><th>Requirements/Implications</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>👁 View User</td><td>Displays comprehensive user account details in the admin interface</td><td>- Read access to user objects<br>- Shows all available user information<br>- Display advanced user account details. [<a href="user/">More information</a>]</td><td>false</td></tr><tr><td>✏️ Edit User</td><td>Modifies user account details and settings:<br>- Basic information<br>- License assignments<br>- Group memberships<br>- Contact details</td><td>- Write access to user objects<br>- Can copy group memberships from another user<br>- Changes apply immediately</td><td>false</td></tr><tr><td>Delete User</td><td>Permanently removes user account</td><td>- Administrative privileges required<br>- Irreversible action<br>- Consider backup/archival first</td><td>true</td></tr><tr><td>Edit Properties</td><td>Bulk update user properties via the <a data-mention href="patch-wizard.md">patch-wizard.md</a></td><td></td><td>true</td></tr></tbody></table>

### Security Actions

<table><thead><tr><th>Action</th><th>Description</th><th>Requirements/Implications</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Research Compromised Account</td><td>Analyzes Indicators of Compromise (IoC):<br>- Sign-in patterns<br>- Mail rules<br>- Suspicious activities</td><td>- Security admin rights<br>- Provides comprehensive security review<br>- Single pane of glass review of common indicators of compromise (IoC) [<a href="user/bec.md">More information</a>]</td><td>false</td></tr><tr><td>Create Temporary Access Password</td><td>Creates temporary password for passwordless enrollment</td><td>- Time-limited access<br>- Create a temporary password to allow full passwordless enrollment. [<a href="./#create-temporary-access-password">More information</a>]</td><td>true</td></tr><tr><td>Re-require MFA registration</td><td>Forces new MFA setup by:<br>- Resetting MFA status to Enabled<br>- Requiring new registration</td><td>- User must complete new MFA setup<br>- Affects all MFA methods<br>- Authentication Methods must be migrated from legacy<br>- You will need Security Defaults or a CA policy and registration campaign to force registration again</td><td>true</td></tr><tr><td>Send MFA Push</td><td>Sends test MFA prompt to user's devices</td><td>- Verifies MFA configuration<br>- Tests user's registered devices</td><td>true</td></tr><tr><td>Set Per-User MFA</td><td>Configures MFA state:<br>- Enforced<br>- Enabled<br>- Disabled</td><td>- Overrides tenant-level settings<br>- Immediate effect on sign-ins</td><td>true</td></tr><tr><td>Set Sign In State</td><td>Allows you to set the sign in state for the selected user(s) to either Enabled or Disabled</td><td>- Immediate effect<br>- Doesn't affect existing sessions</td><td>true</td></tr><tr><td>Revoke all user sessions</td><td>Forces re-authentication on all devices</td><td>- Terminates all active sessions<br>- Requires new sign-in everywhere</td><td>true</td></tr></tbody></table>

### Password Management

<table><thead><tr><th>Action</th><th>Description</th><th>Requirements/Implications</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Reset Password</td><td>Sets new random password. Optionally you can set the toggle for "Must Change Password at Next Logon"</td><td>- Password immediately active<br>- No change requirement</td><td>true</td></tr><tr><td>Set Password Expiration</td><td><p>Set password expiration state for this user. </p><p>If set to Enable then if the password of the user is older than the set expiration date of the organization, the user will be prompted to change their password at their next login.</p></td><td></td><td>true</td></tr></tbody></table>

### Mail and Communication

<table><thead><tr><th>Action</th><th>Description</th><th>Requirements/Implications</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Convert Mailbox</td><td>Transforms mailbox to selected type: <code>Shared</code>, <code>User</code>, <code>Room</code>, or <code>Equipment</code>.</td><td>- Requires Exchange Online license<br>- Maintains data and access</td><td>true</td></tr><tr><td>Enable Online Archive</td><td>Activates archival mailbox</td><td>- Requires appropriate license<br>- Additional storage space</td><td>true</td></tr><tr><td>Set Out of Office</td><td>Configures automatic replies</td><td>- Single message for internal/external<br>- No HTML formatting<br><strong>Note:</strong> <em>Setting a different internal and external autoreply is currently not supported</em></td><td>true</td></tr><tr><td>Disable Out of Office</td><td>Removes automatic replies</td><td>- Immediate effect<br>- Clears all auto-reply settings</td><td>true</td></tr><tr><td>Disable Email Forwarding</td><td>Removes all email forwarding rules</td><td>- Clears ForwardingAddress<br>- Clears ForwardingSMTPAddress</td><td>true</td></tr></tbody></table>

### OneDrive Management

<table><thead><tr><th>Action</th><th>Description</th><th>Requirements/Implications</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Pre-provision OneDrive</td><td>Initializes OneDrive storage</td><td>- No user login required<br>- Speeds up first access</td><td>true</td></tr><tr><td>Add OneDrive Shortcut</td><td>Creates SharePoint site shortcut</td><td>- Adds to OneDrive root<br>- Requires existing OneDrive</td><td>true</td></tr></tbody></table>

### Group and Directory Management

<table><thead><tr><th>Action</th><th>Description</th><th>Requirements/Implications</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Manage Licenses</td><td>Allows for bulk license management of the selected user(s)</td><td></td><td>true</td></tr><tr><td>Add to Group</td><td>Assigns user to specified group(s)</td><td>- Immediate membership<br>- Inherits group permissions</td><td>true</td></tr><tr><td>Clear Immutable ID</td><td>Breaks on-premises AD sync</td><td>- Sets onPremisesImmutableId to null<br>- Stops directory synchronization</td><td>true</td></tr><tr><td>Set Source of Authority</td><td>Allows you to select if the user should be "Cloud Managed" or "On-Premises Managed"</td><td></td><td>true</td></tr><tr><td>Reprocess License Assignments</td><td>This will force Entra to check the user's group assignments for any group-based license(s) to add/remove</td><td></td><td>true</td></tr></tbody></table>

### Information Access

<table><thead><tr><th>Action</th><th>Description</th><th>Requirements/Implications</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>More info</td><td>Opens Extended Info panel showing:<br>- Common profile fields<br>- Additional actions</td><td>- Quick access to key information<br>- Alternative action access point</td><td>false</td></tr></tbody></table>

{% hint style="info" %}
Note that clicking one of these actions will present a confirmation modal dialog.
{% endhint %}

### More Information on "Create Temporary Access Password"

Create a temporary access password for a user to enroll in [passwordless for Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/authentication/concept-authentication-passwordless).

{% hint style="info" %}
Both passwordless authentication and the temporary access password function must be enabled on the tenant. See [AzureAD: Configure Temporary Access Pass in Azure AD to register Passwordless authentication methods](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-temporary-access-pass)
{% endhint %}

## Add User Query String Support

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

## AutoTask LiveLink

If you want to create your own LiveLink you can use the QueryString below.

{% code overflow="wrap" %}
```
?city=<CITY>&country=<COUNTRY>&customerId=<UDF-TenantId(tblCustomers)>&primDomain=<ACCOUNTWEBSITEADDRESS>&usageLocation=NL&streetAddress=<ACCOUNTADDRESS1>&companyName=<ACCOUNTNAME>&businessPhones=<ACCOUNTPHONE>&postalCode=<ACCOUNTPOSTALCODE>&givenName=<CONTACTFIRSTNAME>&surname=<CONTACTLASTNAME>
```
{% endcode %}

***

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
