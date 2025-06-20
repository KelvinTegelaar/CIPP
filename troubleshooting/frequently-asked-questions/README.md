# Frequently Asked Questions

On this page you can find a list of frequently asked questions about the CyberDrain Improved Partner Portal (CIPP). If you're having specific issues with CIPP please also check the Troubleshooting page.

<details>

<summary>I updated, but CIPP still says my frontend is out of date. How do I fix this?</summary>

SELF-HOSTED NOTE: Be sure to verify that your repo is actually up to date. Instructions for updating self-hosted CIPP can be found in [updating.md](../../setup/self-hosting-guide/updating.md "mention").

CIPP-HOSTED NOTE: Updates can take several hours to roll out to all instances depending on how well GitHub and Azure are communicating at the time the release is pushed. If it's been more than 48 hours, follow these instructions and then reach out to CIPP's helpdesk if still not resolved.

CIPP v7+ heavily relies on caching. Because of this it is necessary to clear your browser's cookies and cache to pull in the most up to date version of CIPP's frontend.

* Chrome/Edge - Open DevTools (F12), right click on the refresh button, select "Empty cache and hard reset"
* Firefox - Click the padlock in the URL bar and select "Clear cookies and site data..."

</details>

<details>

<summary>How much does CIPP cost to run?</summary>

Assuming you're running on the click-to-deploy configuration and average usage patterns it should cost $15 - $20 or £17 - £22 per month. You can check the costs, and estimated costs, for the resource group on the Azure Portal.

Please note it is your responsibility to ensure you are keeping an eye on costs within your instances.

</details>

<details>

<summary>How do we get new integrations?</summary>

We know, you love CIPP. You want everything to integrate with CIPP. Unfortunately, CIPP's business model doesn't allow us to take on the development, documentation, and help desk training to support every integration out there. In order for a vendor to integrate with CIPP, we need them to sponsor CIPP at the integration level.

Vendor sponsorship pays for that development, training, and support. If you have a vendor that you want to see integrated with CIPP, please reach out to your Account Manager at the vendor and let them know that you are interested.

Here's a couple of options for emails that you can send to licensing provider vendors. Modify these as you see fit for other vendors.

### Email 1: You love CIPP and would switch distributors based on who we integrate with:

{% code overflow="wrap" %}
```
Hi,

I hope you're doing well! I'm reaching out to you today as I'm a user of a tool called CIPP(https://cipp.app). It has greatly enhanced my Microsoft 365 experience and is now our core tool when it comes to performing M365 management. 
We understand you might be having discussions with their team already, but we just want to amplify that our choice of distributor is dependant on which one integrates with CIPP

Regards,
```
{% endcode %}

### Email 2: You love CIPP and would like your distributor to integrate

{% code overflow="wrap" %}
```
Hi,

I hope you're doing well! I'm reaching out to you today as I'm a user of a tool called CIPP(https://cipp.app). It has greatly enhanced my Microsoft 365 experience and is now our core tool when it comes to performing M365 management. 
We understand you might be having discussions with their team already, but we just want to amplify that our preference is to use CIPP to transact licenses.

Regards,
```
{% endcode %}

</details>

<details>

<summary>What should I do if I'm experiencing performance issues in CIPP?</summary>

Performance issues in CIPP are not expected. If your performance appears impacted, you can follow these steps to diagnose and resolve the issue:

