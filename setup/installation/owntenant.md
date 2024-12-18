---
description: I want to manage my own tenant
---

# I want to manage my own tenant

If you want to manage your own tenant, or if you are not a Microsoft Partner but still want to use CIPP you can perform the setup and enable access to the partner tenant, or enable Single Tenant Mode. The CIPP Service Account should be granted at least the [Recommended Roles](../gdap/recommended-roles.md) within the tenant being managed.

## Limitations Single Tenant Mode

When using Single Tenant Mode CIPP runs in a somewhat more limited state - You are not able to add any other tenant to CIPP and it only works for the configured tenant. GDAP permissions will not apply and you must directly assigned roles such as Global Admin to the service account.

## Limitations Partner Tenant Enabled

When using Partner Tenant Enabled mode you can see your partner tenant inside of CIPP. There will be no permissions applied to whom can see this tenant and control it.

{% hint style="danger" %}
It is highly recommended to use a custom role if multiple users have access to your CIPP instances. This can help ensure not all users have access to manage your partner tenant. If you do not, its important to note that all your users will have access to edit/configure your partner tenant.
{% endhint %}

GDAP permissions will not apply and you must directly assign roles to the service account in the Entra portal (e.g. User Administrator, Exchange Administrator, etc).

To set the flag follow these steps:

1. Add the role 'superadmin' to your admin user as an additional role. Ensure that the 'admin' role isn't accidentally removed in the process (See [roles.md](roles.md "mention") for more information). This role will allow you access to the menu to change this setting.
2. Go to the Application Settings menu
3. Go to the SuperAdmin tab
4. Select one of the three modes. The default mode is "Multi Tenant - GDAP Mode"
5. Clear the tenant cache. Users of CIPP now have access to the CSP Partner tenant, or to the single tenant it's been configured for.
