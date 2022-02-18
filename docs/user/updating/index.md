---
id: updating
title: Updating
description: How to update CIPP when new versions are released.
slug: /updating
---

:::caution Manual vs Automatic Updating
Note that the frontend updates automatically once you have done "Fetch & Merge" from GitHub, however the CIPP-API requires you to press a button on the resource in Azure itself.
:::

Update your application to the latest release using the following instructions:

## Frontend

:::info CIPP
Note that if you receive a workflow error, check the [Troubleshooting page for potential fixes](/docs/general/troubleshooting)
:::

* Go to your own CIPP fork on GitHub 
* Select Fetch Upstream
* Select Fetch and Merge

## Backend

:::info CIPP-API
To update the backend, you must manually fetch from GitHub and update the Azure resource yourself, following the below instructions
:::

* Go to your CIPP-API fork on GitHub
* Select Fetch Upstream
* Select Fetch and Merge
* Go to the Azure Portal
* Go to your CIPP resource group
* Select the Azure Function
* Select "Deployment Center"
* Select Sync.

:::success Success!
Check the [Dashboard](/docs/user/usingcipp/dashboard) and you should see all green once updated.
You've now updated the application.
:::

If you don't see the update immediately - give the function app half an hour to finish updating itself.
