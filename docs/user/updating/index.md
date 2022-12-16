---
id: updating
title: Updating
description: How to update CIPP when new versions are released.
slug: /updating
---

:::caution Manual vs Automatic Updating
Note that the frontend updates automatically once you have done "Fetch & Merge" from GitHub, however the CIPP-API requires you to press a button on the resource in Azure itself. If you have a hosted version of CIPP, updates are deployed automatically.
:::

:::If you are prompted to choose "Discard (X) Commit" or "Update Branch" please **DO NOT** click the discard button. Simply choose "Update Branch":::

:::

Update your application to the latest release using the following instructions:

## Frontend

:::info CIPP
Note that if you receive a workflow error, check the [Troubleshooting page for potential fixes](/docs/general/troubleshooting)

- Go to your own CIPP fork on GitHub
- Select Sync fork
- Select Update branch

## Backend

:::info CIPP-API
To update the backend, you must manually fetch from GitHub and update the Azure resource yourself, following the below instructions
:::

- Go to your CIPP-API fork on GitHub
- Select Sync fork
- Select Update branch
- Go to the Azure Portal
- Go to your CIPP resource group
- Select the Azure Function App
- Select "Deployment Center"
- Select Sync.

:::success Success!
Check the [Dashboard](/docs/user/usingcipp/dashboard) and you should see all green once updated.
You've now updated the application.
:::

If you don't see the update immediately - give the function app half an hour or so to finish updating itself.
