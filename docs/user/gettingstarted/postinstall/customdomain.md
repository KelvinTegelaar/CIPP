---
id: customdomain
title: Adding a custom domain name
description: Custom domain
slug: /gettingstarted/postinstall/customdomain
---

## Adding a Custom Domain Name

:::tip Why setup a custom domain?

1. The automatically generated domain uses azurewebsites.net which is often blocked by web filtering products as it's often used by spammers and phishing sites due to the ease of obtaining an azurewebsites.net subdomain.
1. Your bookmark stays the same if you redeploy.
1. Easier to communicate internally and looks better for your team.

:::

At the moment of deployment, the application uses a generated domain name. To change this follow these instructions:

- Go to CIPPs Settings menu
- Click on 'Static Web app - Role Management'
- Select Custom Domains. You can add your own domain name here. 

For more information see Microsoft's documentation at [Microsoft Docs - Set up a custom domain with free certificate in Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/custom-domain?tabs=azure-dns)
