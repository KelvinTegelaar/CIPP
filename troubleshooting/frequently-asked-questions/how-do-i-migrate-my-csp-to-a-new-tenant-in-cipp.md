# How Do I Migrate My CSP to a New Tenant In CIPP?

On certain occasions, you will have a need to move your CSP designation from one tenant to another. This most frequently occurs when you are following Microsoft guidance to split your CSP and everyday domains into different tenants or through a merger/acquisition.

## Migration Steps

{% stepper %}
{% step %}
### Create the CIPP Service Account in New CSP Tenant

Be sure to follow all of the account setup steps in [creating-the-cipp-service-account-gdap-ready.md](../../setup/installation/creating-the-cipp-service-account-gdap-ready.md "mention") and [conditionalaccess.md](../../setup/installation/conditionalaccess.md "mention") to ensure the service account has the correct permissions and ability to access your tenant and your clients' tenants.

{% hint style="warning" %}
If you still have trouble accessing client tenants, be sure to add the new partner tenant as a service provider exclusion to their Conditional Access policies. See the bottom of [conditionalaccess.md](../../setup/installation/conditionalaccess.md "mention") for further guidance.
{% endhint %}
{% endstep %}

{% step %}
### Consent to CIPP Permissions

Go to the [sam-setup-wizard.md](../../user-documentation/cipp/sam-setup-wizard.md "mention") and select the option for "First Setup". Click "Authenticate with Code" and authenticate using your new CIPP service account created in Step 1
{% endstep %}

{% step %}
### Recreate all GDAP Role Mappings and Templates

1. Go to [roles](../../user-documentation/tenant/gdap-management/roles/ "mention"), select all mapped roles, and select "Delete Mappings" from the Bulk Actions dropdown.
2. Click "Map GDAP Roles", select the 15 GDAP roles from the "Select GDAP Roles" dropdown or click "Add CIPP Default Roles" and ensure all 15 are selected.
3. Go to [role-templates](../../user-documentation/tenant/gdap-management/role-templates/ "mention"), select all templates, and select "Delete Template" from the Bulk Actions dropdown.
4. Click on the newly surfaced "Create CIPP Defaults" button at the top of the page. Review the created group to ensure it contains all 15 role mappings done previously.
5. Set up any additional role templates you would like to make available to tenant onboarding.
{% endstep %}

{% step %}
### Onboard Clients to New CSP Tenant

1. If you were previously using [partner-webhooks.md](../../user-documentation/cipp/settings/partner-webhooks.md "mention"), you will need to reset this to function with your new tenant. Navigate to the settings page and click "Submit". This will pull in the new Webhook URL. Optionally enable "Exclude onboarded tenants from top-level standards" if you have additional cleanup to do after migration.
2. Create [invites](../../user-documentation/tenant/gdap-management/invites/ "mention") for each client tenant. You can do one by one or bulk create these links.
3. Have your client's Global Administrator consent to the new GDAP contract.
4. If you have [partner-webhooks.md](../../user-documentation/cipp/settings/partner-webhooks.md "mention") enabled, CIPP will automatically detect the new contractual relationship and onboard the tenant. If you have this disabled, use the Onboarding Url from the "Invites" table to start the tenant onboarding to CIPP.
{% endstep %}

{% step %}
### Additional Items to Review

1. Tenant Groups - Any statically assigned tenant groups will need membership created again. Dynamic groups may take a cycle or two of CIPP running to gather all of the necessary features, etc. to properly assign tenants to the groups.
2. Standards & Drift Management - Any statically assigned templates will need to be linked to the newly re-onboarded tenants.
3. Alerts - Any statically assigned alerts will need to be linked to the newly re-onboarded tenants.
4. Scheduled Tasks - Any scheduled tasks that you may have previously created will need to be reviewed to ensure they are targeting the newly re-onboarded tenants.
5. Integration Mappings - Review the mappings table for any configured integrations to ensure they are targeting the newly re-onboarded tenants.
{% endstep %}

{% step %}
### (Optional) Terminate GDAP Relationships with Old CSP Tenant

While no longer tied to CIPP, these relationships may no longer be required. They can safely be terminated manually from the old CSP tenant's Partner Portal as they will no longer appear in CIPP.
{% endstep %}
{% endstepper %}

