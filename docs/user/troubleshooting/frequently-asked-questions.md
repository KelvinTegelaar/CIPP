# Frequently Asked Questions

On this page you can find a list of frequently asked questions about the CyberDrain Improved Partner Portal (CIPP). If you're having specific issues with CIPP please also check the Troubleshooting page.

<details>

<summary>How much does CIPP cost to run?</summary>

Assuming you're running on the click-to-deploy configuration and average usage patterns it should cost $15 - $20 or £17 - £22 per month. You can check the costs, and estimated costs, for the resource group on the Azure Portal.

Please note it is your responsibility to ensure you are keeping an eye on costs within your instances.

</details>

<details>

<summary>Can I use IP whitelisting?</summary>

Yes. CIPP can use IP whitelisting. This feature is in preview at Azure and might break at any moment. Deploying this is down at your own risk. For the latest documentation on how to perform this check [here](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#networking)

</details>

<details>

<summary>Can I add Conditional Access to my CIPP App?</summary>

To add Conditional Access to CIPP, follow the below steps:

1. Go to your [Conditional Access Policies](https://portal.azure.com/#blade/Microsoft\_AAD\_IAM/ConditionalAccessBlade/Policies)
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

Check the MFA Troubleshooting section in the Troubleshooting page for more information.

</details>

<details>

<summary>My usernames or sites are GUIDs or blank?</summary>

Please see the standard "Enable Usernames instead of pseudo anonymised names in reports" [here](https://cipp.app/docs/user/usingcipp/tenantadministration/standards/#meet-the-standards)

</details>

<details>

<summary>Why can't I install CIPP using the "Deploy to Azure" button?</summary>

If you're experiencing issues with installation please report these in `#cipp-issues` on the [CIPP Discord](https://discord.gg/cyberdrain)

</details>

<details>

<summary>Why can't I get details for a particular tenant / any tenants?</summary>

1. You have a guest account in a tenant that has the same User Principal Name (UPN) as you used to generate your tokens.
2. Conditional access is blocking the correct functioning of the tokens - check your CA policies and also make sure you're not geo-blocking the function app's location.
3. You can't use third party MFA on the account used to generate Secure Application Model (SAM) tokens.

If your entire tenant list doesn't load, there is a big chance there is something wrong with your token configuration. Check the troubleshooting page for more information. If you are missing your own tenant, make sure you enable the flag to manage this tenant.

</details>

<details>

<summary>Can I lock down my instance of CIPP further by using Private Networks?</summary>

To protect CIPP as a private resource, that's only reachable over a Virtual Private Network (VPN) or IP allowlisting you can use Private Endpoint Connections.

To enable Private Endpoints you must already have an Azure VNet available, and understand how VNets work.

1. Go to CIPP
2. Go to Settings
3. Select **Backend**
4. Select **Go to role management**
5. Select **Private Endpoints**
6. Select **Add**
7. Setup your VNet information

CIPP is now no longer available publicly over the internet.

</details>

<details>

<summary>My tenant requires admin approval for user apps, how do I do this for CIPP?</summary>

If your Azure Tenant requires admin approval for user apps, add consent by following the below steps:

1. Go to [Azure Enterprise Applications](https://portal.azure.com/#blade/Microsoft\_AAD\_IAM/StartboardApplicationsMenuBlade/AllApps)
2. Find _Azure Static Websites_
3. Grant Admin Consent for all

This permits users the ability to grant consent when access CIPP now.

</details>

<details>

<summary>I'm getting a 500 error in CIPP, what's going on?</summary>

A 500 error is a generic server error. In CIPP this can hide many different issues. It could mean:

* You don't have valid licensing for the feature you're trying to use.
* The CIPP-API function app isn't responding correctly, is starting up or is down.

</details>

<details>

<summary>I'm getting a 400 error in CIPP, what's going on?</summary>

A 400 error is a generic access error. In CIPP this can hide many different issues. It could mean:

* You have issues with your tokens. Check the troubleshooting page for more information.
* You're trying to access a page that requires a specific role.
* You're trying to access a page that doesn't exist.

</details>
