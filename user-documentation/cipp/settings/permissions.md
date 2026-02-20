# Permissions

## Permissions Check

This section will display the results of a permission check. The checks are built to CIPP best practices to ensure proper application functioning. What this check does:

### Basic Information

* Name: This is the Display Name of the account that CIPP is using to complete actions
* UserPrincipalName: This is the UPN for the account that CIPP is using to complete actions
* IP Address: The IP address used when authenticating CIPP
* App Registration: A link to the app registration in your tenant's Entra ID portal

### Test Results

* Refresh Tokens: This test will display if the refresh token being used matches the expected token from the Azure Key Vault
* Service Account: This test will validate if a service account was used to authenticate CIPP. Note that this is specifically looking for "CIPP" or "service" in the account's display name. If you have set up a service account and are not using this naming convention, then you can ignore the warnings. If the account presented is not the one you expect, please run the [sam-setup-wizard.md](../sam-setup-wizard.md "mention") option "Refresh Tokens for existing application registration" and use your CIPP service account.
* MFA Claim: This will test to ensure the access token contains the MFA claim. If you are presented with a failure here, please review the documentation on [creating-the-cipp-service-account-gdap-ready.md](../../../setup/installation/creating-the-cipp-service-account-gdap-ready.md "mention") and [conditionalaccess.md](../../../setup/installation/conditionalaccess.md "mention") to ensure the service account is appropriately targeted to always prompt for MFA during setup. Please run the [sam-setup-wizard.md](../sam-setup-wizard.md "mention") option "Refresh Tokens for existing application registration" and use your CIPP service account after correcting any errors.
* Permissions Check: This will test that the CIPP application registration has the required permissions to take the various actions within CIPP. If you see that you are missing permissions, click the `Details` button. You will be presented with the option to repair any missing permissions.
* CPV Check: This will test if any tenants require a CPV refresh. This is common to see if permisions have just changed as CIPP needs to push the new permissions to the client tenants. If this continues to fail, click the `Details` button and review the tenants having trouble refreshing. Those tenants may be having depeer connection issues, such as a Microsoft managed Conditional Access policy blocking CIPP.

### Refresh

Use this button to have CIPP run the permissions check tests again.

### Details

This will open a window that will display the output of the tests. Any warnings or errors, like missing permisions, will be displayed for you to investigate further.

## GDAP Check

This section will display the results of a GDAP check. The checks are built to CIPP best practices to ensure proper application functioning. The `Details` button will display the additional information used to calculate the output of the check.

### Basic Information

* Warnings: Indicates the number of tenants with warnings for access issues. Click the `Details` button to review a list of tenants that have access issues for more information on what may potentially block CIPP's access.
* Errors: Indicates the number of tenants with errors for access issues. Click the `Details` button to review a list of tenants that have access issues for more information on what is blocking CIPP's access.
* Microsoft Led Transition Relationships: This is a count of the number of Microsoft Lead Transition (MLT) relationships you have with your client tenants. MLT relationships were read only relationships created by Microsoft during the DAP to GDAP transition if a prior GDAP relationship was not established. Ensure that every tenant has a full GDAP relationship and then you are free to terminate these. Use the [sam-setup-wizard.md](../sam-setup-wizard.md "mention") "Add a Tenant" or [gdap-management](../../tenant/gdap-management/ "mention") Invite and Onboarding wizards to assist with proper tenant onboarding.
* Global Admin Relationships: This is a count of the number of relationships with Global Administrator (Company Administrator in the GDAP role list) role. GA/CA relationships cannot be auto-extended. The CIPP 15 [recommended-roles.md](../../../setup/installation/recommended-roles.md "mention") are the closest to GA/CA you can get while still allowing for auto-extend. Use the [sam-setup-wizard.md](../sam-setup-wizard.md "mention") "Add a Tenant" or [gdap-management](../../tenant/gdap-management/ "mention") Invite and Onboarding wizards to assist with proper tenant onboarding using an updated "CIPP Defaults" permissions template or a custom one containing at least those roles.

### Test Results

* AdminAgents: Tests to verify the CIPP service account is a member of the AdminAgents group in your partner tenant.
* Recommended Roles: This tests to verify your CIPP service account is a member of the [recommended-roles.md](../../../setup/installation/recommended-roles.md "mention"). If any are missing, be sure to correct this in your tenant. Note that just adding these group memberships does not translate to the permissions extending to your client tenants. The roles must exist in the relationship.
* MLT: This will check for MLT relationships. See above for how to resolve.
* GA: This will check for relationships with the GA/CA role. See above for how to resolve.

### Refresh

This will have CIPP run a fresh check of the GDAP check.

### Details

This button will open a window that displays additional information about the results of the GDAP tests. Any errors or warnings will be displayed separately for you to review for further troubleshooting possibilities.

## Tenants Check

This table will display your existing GDAP relationships and useful information on their accessibility within CIPP. Reviewing this chart when you are having issues connecting to a tenant can help you identify any issues.

### Table Details

| Column          | Description                                                                                                                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant Name     | The tenant's name                                                                                                                                                                                                                                                          |
| Last Run        | The relative time since the access check was last ran                                                                                                                                                                                                                      |
| Graph Status    | A success/fail indicator if the tenant is able to be accessed via Graph.                                                                                                                                                                                                   |
| Exchange Status | A success/fail indicator if the Exchange Roles match a predicted set of permissions. See below for more info.                                                                                                                                                              |
| Missing Roles   | This will indicate the GDAP roles from [recommended-roles.md](../../../setup/installation/recommended-roles.md "mention") missing from the relationship with this tenant. We recommend onboarding the tenant with the additional roles to ensure smooth operation of CIPP. |
| GDAP Roles      | This will indicate the GDAP roles present on the relationship.                                                                                                                                                                                                             |

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox"></th></tr></thead><tbody><tr><td>Check Tenant</td><td>Queues up a fresh access check of the selected tenant(s). Results will be available once completed.</td><td>true</td></tr><tr><td>Repair Exchange Roles</td><td>CIPP will reset the tenant(s)'s Exchange status compared to a combined list of roles that a tenant may have. This is a "best guess" at what a baseline of the Exchange roles should be for a tenant. If you are not having issues accessing Exchange information but you are seeing a failure on a check on a tenant, there isn't a need to repair the role at this time.</td><td>true</td></tr><tr><td>More Info</td><td>This will open the Extended Information flyout for the selected tenant</td><td>false</td></tr></tbody></table>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