1. **Check Your Deployment Region:**
   * Ensure that you deployed to the nearest region. You can verify this at [Azure Speed](https://www.azurespeed.com).
2. **Enable Function Offloading**
   * For more information, refer to the documentation on [function-offloading.md](../../user-documentation/cipp/advanced/super-admin/function-offloading.md "mention") for limitations and setup.

</details>

<details>

<summary>CIPP runs slow when I first open it. How can I speed that up?</summary>

If users in your organization have not accessed CIPP in a while, the Static Web App will put itself into a sleep state to save on resource usage. It's normal to see an initial 15-20 second delay on the first results being called from the CIPP-API backend. This is sometimes known as a cold start.

If you want to avoid cold starts, it's possible to utilize the [Broken link](broken-reference "mention") and an RPA such as CIPP sponsor Rewst to make a basic call to keep activity on the function app. A basic call to `/PublicPing` every 3-5 minutes will complete quickly and ensure that your function app stays in a warm state. It is recommended that you limit your RPA cron to only during expected business hours to limit the number of additional function app calls you are making. The `/PublicPing` endpoint does not require the full authentication setup for the API.

Self-hosted clients should see minimal impact to their overall costs.

</details>

<details>

<summary>Can I add Conditional Access to my CIPP App?</summary>

To add Conditional Access to CIPP, follow the below steps:

1. Go to your [Conditional Access Policies](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ConditionalAccessBlade/Policies)
2. Select which users to apply the policy to, default suggestion is _"All Users"_
3. Select **Azure Static Web Apps** as the included app under "Cloud Apps or actions"
4. Configure any condition you want. For example, Trusted Locations, specific IPs, specific platforms.
5. At Access Controls you must enable _Grant, with MFA access_.
6. Select **Save**

Your app is now protected with Conditional Access.

</details>

<details>

<summary>I renamed a tenant. How do I get this to show up in CIPP?</summary>

Beginning with v7, CIPP relies on the tenant's name at the time a GDAP relationship was created. Much of the tenant naming and renaming API capabilities were deprecated. As such, it will no longer pull in live information if you rename a tenant through your Microsoft Partner Portal.

To have the new tenant's name show up in CIPP, you have two options

### Establish a New Relationship

1. After renaming the tenant, create a new GDAP relationship. You can use the [gdap-invite-wizard.md](../../setup/installation/gdap-invite-wizard.md "mention")wizard to expedite this process.
2. Terminate the old GDAP relationship. This can be accomplished by locating the old relationship on the GDAP [relationships](../../user-documentation/tenant/gdap-management/relationships/ "mention")page and selecting terminate relationship from the per-row actions or Bulk Actions with the row selected.
3. Cleare your tenant cache from [settings](../../user-documentation/cipp/settings/ "mention").

### Utilize the Tenant Alias Functionality

CIPP can also set an alias via the [#properties](../../user-documentation/tenant/administration/tenants/edit.md#properties "mention") section of [edit.md](../../user-documentation/tenant/administration/tenants/edit.md "mention").

</details>

<details>

<summary>I remediated an admin with no MFA, why is it still alerting?</summary>

The CIPP alert "Alert on admins without any form of MFA" is based on checking a report created by Microsoft. This report is only updated once every 7 days. As such, CIPP recommends only running this alert every 7 days. It's possible the user may still show up on the report after remediation if the report has not refreshed since you completed your remediation steps.

</details>

<details>

<summary>I'm getting an error that "you must use multi-factor authentication to access" what's going on?</summary>

Typically, this error means you're using tokens that don't have a "strong auth claim" or similar. This could be because you're using non-Azure AD MFA or you didn't complete MFA when creating your tokens for one or more of the authentication steps. Make sure you're using a supported MFA method and that you've completed the MFA steps when creating your tokens.

Check the [#multi-factor-authentication-troubleshooting](../troubleshooting.md#multi-factor-authentication-troubleshooting "mention") details in the [Broken link](broken-reference "mention")section for more information.

</details>

<details>

<summary><strong>What if I get errors during management my tenants in CIPP?</strong></summary>

1. **Perform a CPV Permissions Refresh:**
   1. Navigate to Settings -> CIPP -> Application Settings
   2. Click on the Tenants tab.
   3. Click the blue refresh button in the "Actions" column for the relevant tenant.
2. **Perform Permissions Check:**
   1. Navigate to Settings -> CIPP -> Application Settings
   2. Select "Perform Permissions Check"
3. **Conduct GDAP Check**
   1. Navigate to CIPP -> Application Settings -> GDAP Check.
   2. After the Permissions Check, perform the GDAP check
4. **Perform an Access Check:**
   1. Navigate to CIPP -> Application Settings -> Access Check.
   2. Select the relevant tenant and click "Run access check".

Complete all checks for effective troubleshooting. If you still have issues or for detailed instructions, refer to the[refreshing-a-specific-tenants-permissions-via-cpv-api.md](../troubleshooting-instructions/refreshing-a-specific-tenants-permissions-via-cpv-api.md "mention") page, the [troubleshooting-instructions](../troubleshooting-instructions/ "mention") page, and the relevant sections on our [troubleshooting.md](../troubleshooting.md "mention") page.

</details>

<details>

<summary>I'm getting missing permissions errors when performing the Permissions Check on my CIPP-SAM application. How can I fix this?</summary>

Sometimes when you are running a permissions check, you may encounter specific errors that you are missing some of the API permissions required for CIPP to perform as expected.

To ensure full functionality of CIPP, follow these steps to add the necessary API permissions:

1. Click the `Details` button on the [#permissions-check](../../user-documentation/cipp/settings/permissions.md#permissions-check "mention") section of CIPP Settings > [permissions.md](../../user-documentation/cipp/settings/permissions.md "mention")
2. Click `Repair Permissions`. CIPP will automatically add newly added or missing permissions to your CIPP-SAM application.
3. CIPP will queue up CPV refreshes to push the update permissions to your client tenants.

</details>

<details>

<summary>How can I resolve expired / revoked auth token errors or ensure the correct service account is used by CIPP?</summary>

This error occurs because the user who authorized the CSP or Graph API connection has had their password changed, sessions revoked, or account disabled. Reauthorization is required.

**To resolve this,** e**xecute the SAM Wizard with Option 4:**

* Go to CIPP -> Application Settings -> [sam-setup-wizard.md](../../user-documentation/cipp/sam-setup-wizard.md "mention").
* Select "Refresh Tokens for existing application registration"

**Important:** Ensure your browser allows cookies, disable any ad-blockers, and do not use in-private mode.

For more details, refer to:

* [Broken link](broken-reference "mention")

</details>

<details>

<summary>How do I resolve issues with the wrong CIPP-SAM user / Service Account?</summary>

1. **Perform a Permissions Check:**
   * Go to CIPP -> Settings -> [permissions.md](../../user-documentation/cipp/settings/permissions.md "mention")
   * A Permissions Check will automatically run on page load
2. Confirm the UserPrincipalName matches the expected service account.&#x20;
3. If not, go to the [sam-setup-wizard.md](../../user-documentation/cipp/sam-setup-wizard.md "mention") and select the option to "Refresh Tokens for existing application registration.
4. Review the remaining [#permissions-check](../../user-documentation/cipp/settings/permissions.md#permissions-check "mention") output after replacing the incorrect account.
   * The refresh token matches key vault. This may take a little while to update after first changing the account due to caching.
   * The user should be a service account.&#x20;
   * The user needs to be a member of the AdminAgents group.
   * The application has all the required permissions. If you have an error here, review [#im-getting-missing-permissions-errors-when-performing-the-permissions-check-on-my-cipp-sam-applicati](./#im-getting-missing-permissions-errors-when-performing-the-permissions-check-on-my-cipp-sam-applicati "mention")

</details>

<details>

<summary>How do I troubleshoot GDAP relationship issues in the partner portal?</summary>

If there are issues with the GDAP relationship, follow these steps:

1. **Check GDAP Relationships:**
   * Go to [Microsoft Partner Center](https://partner.microsoft.com/en-us/dashboard/commerce2/granularadminaccess/list).
   * Select the client you are testing with and look at the relationships.
2. **Verify Access:**
   * If you only see a relationship with "MLT\_", you do not have write-access to the tenant.
   * If you see other relationships, click into them and check if the roles are mapped to groups.
3. **Create Role Mapping:**
   * If roles are not mapped, create the mapping by clicking the + icon.
   * Assign these groups to the CIPP service account.
4. **Identify the CIPP Service Account:**
   * Go to CIPP -> Application Settings -> [permissions.md](../../user-documentation/cipp/settings/permissions.md "mention") -> [#permissions-check](../../user-documentation/cipp/settings/permissions.md#permissions-check "mention").
   * Review the results for the UserPrncipalName to identify the CIPP service account.

</details>

<details>

<summary>How do I resolve a missing GDAP permission error?</summary>

This error may occur because the user is not in any of the GDAP groups. To resolve this:

1. **Check Recommended GDAP Roles and Relationships:**
   * Refer to the [recommended-roles.md](../../setup/installation/recommended-roles.md "mention") document.
2. **Perform a Tenant Access Check:**
   * Go to CIPP -> Settings -> [tenants.md](../../user-documentation/cipp/settings/tenants.md "mention") -> perform a Tenant Access Check from the Actions.
   * This will show you which roles might be missing.

</details>

<details>

<summary>Does CIPP require a specific license?</summary>

No, CIPP can work with any M365 license in your partner tenant. For specific features CIPP will of course only function if the tenant is licensed correctly, e.g. to manage Intune, the tenant must have Intune Licensing.

</details>

<details>

<summary>My usernames or sites are GUIDs or blank?</summary>

Please see the standard "Enable Usernames instead of pseudo anonymized names in reports" in [list-standards](../../user-documentation/tenant/standards/list-standards/ "mention").

</details>

<details>

<summary>Why can't I install CIPP using the "Deploy to Azure" button?</summary>

If you're experiencing issues with installation, please report these in `#cipp-community-help` on the [CIPP Discord](https://discord.gg/cyberdrain)

</details>

<details>

<summary>My tenant requires admin approval for user apps; how do I do this for CIPP?</summary>

If your Azure Tenant requires admin approval for user apps, add consent by following the below steps:

1. Go to [Azure Enterprise Applications](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AllApps)
2. Find _Azure Static Websites_
3. Grant Admin Consent for all

This permits users the ability to grant consent when access CIPP now.

</details>

<details>

<summary>Can I replace the default branding with my own in CIPP?</summary>

### For the CIPP application:

No, CIPP's branding is compiled into the code. Additionally, the branding isn't just a decorative feature, it plays a role in helping maintain visibility and community growth.

### For CIPP reports:

Yes, please set up the [#branding-settings](../../user-documentation/cipp/settings/#branding-settings "mention") in [settings](../../user-documentation/cipp/settings/ "mention")

</details>

<details>

<summary>How can I add or change a domain name using the CIPP management portal?</summary>

You can use our management portal to add or change a domain name. Follow these steps:

1. **Set CNAME:**
   * First, set any CNAME you want to use to your current portal domain.
   * For example, set "CIPP.MyMsp.com" to "Proud-Dolphin01928.azurewebsites.net".
2. **Use the Management Portal:**
   * After setting the CNAME, use the [management portal](https://management.cipp.app) to finish the setup and add it on the platform.

</details>

<details>

<summary>How do I find the correct AppID for CIPP?</summary>

To find the correct AppID for CIPP:

1. **Run a Permissions Check:**
   * Go to CIPP -> Application Settings -> [permissions.md](../../user-documentation/cipp/settings/permissions.md "mention") -> [#permissions-check](../../user-documentation/cipp/settings/permissions.md#permissions-check "mention").
2. **Locate the Correct AppID:**
   * There will be a direct link to the application registration CIPP currently uses.
   * You can safely delete the other AppIDs.

</details>

<details>

<summary>Helpdesk asked me to generate a HAR file in Google Chrome. How do I do that?</summary>

**To generate a HAR file while performing an action, follow these steps:**

1. **Open Chrome DevTools:**
   * Right-click in the browser window or tab.
   * Select **Inspect**.
2. **Capture Network Traffic:**
   * Click the **Network** tab in the panel that appears.
3. **Export the HAR File:**
   * Click the download button (tooltip will say "Export HAR").
   * Name the file and click **Save**.

For more details, refer to the [Chrome DevTools guide](https://developers.google.com/web/tools/chrome-devtools/).

</details>

<details>

<summary>Check for Lighthouse</summary>

1. **Check for a Lighthouse License:**
   * Ensure you have a Lighthouse license enabled by following the instructions [here](https://learn.microsoft.com/en-us/microsoft-365/lighthouse/m365-lighthouse-sign-up?view=o365-worldwide).
2. **Check for a New EULA:**
   * Go to [Microsoft Lighthouse](https://lighthouse.microsoft.com) and check if there is a new EULA waiting for you to accept.

For more details, refer to the [Lighthouse sign-up guide](https://learn.microsoft.com/en-us/microsoft-365/lighthouse/m365-lighthouse-sign-up?view=o365-worldwide).

</details>

<details>

<summary>Applying New Standards to a Tenant</summary>

**Q: How long does it typically take for new standards to be applied to a tenant?**

**A:** It usually takes between 0 to 3 hours for new standards to be applied to a tenant. This timeframe depends on the scheduling of a cron job that automatically initiates the application of standards.

**Q: Can I apply standards immediately instead of waiting for the cron job?**

**A:** Yes, you can apply standards immediately by clicking the "Run Now" buttons located in the top right corner of the interface. This action bypasses the scheduled cron job and applies the standards right away.

</details>

<details>

<summary>When trying to onboard a GDAP relationship, I received an error that only x amount of groups were found, or that the group is not assigned to a user. What does this mean?</summary>

This error can mean two things;

* You migrated using different tools, such as Microsoft Lighthouse.
* You didn't assign the groups to the user after migrating.

Make sure you assign the correct groups to the CIPP service account. For more information see our best practices in [recommended-roles.md](../../setup/installation/recommended-roles.md "mention").

</details>

<details>

<summary>I've already setup my GDAP relationships and given them access to a Global Administrator role. Can I still auto-extend these after their expiration?</summary>

Auto Extend is only available for relationships without the Global Administrator role. If your relationship contains the Global Administrator role you cannot enable this feature. This means that you will need to renew the relationship by reinviting the tenant every 2 years. If your relationships contain at least the [recommended-roles.md](../../setup/installation/recommended-roles.md "mention") in addition to Global Administrator, you can go to [gdap-management](../../user-documentation/tenant/gdap-management/ "mention") -> [relationships](../../user-documentation/tenant/gdap-management/relationships/ "mention"), select one or more relationship and choose the action "Remove Global Administrator from Relationship". After waiting for changes to sync, you can then select the action "Enable automatic extension".

</details>

<details>

<summary>Troubleshooting CIPP-API Updating and Action Workflow Issues</summary>

If your CIPP-API isn't updating, start by checking the Actions tab in your repository for a workflow named `_master*.yml`.

* **If the workflow is missing:**\
  Your repository may not be fully configured. Follow the instructions provided in [#recreate-the-workflow-file](../../setup/self-hosting-guide/updating.md#recreate-the-workflow-file "mention")to restore the action workflow.

</details>

<details>

<summary>My GitHub personal access token expired and I'm not sure what to do?</summary>

You don't need to do anything. The personal access token was only needed for initial deployment.

</details>
