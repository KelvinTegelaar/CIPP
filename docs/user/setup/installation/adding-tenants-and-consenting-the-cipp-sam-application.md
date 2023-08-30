# Adding Tenants & Consenting the CIPP-SAM Application

### Consenting to new clients

CIPP Automatically connects to all tenants found either in your DAP Relationships or GDAP Relationships. For newly added Tenants CIPP must be granted permissions. This consent runs automatically every week on a Sunday night. \


To manually force the CPV permissions, and thus consent to the tenant being access you can use the following steps:

* Go to CIPP
* Go to Settings
* Go to the Tenants tab
* Click on the blue refresh button next to the tenant. This will process all required permissions to that tenant.

{% hint style="info" %}
Tenants are cached for 24 hours within CIPP. To see a newly added Microsoft Tenant you can use the Settings -> Clear Tenant Cache button to clear the cache. Loading GDAP Tenants might take longer as these need to be onboarded by the Lighthouse API first.
{% endhint %}
