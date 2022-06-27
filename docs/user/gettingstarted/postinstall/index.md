---
id: postinstall
title: Post-Install Configuration
description: How to configure CIPP after you've completed installation.
slug: /gettingstarted/postinstall
---

At this point you should have completed all the steps in [manual installation or click-to-deploy installation](../installation/) and your deployment has succeeded. Any Red cross means your deployment has failed and you should retry, following all the steps.

## Adding Users

After deployment, go to your resource group in Azure and select your Static Web Application (`cipp-swa-xxxx` if using click-to-deploy). Select **Role Management** and invite the users you want. Currently CIPP supports three roles, `reader`, `editor`, and `admin`. Further information on the roles and how to assign these is on the [Roles](../roles/) page.

You should now be able to browse to the custom domain or the default domain, and use the CIPP control panel.

## Setting up access to tenants

If you are logged in, you'll be greeted by the Dashboard that will most likely tell you to setup your SAM application. You can do this by going to Settings -> SAM Wizard and following the instructions.

:::danger Secure Application Model account
It is **strongly** recommended that you use a separate global administrator account for each Secure Application Model application you create. This avoids conflicts that occur when using existing accounts which may be in customer tenants as guest users and provides better tracing in audit logs.

**This service account should be a Global Admin (in your tenant) and given Admin Agent permissions in partner Center. This account must have MFA enforced**.
:::

## It's Not Working

If you have waited for at least 30 minutes and things are still not working restart the Function App (**Azure Portal > CIPP Resource Group > Function App > Overview > Restart**). This solves 99.9% of all issues. Turn it off, turn it on again.

If you're still stuck, check out the [FAQ](/docs/general/faq/) or [Troubleshooting](/troubleshooting) pages and if needed - create an issue [on GitHub](https://github.com/KelvinTegelaar/CIPP/issues) or seek help [on the CIPP Discord](https://discord.gg/cyberdrain)

## Adding a Custom Domain Name

:::tip Why setup a custom domain?

1. The automatically generated domain uses azurewebsites.net which is often blocked by web filtering products as it's often used by spammers and phishing sites due to the ease of obtaining an azurewebsites.net subdomain.
1. Your bookmark stays the same if you redeploy.
1. Easier to communicate internally and looks better for your team.

:::

At the moment of deployment, the application uses a generated domain name. To change this, go to your Resource Group in Azure, select your Static Web App (`cipp-swa-xxxx` if using click-to-deploy) and select Custom Domains. You can add your own domain name here. [Microsoft Docs - Set up a custom domain with free certificate in Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/custom-domain?tabs=azure-dns)

## I want to manage my own tenant

If you want to manage your own tenant, or if you are not a Microsoft Partner but still want to use CIPP you can set a flag in the configuration for this. Be warned that anyone with access to CIPP can then manage your internal tenant too.

It is not recommended to use this functionality, and this might break at any point in time. 

To set the flag follow these steps:

1. Go to your CIPP instance
2. Go the the settings menu
3. Go to the Backend tab.
4. Go to Function App (Configuration)
5. Add a new variable called "PartnerTenantAvailable" and set this to "True"
6. Clear the tenant cache. Users of CIPP now have access to the CSP Partner tenant.
