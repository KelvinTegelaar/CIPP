# Frequently Asked Questions

<details>
<summary>Why can't I install CIPP using the "Deploy to Azure" button?</summary>

If you're experiencing issues with installation please report these in `#cipp-issues` on the [CIPP Discord](https://discord.gg/cyberdrain)

</details>

<details>
<summary>Why can't I get details for a particular tenant / any tenants?</summary>

1. If you have a guest account in a tenant that has the same UPN as    you used to generate your tokens - you will experience issues.
1. Conditional access may block the correct functioning of the tokens - check your CA policies and also make sure you're not geo-blocking the function app's location.
1. You cannot use third party MFA on the account used to generate SAM tokens.

If your entire tenant list does not load, there is a big chance there is something wrong with your token configuration. Check the [troubleshooting](/troubleshooting) page for more information.
</details>

<details>
<summary>I'm trying to redeploy or move my CIPP installation and it's not working. Something about a GitHub token.</summary>

If you installed CIPP prior to the release of version 2, you will have deployed the `master` branch of your CIPP repository fork. Since version 2 if you want to redeploy using the [click to deploy installation](/docs/user/gettingstarted/installation) you will need to [rename the `master` branch to `main`](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/renaming-a-branch) and then redeploy.

</details>

<details>
<summary> Can I lock down my instance of CIPP further? </summary>

To protect CIPP as a private resource, that is only accessible over a VPN or IP whitelisting you can use Private Endpoint Connections.

To enable Private Endpoints you must already have an Azure VNET available, and understand how VNets work.

1. Go to CIPP
1. Go to Settings
1. Click on **Backend**
1. Click on **Go to role management**
1. Click on **Private Endpoints**
1. Click on **Add**
1. Setup your vnet information

CIPP is now no longer internet accessible

</details>

<details>
<summary> Can I add Conditional Access to my CIPP App?</summary>

To add Conditional Access to CIPP, follow the below steps:

1. Go to your [Conditional Access Policies](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ConditionalAccessBlade/Policies)
1. Select which users to apply the policy to, default suggestion is *"All Users"*
1. Click on **Azure Static Web Apps** as the included app under "Cloud Apps or actions"
1. Configure any condition you want.

> e.g Trusted Locations, specific IPs, specific platforms, etc

1. At Access Controls you must enable *Grant, with MFA access*.
1. Click on **Save**

Your app is now protected with Conditional Access.

</details>

<details>
<summary> My tenant requires admin approval for user apps, how do I do this for CIPP? </summary>

If your Azure Tenant requires admin approval for user apps, add consent by following the below steps:

1. Go to to [Azure Enterprise Applications](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AllApps)
1. Find *Azure Static Websites*
1. Grant Admin Consent for all

This will allow the users the ability to grant their own access now

</details>
