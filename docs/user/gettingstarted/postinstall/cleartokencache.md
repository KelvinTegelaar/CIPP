---
id: cleartokencache
title: Clear Token Cache
description: Setup access to my clients
slug: /gettingstarted/postinstall/cleartokencache
---

## Hosted Clients

:::tip
Hosted clients can use the backend management system at management.cipp.app to execute a token cache clear.
:::

## Clear Token Cache

After first setup, or when renewing tokens you must clear the cache so the application can use the latest version of these tokens.



1. Go to Settings
1. Select **Backend**
1. Select **Go to Function App Configuration**
1. At each item that has the source _Key Vault_ there should be a green checkbox. If there is no green checkbox, restart the function app and try in 30 minutes
1. Rename the _RefreshToken_ item, for example to _RefreshToken2_
1. Select **Save**
1. Select **Overview** in the side menu
1. Stop the app & wait 5 minutes.
1. Start the app
1. Go back to **Configuration** in the side menu.
1. Reset the token names to their original values, for example back to _RefreshToken_ and then Select **Save**.
1. Stop the app once more for 5 minutes then start it again.

The tokens should no longer be in the cache.
