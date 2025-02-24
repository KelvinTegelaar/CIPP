# Sherweb

{% hint style="info" %}
**Current Status: General Availability**

* Available to all CIPP users
* Best suited for existing Sherweb partners
* Requires CIPP version 7.0 or higher
* New to Sherweb? Visit [SherWeb Cloud Services for MSPs](https://www.sherweb.com/partners/)
{% endhint %}

## **Overview**

The Sherweb integration enables you to manage your Microsoft 365 licenses and subscriptions directly within CIPP. This means you can handle all your licensing needs from one place, making it easier to manage users and their licenses across your organization.

## Key Features

### License Management

* Purchase new licenses when adding users
* Increase or decrease license quantities as needed
* Automatic license handling during user creation and removal
* Monitor license usage through CIPP's reporting
* Perform bulk license changes across multiple users

### Coming Soon (Q1 2025)

1. **Automated CSP Migration**
   * Seamlessly move from your old CSP to SherWeb
   * Automatic license transfer handling
   * No service interruption for your users
2. **Scheduled License Management**
   * Set up temporary license increases or decreases
   * Perfect for seasonal staff or short-term projects
   * Automatic reversal of changes on schedule

## Setting Up the Integration

### Prerequisites

You should have **an active Sherweb partner account**, and access to the **Cumulus portal**. You'll need to enable API access and collect three pieces of information from Sherweb.

### Getting Your API Credentials

1. Go to the SherWeb Cumulus Portal and log in to your account: `https://cumulus.sherweb.com/partners/cippcumulus/security/apis`
2. Create a new application (you can name it "CIPP")
3. Copy the below three keys and store them securely (password manager, IT documentation, etc.)
   * **Client ID:** This is a unique identifier for your application within Sherweb.
   * **Subscription Key:** This key is used to access the Sherweb API.
   * **Client Secret (API Key):** This is a secret key used for authenticating your application.

## Configuration Steps

{% hint style="info" %}
If you're self-hosted, ensure that your deployed instance of CIPP is running version 7 or later, as that is required for access to this integration.
{% endhint %}

1. Navigate to **CIPP > Integrations**
2. Find and click on the **Sherweb** card
3. Enable the integration using the toggle switch
4. **Enter API Credentials** from your **Sherweb Cumulus Account** in the relevant fields.
5. **Custom Roles for License Purchase:** (Optional)
   * If required, use the autocomplete field to select [custom roles](../advanced/super-admin/custom-roles.md) allowed to purchase licenses. This allows you to specify which CIPP users with particular roles can use the purchase licenses functionality on the onboarding wizards & report pages.
6. **Save Configuration:** Ensure that you save the configuration by pressing Submit.

### Mapping Your Tenants

To connect your Microsoft 365 tenants with their Sherweb accounts, you'll need to map them together. This tells CIPP which Sherweb customer account corresponds to each tenant.

{% hint style="info" %}
Always review the matches before saving to ensure accuracy.
{% endhint %}

#### **Automated Mapping:**

1. Click "Automap SherWeb Organizations" to automatically match tenants
2. The system attempts to match based on:
   * Exact name matches between CIPP tenants and SherWeb customers
   * Similar name patterns
   * Domain information when available
3. Review the automated matches in the mapping table
4. Make any necessary manual adjustments
5. Click **Save Mappings** to finalize the mappings

#### **Manual Mapping:**

1. Select a tenant from the dropdown
2. Select the corresponding SherWeb organization
3. Click the + button to add the mapping
4. Repeat for additional tenants
5. Click **Save Mappings** to finalize

***

{% include "../../../.gitbook/includes/feature-request.md" %}
