---
id: owntenant
title: Manage my own tenant
slug: /gettingstarted/postinstall/owntenant
description: I want to manage my own tenant
---

# I want to manage my own tenant

If you want to manage your own tenant, or if you are not a Microsoft Partner but still want to use CIPP you can set a flag in the configuration for this.

{% hint style="danger" %}
Unsupported configuration This configuration option is not officially supported. Configuring this means you are on your own for any bugs that occur on your instance. It is advised to not add the Partner Tenant inside a CSP environment and to really use this as a 'Single Tenant' mode.

If you enable this setting, any user with access to CIPP will be able to make any change to your internal tenant, including changing permissions to mailboxes, security groups, and all the aspects that CIPP manages. When running on the hosted environment we ask you to confirm you've read this statement before enabling the feature.
{% endhint %}

It is not recommended to use this functionality, and this might break at any point in time.

To set the flag follow these steps:

1. Go to your CIPP instance
2. Go the the settings menu
3. Go to the Backend tab.
4. Go to Function App (Configuration)
5. Add a new variable called "PartnerTenantAvailable" and set this to "True"
6. Clear the tenant cache. Users of CIPP now have access to the CSP Partner tenant.
