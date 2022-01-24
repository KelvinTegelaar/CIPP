---
id: postinstall
title: Post-Install Configuration
description: How to configure CIPP after you've completed installation.
slug: /gettingstarted/postinstall
---

At this point you should have completed all the steps in [manual installation](../manualinstall/) or [click to deploy installation](../ctdinstall/) and you're deployment has succeeded.

## Adding users to CIPP

After deployment, go to your resource group in Azure and click on your Static Web App (`cipp-swa-xxxx` if using automatic deployment). Click on Role Management and invite the users you want. Currently we support three roles, `reader`, `editor`, and `admin`. More info about the roles can be found on the [Roles](../roles/) page.

You should now be able to browse to the custom domain or the default domain, and use the CIPP control panel.

## It's not working, I'm having issues

For the first 30 minutes or more the application will respond pretty slowly, this is because, among other things, the Function App (CIPP-API) has to download PowerShell modules from Microsoft. We can't make this run any faster at this time. If you have waited for at least 30 minutes and things are still not working restart the Azure Function App (Azure Portal > CIPP Resource Group > Function App > Overview > Restart), this solves 99,9% of all issues. Turn it off, turn it on again. ;)

If you are still stuck, check out the [FAQ](/faq) page and if needed - create an issue [on GitHub](https://github.com/KelvinTegelaar/CIPP/issues) or seek help [on the CIPP Discord](https://discord.gg/cyberdrain)

## Adding a custom domain name

At the moment of deployment, the application will use a randomly generated name. To change this, go to your Resource Group in Azure, click on your Static Web App (`cipp-swa-xxxx` if using automatic deployment) and click on Custom Domains. You'll be able to add your own domain name here. [Microsoft Docs - Set up a custom domain with free certificate in Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/custom-domain?tabs=azure-dns)
