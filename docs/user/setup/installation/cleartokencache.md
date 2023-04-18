---
id: cleartokencache
title: Clear Token Cache
slug: /gettingstarted/postinstall/cleartokencache
description: Setup access to my clients
---

# Clear Token Cache

### Hosted Clients

{% hint style="info" %}
Hosted clients can use the backend management system at [management.cipp.app](https://management.cipp.app) to execute a token cache clear.&#x20;
{% endhint %}

### Clear Token Cache

After first setup, or when renewing the RefreshToken you must clear the cache so the application can use the latest version of the RefreshToken.

1. Go to Settings
2. Select **Backend**
3. Select **Go to Function App Configuration**
4. At each item that has the source _Key Vault_ there should be a green checkbox. If there is no green checkbox, restart the function app and try in 30 minutes
5. Rename the _RefreshToken_ item to _RefreshToken2_
6. Select **Save**
7. Select **Overview** in the side menu
8. Stop the app & wait 5 minutes.
9. Start the app
10. Go back to **Configuration** in the side menu.
11. Change _RefreshToken2_ back to _RefreshToken_ and then Select **Save**.
12. Stop the app once more for 5 minutes then start it again.

The RefreshToken should no longer be in the cache.
