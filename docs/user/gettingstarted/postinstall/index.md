---
id: postinstall
title: Post-Install Configuration
description: How to configure CIPP after you've completed installation.
slug: /gettingstarted/postinstall
---

At this point you should have completed all the steps in [manual installation or click-to-deploy installation](../installation/) and your deployment has succeeded.

## Adding Users

After deployment, go to your resource group in Azure and select your Static Web Application (`cipp-swa-xxxx` if using click-to-deploy). Select Role Management and invite the users you want. Currently CIPP supports three roles, `reader`, `editor`, and `admin`. Further information on the roles and how to assign these is on the [Roles](../roles/) page.

You should now be able to browse to the custom domain or the default domain, and use the CIPP control panel.

## It's Not Working

:::caution Patience Young Padawan
For the first 30 minutes or so, the Function App (CIPP-API) runs slow whilst PowerShell modules are downloaded from Microsoft. At present we can't make this run any faster.
:::

If you have waited for at least 30 minutes and things are still not working restart the Function App (**Azure Portal > CIPP Resource Group > Function App > Overview > Restart**). This solves 99.9% of all issues. Turn it off, turn it on again.

If you're still stuck, check out the [FAQ](/faq) or [Troubleshooting](/troubleshooting) pages and if needed - create an issue [on GitHub](https://github.com/KelvinTegelaar/CIPP/issues) or seek help [on the CIPP Discord](https://discord.gg/cyberdrain)

## Adding a Custom Domain Name

:::tip Why setup a custom domain?

1. The automatically generated domain uses azurewebsites.net which is often blocked by web filtering products as it's often used by spammers and phishing sites due to the ease of obtaining an azurewebsites.net subdomain.
1. Your bookmark stays the same if you redeploy.
1. Easier to communicate internally and looks better for your team.

:::

At the moment of deployment, the application uses a generated domain name. To change this, go to your Resource Group in Azure, select your Static Web App (`cipp-swa-xxxx` if using click-to-deploy) and select Custom Domains. You can add your own domain name here. [Microsoft Docs - Set up a custom domain with free certificate in Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/custom-domain?tabs=azure-dns)
