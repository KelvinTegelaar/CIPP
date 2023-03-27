---
id: runfrompackage
title: Run from Package mode
description: Enable Run From Package for lower costs
slug: /gettingstarted/postinstall/runfrompackage
---

## Enable Run From Package mode for better performance and lower costs

:::caution Not required

The below action is not required if we are hosting your cipp instance for you. In that case after 7 days we enable "Run from Package mode" for you
:::

1. Go to CIPP
1. Visit each page you want to save the contents of, e.g. Standards, Intune Templates, Applications, Alerts, Visiting the page automatically migrates the data to Azure Tables.
1. Go to Settings -> Backend
1. Click on "Function app Configuration"
1. Click on "New Application Setting"
1. Add an application setting with the name "WEBSITE_RUN_FROM_PACKAGE" and the value "1"
1. Click Save at the top
1. Click on Deployment Center
1. Click on "Disconnect"
1. Select the source "Github"
1. Login if required
1. Select the Organisation, Repository, and Branch you want for your CIPP-API. Click on "Add a worklow". Do not change any other settings.
1. Click save at the top.
1. Restart the Function App
