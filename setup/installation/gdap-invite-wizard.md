# Tenant Onboarding

You'll continue to use the Setup Wizard to onboard your client tenants. You can either

***

## **Wizard Steps for GDAP Tenants**

{% @storylane/embed subdomain="app" linkValue="p6cyd3t8w8ru" url="https://app.storylane.io/share/p6cyd3t8w8ru" %}

{% stepper %}
{% step %}
### **Click on "Add a Tenant"**

To get started, we click the "Add a Tenant" button and "Next Step".&#x20;
{% endstep %}

{% step %}
### Select Tenant Add Method of "Add GDAP Template"

Select "Add GDAP Tennant" and click "Next Step"
{% endstep %}

{% step %}
### Select GDAP Role Template

Select the GDAP Role Template you would like to use for this onboarding. This will automatically map your GDAP security groups with the GDAP roles.

{% hint style="info" %}
If this is your first GDAP tenant, you will be prompted to optionally add the CIPP Default role template. This role template will automatically create the 15 GDAP groups matching the [recommended-roles.md](recommended-roles.md "mention").
{% endhint %}
{% endstep %}

{% step %}
### Click "Create Invite URL" and Consent in Client Tenant

This will generate a unique GDAP invite URL with the associated roles selected from your template. This link will need to be consented by your client's Global Administrator in order to accept the contractual relationship. Once completed, check the box that the invite has been accepted and click "Next Step".
{% endstep %}

{% step %}
### Tenant Onboarding

On this step, you can review the relationship info. Before clicking "Start Onboarding", decide if you want to have the tenant excluded from All Tenants standards to allow you time to review the tenant before those are applied. Once done, click "Start Onboarding". CIPP will now automatically complete the tenant onboarding. This includes verifying the relationship was accepted, the roles are present in the relationship, the security groups are mapped to the tenant, and the tenant is accessible via Graph API.
{% endstep %}

{% step %}
### Confirm

The final page is a confirmation that shows you what you've completed.
{% endstep %}
{% endstepper %}

## Wizard Steps for Direct Tenants

{% @storylane/embed subdomain="app" linkValue="kcszcpgdcg6m" url="https://app.storylane.io/share/kcszcpgdcg6m" %}

CIPP will also allow you to manage tenants that you do not have a GDAP relationship with.

{% stepper %}
{% step %}
### Click on "Add a Tenant"

To get started, we click the "Add a Tenant" button and "Next Step".&#x20;
{% endstep %}

{% step %}
### Click on "Add Direct Tenant"

Select "Add Direct Tenant" and click "Next Step"
{% endstep %}

{% step %}
### Click "Connect to Tenant"

Click the "Connect to Tenant" button. Use a service account with equivalent permissions as the partner tenant. More information on these roles can be found under [recommended-roles.md](recommended-roles.md "mention").

{% hint style="info" %}
Be sure to Consent on behalf of the organization to prevent any prompting for future users that may log into CIPP, such as a comanaged client technician.
{% endhint %}
{% endstep %}

{% step %}
### Confirm

The final page is a confirmation that shows you what you've completed.
{% endstep %}
{% endstepper %}

{% hint style="warning" %}
Do not attempt to add your partner tenant as a direct tenant. This will result in a permission error. To add your partner tenant, please see [tenant-mode.md](../../user-documentation/cipp/advanced/super-admin/tenant-mode.md "mention") and select "Multi Tenant - Add Partner Tenant" or "Single Tenant - Own Tenant Mode".
{% endhint %}

### Limitations of Direct Tenants

There are limitations to what CIPP can do with directly added tenants due to some features relying on Lighthouse, Partner Center APIs, etc.

* Permissions errors during addition of the tenant
  * Consent can only be granted for permissions the direct tenant is licensed for.&#x20;
  * To work around this until a more robust method can be devised, if you see one of these errors, remove the offending permission (NOT THE CONSENT) from the CIPP-SAM app registration in your tenant.&#x20;
* Universal Search - This relies on Lighthouse to search for users
* Admin Portal Links - These utilize the GDAP relationship to log in as your CSP user. You will have to log in to the portal with an account native to the tenant
* Alerts - There are certain alerts that will only work with GDAP/Lighthouse
  * Alert if Defender is not running
  * Alert if Defender Malware found
* Inactive Users Report - Relies on a CSP report

## Role Management Considerations

Any additional users who need access to your Microsoft CSP Tenants via the admin portals must be manually added to the relevant security groups. These groups start with "M365 GDAP".
