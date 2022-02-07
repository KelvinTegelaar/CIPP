---
id: updating
title: Updating
description: How to update CIPP when new versions are released.
slug: /updating
---

## Overview

:::caution Manual vs Automatic Updating

Note that the frontend updates automatically once you have done "Fetch & Merge" from GitHub, however the CIPP-API requires you to press a button on the resource in Azure itself.
:::

Updating your application to the latest release can be done by the following instructions



## Detail

### CIPP (Frontend)

:::info CIPP

Note that if you receive a workflow error, check the [Troubleshooting page for potential fixes](/troubleshooting)
:::


* Go to your own CIPP fork on GitHub 

> e.g <https://github.com/Username/CIPP>

* Click on Fetch Upstream
* Click on Fetch and Merge

### CIPP-API (Backend)

:::info CIPP-API

To update the backend, you must manually fetch from github and update the Azure resource yourself, following the below instructions

:::

* Go to your CIPP-API fork on GitHub
* Click on Fetch Upstream
* Click on Fetch and Merge
* Go to the Azure Portal
* Go to your CIPP resource group
* Click on the Azure Function
* Click on "Deployment Center"
* Click on Sync.

:::success Success!
Check the [Dashboard](/docs/user/usingcipp/dashboard) and you should see all green once updated.

You've now updated the application.

:::
