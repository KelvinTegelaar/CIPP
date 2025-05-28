# Sherweb

{% hint style="info" %}
New to Sherweb? Visit [SherWeb Cloud Services for MSPs](https://www.sherweb.com/partners/)
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
   * If required, use the autocomplete field to select [custom roles](../advanced/super-admin/cipp-roles.md) allowed to purchase licenses. This allows you to specify which CIPP users with particular roles can use the purchase licenses functionality on the onboarding wizards & report pages.
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

### Automated Migrations

The **Automated Migrations** feature allows MSPs to identify, plan, and optionally execute license migrations from legacy CSPs to Sherweb through a scripted automation pipeline. This functionality is built around a flexible migration strategy, giving MSPs control over whether to just **notify**, **purchase**, or **cancel** legacy subscriptions — all based on real-time license matching.

#### What It Does

The migration function analyzes licenses that are:

* Within a **transferable window** (<= 7 days remaining),
* Active under a non-Sherweb CSP,
* And compares them with the licenses currently available at Sherweb.

Depending on the configured method, the script will either:

* **Notify** the MSP of required license migrations via email, PSA, and webhook alerts,
* **Automatically purchase** matching licenses from Sherweb,
* Or **cancel** the old subscriptions entirely.\\

Matching is currently done based on subscription and SKUIds, these will be improved in the future when Sherweb supplies more information about SKUs. If any part of the process fails you will automatically receive an email with the latest status.

#### Automated migration setup

1. **Toggle “Enable automated migration to Sherweb”**
   * This activates the automated migration system
   * Additional options will appear based on your selections
2. **Choose a Migration Strategy**
   * Under **“Select how you'd like automated migrations to be handled”**, pick one:
     * &#x20;**Notify only** — Get alerts when subscriptions are eligible for migration (but take no action)
     * **Buy and notify** — Automatically purchase the matching license from Sherweb, and notify
     * **Buy and cancel** — Automatically purchase Sherweb licenses _and_ cancel the old CSP license
3. **(Optional) Select Vendor to Migrate From**
   * This option appears if you chose **Buy and cancel**
   * Currently supports:
     * Pax8
4. **(Optional) Set License Type to Migrate To**
   * If you selected any method containing **Buy**, select:
     * `Yearly` (`Y1Y`)
     * `Annual paid monthly` (`M1Y`)
     * `Monthly` (`M2M`)
5. **(If migrating from Pax8)** Enter Pax8 API Credentials:
   * Pax8 Client ID
   * Pax8 Client Secret

{% hint style="danger" %}
We recommend to only enable automated migrations after extensive testing - please set your automated migration strategy to "Notify" for atleast one month before executing automated buys. Neither Sherweb nor CyberDrain is responsible for purchaces made through the API.
{% endhint %}

***

#### 🔔 What Happens Next?

Once enabled:

* CIPP will monitor tenants for licenses nearing their transfer window.
* Based on your migration strategy:
  * You’ll receive alerts via email, PSA, or webhook
  * Licenses may be automatically purchased
  * Legacy subscriptions may be canceled via Pax8's API (if configured)



### Scheduled license removal/additions

Using the task scheduler you can add/remove licenses now, this allows you to easily add/decrease the amount of licenses assigned to a tenant. To create a scheduled task for this do the following:

* Go to Tools -> Scheduler.
* In the scheduler click on Add Job
* Select the option "Set-CIPPSherwebLicense"
* Choose the options you'd like to use, such as adding a license, removing, or changing the quantity.
* Choose the dates, and click on "Add Schedule"

***

{% include "../../../.gitbook/includes/feature-request.md" %}
