---
description: >-
  This page displays options for editing the user's properties, license
  assignment, password reset, and group memberships.
---

# Edit User

***

### Getting Started

* **Navigate to:** Identity Management > Administration > Users
* Select a user > Click **Edit User** in the **Actions** menu
* You will be landed on the "**Edit User**" tab.

### Page Layout

**Header Information** on this page displays the user's Display Name, their User Principal Name (with copy option), their User ID (with copy option, the Account Creation Date, and a button to launch Entra to view the user.

### Basic Information

1. **User Identity:** `First Name`, `Last Name`, `Display Name`, `Username` (before the @ symbol), `Primary Domain name` (select from dropdown)
2. **Professional Details:** `Job Title`, `Department`, `Company Name`
3. **Contact Details:** `Street Address`, `Postal Code`, `Mobile Phone`, `Business Phone`, `Alternate Email Address`
4. **Management:** `Set Manager` (select from existing users), `Copy groups from another user`

### Account Settings

1. **Password Options**
   * `Create password manually` (toggle)
     * When `enabled`: Enter custom password
     * When `disabled`: System generates secure password
   * `Require password change at next logon` (toggle)
2. **Location Settings**
   * `Usage Location` (required for licensing)
   * Select `country` from dropdown

### License Management

* **Current Licenses**
  * Shows currently assigned licenses
  * Drop down box allows you to multi-select the licenses you want the user to have after editing
  * Option to remove all licenses (toggle) - When removing the final license on a user, this must be checked.
* **SherWeb Integration** (if enabled)
  * Auto-purchase option appears when licenses unavailable
  * Select license SKU for purchase
  * System handles purchase and assignment

### Group Management

* Copy groups from user
  * Allows you to select another Entra ID user to copy groups from&#x20;
* Add to Groups
  * Multi-select dropdown that will allow you to add the user to groups
* Remove from Groups
  * Multi-select dropdown that will allow you to remove the user from groups

### **Custom Attributes**

* Custom attributes can be configured in **Preferences > General Settings**
* These include specific Azure AD attributes that will be available when creating new users:
* **Available Attributes:** `consentProvidedForMinor`, `employeeId`, `employeeHireDate`, `employeeLeaveDateTime`, `employeeType`, `faxNumber`,`legalAgeGroupClassification`, `officeLocation`, `otherMails`, `showInAddressList`, `state`
* **Configuration:**
  * Go to **Preferences** page under your user profile.
  * Under **General Settings**
  * Find **Added Attributes when creating a new user**
  * Select desired attributes from dropdown
  * Selected attributes will appear on **Add User** form

### Notes

* Changes take effect immediately upon saving
* License changes require valid usage location
* Password resets follow complexity requirements
* Group membership changes are processed in order (removals then additions)
* On-premises synced accounts show warning about limited editability

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
