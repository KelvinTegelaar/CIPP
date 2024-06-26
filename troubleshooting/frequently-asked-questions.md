# Frequently Asked Questions

On this page you can find a list of frequently asked questions about the CyberDrain Improved Partner Portal (CIPP). If you're having specific issues with CIPP please also check the Troubleshooting page.

<details>

<summary>How much does CIPP cost to run?</summary>

Assuming you're running on the click-to-deploy configuration and average usage patterns it should cost $15 - $20 or £17 - £22 per month. You can check the costs, and estimated costs, for the resource group on the Azure Portal.

Please note it is your responsibility to ensure you are keeping an eye on costs within your instances.

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

Please see the standard "Enable Usernames instead of pseudo anonymised names in reports" [here](https://docs.cipp.app/user-documentation/tenant/standards/edit-standards#meet-the-standards)

</details>

<details>

<summary>Why can't I install CIPP using the "Deploy to Azure" button?</summary>

If you're experiencing issues with installation please report these in `#cipp-issues` on the [CIPP Discord](https://discord.gg/cyberdrain)

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

<summary>Can I replace the default branding with my own in CIPP?</summary>

No, CIPP's branding is compiled into the code. Additionally the branding isn't just a decorative feature, it plays a role in helping maintain visibility and community growth.\
However, a custom logo can be added to reports. This can be done in the [User Settings page](../user-documentation/cipp/user-settings.md#user-settings).

</details>
