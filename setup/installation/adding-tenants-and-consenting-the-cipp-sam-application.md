# Adding Tenants & Consenting the CIPP-SAM Application

### Consenting to new clients

CIPP Automatically connects to all tenants found either in your GDAP Relationships List. You must add the[ correct roles](../gdap/recommended-roles.md) for CIPP to function to your GDAP relationship, if you do not, you will not be able to access the tenant and receive errors such as "invalid\_grant:AADSTS65001: The user or administrator has not consented to use the application" .

### Tenant Onboarding Wizard
The preferred method of adding tenants to CIPP is to run the Onboarding Wizard. This will perform all of the background tasks necessary to manage a tenant in CIPP.

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
After adding a relationship, you can perform a CPV refresh via the following instructions. This also runs automatically each night

* Go to CIPP
* Go to Application Settings
* Go to the Tenants tab
* Click on the blue refresh button next to the tenant. This will process all required permissions to that tenant.

{% hint style="info" %}
Tenants are cached for 24 hours within CIPP. To see a newly added Microsoft Tenant you can use the Settings -> Clear Tenant Cache button to clear the cache. Loading GDAP Tenants might take longer as these need to be onboarded by the Lighthouse API first.
{% endhint %}
