---
description: >-
  The Add User page provides an interface for creating new user accounts in your
  tenant.
---

# Add User

{% hint style="info" %}
This page will allow you to set all of the necessary properties to create a single new user. You can start with a blank slate or select to copy properties from another user in the top dropdown to speed up account creation.
{% endhint %}

## Getting Started

1. Navigate to: **Identity Management > Administration > Users**
2. **Click Add User**
3. Choose your starting point:
   * Start with blank form
   * Use "Copy properties from another user" dropdown to pre-fill fields

{% hint style="info" %}
When using the **Copy properties from another user** dropdown, the specific fields that get copied are: `givenName`, `surname`, `jobTitle`, `department`, `streetAddress`, `postalCode`, `companyName`, `mobilePhone`, `businessPhones`, `usageLocation`
{% endhint %}

## Available Settings

### Basic Information

1. **User Identity:** `First Name`, `Last Name`, `Display Name`, `Username` (before the @ symbol), `Primary Domain name` (select from dropdown)
2. **Email Aliases:**  Add multiple email aliases one per line without domain (added automatically)

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

1. **License Assignment:** Allows you to select license(s) to assign & shows available license count
2. **SherWeb Integration** (if enabled): Auto-purchase option appears when licenses unavailable, allows you to select license SKU for purchase for system to handle for you along with onboarding.

{% hint style="info" %}
When [SherWeb integration](../../../cipp/integrations/sherweb.md) is enabled and a license shows "(0 available)", you'll see an alert stating: "_This will Purchase a new Sherweb License for the user, according to the terms and conditions with Sherweb. When the license becomes available, CIPP will assign the license to this user."_
{% endhint %}

### Contact Information

1. **Professional Details:** `Job Title`, `Department`, `Company Name`
2. **Contact Details:** `Street Address`, `Postal Code`, `Mobile Phone`, `Business Phone`, `Alternate Email Address`
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

### Additional Details

* License assignment requires valid usage location
* Password complexity rules apply to manual passwords
* Group copying includes all accessible groups
* Scheduled creation can be monitored in tasks

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
