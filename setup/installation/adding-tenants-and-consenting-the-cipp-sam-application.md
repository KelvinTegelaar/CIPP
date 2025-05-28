# Adding Tenants & Consenting the CIPP-SAM Application

## Overview

The Tenant Onboarding Wizard further simplifies the process of getting setup in CIPP by automatically connecting to any tenants found in your GDAP Relationships List to perform the background tasks necessary to manage a tenant in the system. Below is a list of the actions that are performed during Tenant Onboarding:

* Verification of GDAP Invite Accepted
* Confirmation that required roles are present.
* Ensures groups are correctly mapped to roles.
* Validates that permissions are updated via a CPV refresh
* Verifies Graph API connectivity and access.

{% hint style="danger" %}
CIPP requires its Service Account user to be a member of the specific security groups with the [recommended roles](../gdap/recommended-roles.md) assigned for proper functionality within your GDAP relationship. This step is completed during the [SAM Setup Wizard execution](../../user-documentation/cipp/onboardingv2.md) prior to tenant onboarding.

If these roles are missing or the groups haven't been applied to the CIPP user, CIPP will not be able to access the tenant, resulting in errors such as: `invalid_grant:AADSTS65001: The user or administrator has not consented to use the application.`

`or`

`Send an interactive authorization request for this user and resource`
{% endhint %}

***

## Prerequisites

CIPP relies on use of GDAP role templates for proper onboarding of tenants. Prior to using the tenant onboarding wizard, you should create a role template. To create the CIPP Defaults role template navigate to `Tenant Administration`-> `GDAP Management`-> `Role Templates`. Click the "+ Create CIPP Defaults" button. You can alternatively create your own templates but be sure to include the recommended roles for full CIPP functionality.

***

## Using the Tenant Onboarding Wizard

Navigate to `Tenant Administration` -> `GDAP Management`-> `Relationships`

{% stepper %}
{% step %}
### Relationship Choice

* Choose the GDAP relationship to onboard.&#x20;
* Click the Actions button and select "View Relationship"
* Review the warnings on the tenant as these will indicate if the tenant functions properly within CIPP.

{% hint style="danger" %}
If you see the warning that the relationship does not have all the CIPP recommended roles, do not proceed. See [Tenant Onboarding](gdap-invite-wizard.md) to create a new GDAP relationship to establish a relationship that meets at least the minimum required roles.
{% endhint %}
{% endstep %}

{% step %}
### Onboarding Wizard

* If the relationship page shows all green with no warnings, click the "Actions" drop down in the upper right and select "Start Onboarding"
{% endstep %}

{% step %}
### Tenant Onboarding

* Select the GDAP role template. You can use the CIPP Defaults template or a custom group that contains at least the recommended roles.&#x20;
* Click the "Start" button and view progress

{% hint style="info" %}
Occasionally the process will time out. Click the "Retry" button to have CIPP attempt the process again. Subsequent attempts should complete faster.
{% endhint %}
{% endstep %}

{% step %}
### Reset Role Mapping

* Now that you've onboarded the tenant, your pre-existing role mapping may not match the role template you used as part of the onboarding.&#x20;
* Navigate to `Tenant Administration`-> `GDAP Management`-> `Relationships`-> Select the Actions menu for the tenant you just onboarded and choose "Reset Role Mapping"

{% hint style="info" %}
Be sure to update your internal users' GDAP permission to utilize the newly created security groups. For simplicity, you can create position-based groups like "Help Desk", "Engineer" etc. that are role-assignable security groups that can have the CIPP created GDAP groups as members.
{% endhint %}
{% endstep %}
{% endstepper %}

{% hint style="success" %}
To automate this process even further, enable Partner Webhooks in Application Settings and newly invited tenants will automatically onboard once accepted.
{% endhint %}

{% hint style="info" %}
Tenants are cached for 24 hours within CIPP. To see a newly added Microsoft Tenant you can use the Settings -> Clear Tenant Cache button to clear the cache.
{% endhint %}
