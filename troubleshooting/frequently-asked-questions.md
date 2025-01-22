# Frequently Asked Questions

On this page you can find a list of frequently asked questions about the CyberDrain Improved Partner Portal (CIPP). If you're having specific issues with CIPP please also check the Troubleshooting page.

<details>

<summary>How much does CIPP cost to run?</summary>

Assuming you're running on the click-to-deploy configuration and average usage patterns it should cost $15 - $20 or £17 - £22 per month. You can check the costs, and estimated costs, for the resource group on the Azure Portal.

Please note it is your responsibility to ensure you are keeping an eye on costs within your instances.

</details>

<details>

<summary>What should I do if I'm experiencing performance issues in CIPP?</summary>

Performance issues in CIPP are not expected. If your performance appears impacted, you can follow these steps to diagnose and resolve the issue:

1. **Check Your Deployment Region:**
   * Ensure that you deployed to the nearest region. You can verify this at [Azure Speed](https://www.azurespeed.com).
2. **Clear Durable Queues:**
   * Go to your CIPP instance.
   * Open the Application Settings menu.
   * Click on "Maintenance".
   * Select "Clear Durable Queues".
3. **Purge Orchestrators:**
   * Click on "Purge Orchestrators".

For more information, refer to the [maintenance instructions](https://docs.cipp.app/user-documentation/cipp/settings/maintenance).

If you are self-hosted, you will also want to ensure you have configured [Run From Package](../setup/self-hosting-guide/runfrompackage.md) mode, which can help make sure your system is running efficiently on the backend.

</details>

<details>

<summary>Can I add Conditional Access to my CIPP App?</summary>

To add Conditional Access to CIPP, follow the below steps:

1. Go to your [Conditional Access Policies](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ConditionalAccessBlade/Policies)
2. Select which users to apply the policy to, default suggestion is _"All Users"_
3. Select **Azure Static Web Apps** as the included app under "Cloud Apps or actions"
4. Configure any condition you want. For example Trusted Locations, specific IPs, specific platforms.
5. At Access Controls you must enable _Grant, with MFA access_.
6. Select **Save**

Your app is now protected with Conditional Access.

</details>

<details>

<summary>I'm getting an error that "you must use multi-factor authentication to access" what's going on?</summary>

Typically this error means you're using tokens that don't have a "strong auth claim" or similar. This could be because you're using non-Azure AD MFA or you didn't complete MFA when creating your tokens for one or more of the authentication steps. Make sure you're using a supported MFA method and that you've completed the MFA steps when creating your tokens.

Check the [MFA Troubleshooting](troubleshooting.md#multi-factor-authentication-troubleshooting) details in the Troubleshooting section for more information.

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

Complete all checks for effective troubleshooting. If you still have issues or for detailed instructions, refer to the[refreshing-a-specific-tenants-permissions-via-cpv-api.md](troubleshooting-instructions/refreshing-a-specific-tenants-permissions-via-cpv-api.md "mention") page, the [troubleshooting instructions](https://docs.cipp.app/troubleshooting/troubleshooting-instructions) page, and the relevant sections on our [**Error Codes**](https://docs.cipp.app/troubleshooting/troubleshooting) page.

</details>

<details>

<summary>I'm getting missing permissions errors when performing the Permissions Check on my CIPP-SAM application. How can I fix this?</summary>

Sometimes when you are running a permissions check, you may encounter specific errors that you are missing some of the API permissions required for CIPP to perform as expected.

To ensure full functionality of CIPP, follow these steps to add the necessary API permissions:

1. **Review the** [**required permissions**](../setup/installation/permissions.md) **for the Secure Application Model registration:**
   * Pay attention to the hint boxes on the page, which explain how to find APIs not listed under Graph.
2. **Add any missing permissions in the** [**App Registrations**](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps) **section of your Azure Portal.**
   * Some permissions may appear duplicated in both Delegated and Application permissions tables. This is intentional; add both sets of permissions.
   * Some permissions come from other APIs besides Microsoft Graph. These are indicated by names in brackets (e.g., (WindowsDefenderATP)).
   * To add these permissions, go to "APIs my organization uses" instead of "Microsoft Graph." Look for the exact name in brackets to find and add the correct resource.

**Note: These tasks must be executed in your own tenant, as authentication is performed using your credentials.**

</details>

<details>

<summary>How can I resolve expired / revoked auth token errors or ensure the correct service account is used by CIPP?</summary>

This error occurs because the user who authorized the CSP or Graph API connection has had their password changed, sessions revoked, or account disabled. Reauthorization is required.

**To resolve this,** e**xecute the SAM Wizard with Option 2:**

* Go to CIPP -> Application Settings -> SAM Setup Wizard.
* Select "I would like to refresh my token or replace the user I've used for my previous token."

**Important:** Ensure your browser allows cookies, disable any ad-blockers, and do not use in-private mode.

For more details, refer to:

* [Troubleshooting guide](https://docs.cipp.app/troubleshooting/troubleshooting#the-provided-grant-has-expired-due-to-it-being-revoked-a-fresh-auth-token-is-needed.-the-user-might)
* [SAM Wizard best practices](https://docs.cipp.app/setup/installation/samwizard)

</details>

<details>

<summary>How do I resolve issues with the wrong CIPP-SAM user / Service Account?</summary>

1. **Perform a Permissions Check:**
   * Go to CIPP -> Settings -> Permissions Check.
   * Click the **Details** button when it appears to see the username used for the SAM setup.
2. **Ensure the Correct User:**
   * The user needs to be in the GDAP groups and the AdminAgents group.
   * If the wrong user is used, go to CIPP -> SAM Setup Wizard.
   * Select "I would like to refresh my token or replace the user I've used for my previous token."

For more details, refer to the [SAM Wizard best practices](https://docs.cipp.app/setup/installation/samwizard).

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
   * Go to CIPP -> Application Settings -> Permission Check.
   * Click the **Details** button to find the CIPP service account.

</details>

<details>

<summary>How do I resolve a missing GDAP permission error?</summary>

This error may occur because the user is not in any of the GDAP groups. To resolve this:

1. **Check Recommended GDAP Roles and Relationships:**
   * Refer to the [recommended GDAP roles and relationships](https://docs.cipp.app/setup/installation/permissions) document.
2. **Perform a Tenant Access Check:**
   * Go to CIPP -> Settings -> Tenant Access Check.
   * This will show you which roles might be missing.

For more details, refer to the [permissions setup guide](https://docs.cipp.app/setup/installation/permissions).

</details>

<details>

<summary>Does CIPP require a specific license?</summary>

No, CIPP can work with any M365 license, for specific features CIPP will of course the tenant to be licensed correctly; e.g. to manage Intune, the tenant must have Intune Licensing.

</details>

<details>

<summary>My usernames or sites are GUIDs or blank?</summary>

Please see the standard "Enable Usernames instead of pseudo anonymized names in reports" [here](https://docs.cipp.app/user-documentation/tenant/standards/edit-standards#meet-the-standards)

</details>

<details>

<summary>Why can't I install CIPP using the "Deploy to Azure" button?</summary>

If you're experiencing issues with installation please report these in `#cipp-community-help` on the [CIPP Discord](https://discord.gg/cyberdrain)

</details>

<details>

<summary>My tenant requires admin approval for user apps, how do I do this for CIPP?</summary>

If your Azure Tenant requires admin approval for user apps, add consent by following the below steps:

1. Go to [Azure Enterprise Applications](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AllApps)
2. Find _Azure Static Websites_
3. Grant Admin Consent for all

This permits users the ability to grant consent when access CIPP now.

</details>

<details>

<summary>Can I replace the default branding with my own in CIPP?</summary>

No, CIPP's branding is compiled into the code. Additionally the branding isn't just a decorative feature, it plays a role in helping maintain visibility and community growth.\
However, a custom logo can be added to reports. This can be done in the [User Settings page](../user-documentation/shared-features/user-settings.md#user-settings).

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
   * Go to CIPP -> Application Settings -> Permissions Check.
   * Click the **Details** button.
2. **Locate the Correct AppID:**
   * There will be a direct link to the application CIPP currently uses.
   * You can safely delete the other AppIDs.

For more details, refer to the [permissions check guide](https://docs.cipp.app/setup/installation/permissions).

</details>

<details>

<summary>How do I find the SAM App that CIPP is currently using?</summary>

To find the SAM App that CIPP is currently using, follow these steps:

1. **Run a Permissions Check:**
   * Go to CIPP -> Application Settings -> Permissions Check.
   * Click the **Details** button.
2. **Locate the SAM App:**
   * This will show you the user, IP, and a direct link to the application currently in use by CIPP.

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

<summary><strong>Does editing the tenant display name in CIPP only affect what is shown in CIPP?</strong></summary>

No, CIPP reflects the tenant name set in the Microsoft Partner Center. When a tenant is added to CIPP, its name is pulled from the Partner Center once. If the name changes in the Partner Center, CIPP does not automatically update it.

To refresh the tenant name in CIPP:

1. Go to **Application Settings > Tenant**.
2. Select the tenant and delete it.
3. Clear the tenant cache and wait for the system to refresh the data from the Partner Center.

This ensures the display name in CIPP matches the current name in the Partner Center.

</details>

<details>

<summary>When trying to onboarding a GDAP relationship, I received an error that only x amount of groups were found, or that the group is not assigned to a user. What does this mean?</summary>

This error can mean two things;

* You migrated using different tools, such as Microsoft Lighthouse.
* You didn't assign the groups to the user after migrating.

Make sure you assign the correct groups to the CIPP service account. For more information see our best practices [here](../setup/installation/samwizard.md#authorization-best-practices-for-cipp).

</details>

<details>

<summary>I've already setup my GDAP relationships, and given them access to a Global Administrator role. Can I still auto-extend these after their expiration?</summary>

Auto Extend is only available for relationships without the Global Administrator role. If your relationship contains the Global Administrator role you cannot enable this feature. This means that you will need to renew the relationship by reinviting the tenant every 2 years.

</details>

<details>

<summary>Troubleshooting CIPP-API Updating and Action Workflow Issues</summary>

If your CIPP-API isn't updating, start by checking the Actions tab in your repository for a workflow named `_master*.yml`.

* **If the workflow is missing:**\
  Your repository may not be fully configured. Follow the instructions provided [here](https://docs.cipp.app/setup/self-hosting-guide/runfrompackage) to restore the action workflow.

</details>
