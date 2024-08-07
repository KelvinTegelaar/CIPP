# Adding Tenants & Consenting the CIPP-SAM Application

{% hint style="danger" %}
### Consent for New Tenants

CIPP requires its Service Account user to be a member of specific security groups with the [recommended roles](../gdap/recommended-roles.md) for proper functionality with your GDAP relationship. This step is completed during the [SAM Setup Wizard execution](../../user-documentation/cipp/sam-setup-wizard.md).

If these roles are missing or the groups haven't been applied to the CIPP user, CIPP will not be able to access the tenant, resulting in errors such as: `invalid_grant:AADSTS65001: The user or administrator has not consented to use the application.`
{% endhint %}

### Tenant Onboarding Wizard

CIPP Automatically connects to all tenants found in your GDAP Relationships List. The preferred method of adding tenants to CIPP is to run the Onboarding Wizard. This will perform all of the background tasks necessary to manage a tenant in CIPP.

* Go to CIPP
* Go to Tenant Administration > Administration > Tenant Onboarding
* Click on Start Tenant Onboarding
* Select the relationship for the customer you would like to onboard
* Choose any of the optional settings
* Wait for the wizard to complete

{% hint style="info" %}
To automate this process even further, enable Partner Webhooks in Application Settings and newly invited tenants will automatically onboard once accepted.
{% endhint %}

### Manual Steps

After adding a relationship, you can perform a [CPV refresh](../../troubleshooting/troubleshooting-instructions/refreshing-a-specific-tenants-permissions-via-cpv-api.md) via the following instructions. This also runs automatically each night

* Go to CIPP
* Go to Application Settings
* Go to the Tenants tab
* Click on the blue refresh button next to the tenant. This will process all required permissions to that tenant.

{% hint style="info" %}
Tenants are cached for 24 hours within CIPP. To see a newly added Microsoft Tenant you can use the Settings -> Clear Tenant Cache button to clear the cache.
{% endhint %}
