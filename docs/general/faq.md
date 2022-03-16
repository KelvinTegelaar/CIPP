---
id: faq
title: Frequently Asked Questions
description: Frequently asked questions regarding CIPP.
slug: /faq
---

<!-- vale Microsoft.FirstPerson = NO -->
<!-- vale Microsoft.HeadingAcronyms = NO -->
<!-- vale Microsoft.HeadingPunctuation = NO -->

On this page you can find a list of frequently asked questions about the CyberDrain Improved Partner Portal (CIPP). If you're having specific issues with CIPP please also check the [Troubleshooting](/troubleshooting) page.

<details>
<summary>

## Why can't I install CIPP using the "Deploy to Azure" button? {#deploy-to-azure}

</summary>

If you're experiencing issues with installation please report these in `#cipp-issues` on the [CIPP Discord](https://discord.gg/cyberdrain)

</details>

<details>
<summary>

## Why can't I get details for a particular tenant / any tenants? {#specific-tenant-issues}

</summary>

1. You have a guest account in a tenant that has the same User Principal Name (UPN) as you used to generate your tokens.
1. Conditional access is blocking the correct functioning of the tokens - check your CA policies and also make sure you're not geo-blocking the function app's location.
1. You can't use third party MFA on the account used to generate Secure Application Model (SAM) tokens.

If your entire tenant list doesn't load, there is a big chance there is something wrong with your token configuration. Check the [troubleshooting](/troubleshooting) page for more information. If you are missing your own tenant, make sure you enable the flag to manage this tenant.

</details>

<details>
<summary>

## I'm trying to redeploy or move my CIPP installation and it's not working. Something about a GitHub token. {#github-token}

</summary>

If you installed CIPP before the release of version 2, you deployed the `master` branch of your CIPP repository fork. From version 2 if you want to redeploy using the [click-to-deploy installation](/docs/user/gettingstarted/installation) you must [rename the `master` branch to `main`](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/renaming-a-branch) and then redeploy.

</details>

<details>

<summary>

## Can I lock down my instance of CIPP further? {#lockdown}

</summary>

To protect CIPP as a private resource, that's only reachable over a Virtual Private Network (VPN) or IP allowlisting you can use Private Endpoint Connections.

To enable Private Endpoints you must already have an Azure VNet available, and understand how VNets work.

1. Go to CIPP
1. Go to Settings
1. Select **Backend**
1. Select **Go to role management**
1. Select **Private Endpoints**
1. Select **Add**
1. Setup your VNet information

CIPP is now no longer available publicly over the internet.

</details>

<details>
<summary>

## Can I add Conditional Access to my CIPP App? {#conditional-access}

</summary>

To add Conditional Access to CIPP, follow the below steps:

1. Go to your [Conditional Access Policies](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ConditionalAccessBlade/Policies)
1. Select which users to apply the policy to, default suggestion is _"All Users"_
1. Select **Azure Static Web Apps** as the included app under "Cloud Apps or actions"
1. Configure any condition you want. For example Trusted Locations, specific IPs, specific platforms.

1. At Access Controls you must enable _Grant, with MFA access_.
1. Select **Save**

Your app is now protected with Conditional Access.

</details>

<details>
<summary>

## My tenant requires admin approval for user apps, how do I do this for CIPP? {#admin-approval}

</summary>

If your Azure Tenant requires admin approval for user apps, add consent by following the below steps:

1. Go to [Azure Enterprise Applications](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AllApps)
1. Find _Azure Static Websites_
1. Grant Admin Consent for all

This permits users the ability to grant consent when access CIPP now.

</details>

<details>
<summary>

## How much does CIPP cost to run? {#cost}

</summary>

Assuming you're running on the click-to-deploy configuration and average usage patterns it should cost $15 - $20 or £17 - £22 per month. You can check the costs, and estimated costs, for the resource group on the Azure Portal.

Please note it is your responsibility to ensure you are keeping an eye on costs within your instances.

</details>

<details>
<summary>

## I'm getting a 500 error in CIPP, what's going on? {#500-error}

</summary>

A 500 error is a generic server error. In CIPP this can hide many different issues. It could mean:

- You don't have valid licensing for the feature you're trying to use.
- The CIPP-API function app isn't responding correctly, is starting up or is down.

If you're still having issues, after checking licensing and that your function app is running correctly, please report them in `#cipp-issues` on the [CIPP Discord](https://discord.gg/cyberdrain).

</details>

<details>
<summary>

## I'm getting a 400 error in CIPP, what's going on? {#400-error}

</summary>

A 400 error is a generic access error. In CIPP this can hide many different issues. It could mean:

- You have issues with your tokens. Check the [troubleshooting](/docs/general/troubleshooting/) page for more information.
- You're trying to access a page that requires a specific role.
- You're trying to access a page that doesn't exist.

</details>

<details>
<summary>

## I'm getting an error that "you must use multi-factor authentication to access" what's going on? {#mfa-error}

</summary>

Typically this error means you're using tokens that don't have a "strong auth claim" or similar. This could be because you're using non-Azure AD MFA or you didn't complete MFA when creating your tokens for one or more of the authentication steps. Make sure you're using a supported MFA method and that you've completed the MFA steps when creating your tokens.

Check the [MFA Troubleshooting](/docs/general/troubleshooting/#multi-factor-authentication-troubleshooting) section in the Troubleshooting page for more information.

</details>

<!-- vale Microsoft.FirstPerson = YES -->
<!-- vale Microsoft.HeadingAcronyms = YES -->
<!-- vale Microsoft.HeadingPunctuation = YES -->
