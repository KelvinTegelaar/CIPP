# Adding Tenants & Consenting the CIPP-SAM Application

## Overview

The Tenant Onboarding Wizard further simplifies the process of getting setup in CIPP by automatically connecting to any tenants found in your GDAP Relationships List to perform the background tasks necessary to manage a tenant in the system. Below is a list of the actions that are performed during Tenant Onboarding:

* Verification of GDAP Invite Accepted
* Confirmation that required roles are present.
* Ensures groups are correctly mapped to roles.
* Validates that permissions are updated via a CPV refresh
* Verifies Graph API connectivity and access.

{% hint style="danger" %}
CIPP requires its Service Account user to be a member of the specific security groups with the [recommended roles](../gdap/recommended-roles.md) assigned for proper functionality within your GDAP relationship. This step is completed during the [SAM Setup Wizard execution](../../user-documentation/cipp/sam-setup-wizard.md) prior to tenant onboarding.

If these roles are missing or the groups haven't been applied to the CIPP user, CIPP will not be able to access the tenant, resulting in errors such as: `invalid_grant:AADSTS65001: The user or administrator has not consented to use the application.`

`or`

`Send an interactive authorization request for this user and resource`
{% endhint %}

***

## Using the Tenant Onboarding Wizard

Navigate to `Tenant Administration` -> `Administration` -> `Tenant Onboarding` and click `Start Tenant Onboarding` to initiate the wizard.

### Step 1: Relationship Choice

* Choose the GDAP relationship(s) to onboard.
* Filter and select from the list of active relationships.

***

### Step 2: Onboarding Options

* Toggle on **Exclude this tenant from top-level standards** if needed. This means that only the standards you explicitly set for this tenant will be applied.
* Toggle on **Map missing groups to GDAP Roles**.
* Toggle on **Add CIPP SAM user to missing groups** if any required GDAP groups are missing.

<figure><img src="../../.gitbook/assets/image (2).png" alt=""><figcaption></figcaption></figure>

***

### Step 3: Tenant Onboarding

* Click **Next** and wait for the wizard to complete the onboarding steps.
* Review the onboarding status and logs to ensure successful completion of each step.

<figure><img src="../../.gitbook/assets/image (1) (1).png" alt=""><figcaption></figcaption></figure>

{% hint style="info" %}
To automate this process even further, enable Partner Webhooks in Application Settings and newly invited tenants will automatically onboard once accepted.
{% endhint %}

## Manual Steps

After adding a relationship, you can perform a [CPV refresh](../../troubleshooting/troubleshooting-instructions/refreshing-a-specific-tenants-permissions-via-cpv-api.md) via the following instructions. This also runs automatically each night

* Navigate to `CIPP` -> `Application Settings`
* Click on the `Tenants` tab
* Click on the blue refresh button next to the tenant. This will process all required permissions to that tenant.

{% hint style="info" %}
Tenants are cached for 24 hours within CIPP. To see a newly added Microsoft Tenant you can use the Settings -> Clear Tenant Cache button to clear the cache.
{% endhint %}
