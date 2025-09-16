# I Want to Manage My Own Tenant

If you want to manage your own tenant or if you are not a Microsoft Partner but still want to use CIPP you can perform the setup and enable access to the partner tenant or enable Single Tenant Mode. The CIPP Service Account should be granted at least the [recommended-roles.md](recommended-roles.md "mention") within the tenant being managed.

{% hint style="warning" %}
To manage the tenant mode, a user with the CIPP "superadmin" roles will need to access the [tenant-mode.md](../../user-documentation/cipp/advanced/super-admin/tenant-mode.md "mention")page of the Super Admin settings.
{% endhint %}

### There are 3 different modes in CIPP to choose from:

* **Multi Tenant - GDAP mode**
  * This is the default mode in CIPP, it does not allow access to the partner tenant.
* **Multi Tenant - Add Partner Tenant**
  * This mode allows direct access to the partner tenant in addition to your customer tenants via GDAP. See the Limitations below for more details.
* **Single Tenant - Own Tenant Mode**
  * This mode is for if you would like to manage your own tenant and/or are not a Microsoft Partner. See the limitations below for more details.

## Limitations of Single Tenant Mode

When using Single Tenant Mode CIPP runs in a somewhat more limited state - You are not able to add any other tenant to CIPP and it only works for the configured tenant. GDAP permissions will not apply, and you must directly assigned roles such as Global Admin to the service account.

## Limitations of Partner Tenant Enabled

When using Partner Tenant Enabled mode you can see your partner tenant inside of CIPP. There will be no permissions applied to whom can see this tenant and control it.

{% hint style="danger" %}
It is highly recommended to use a custom role if multiple users have access to your CIPP instances. This can help ensure not all users have access to manage your partner tenant. If you do not, it's important to note that all your users will have access to edit/configure your partner tenant. Information on custom roles can be found [here](https://docs.cipp.app/setup/installation/roles#custom-roles).
{% endhint %}

GDAP permissions will not apply and you must directly assign roles to the service account in the Entra portal (e.g. User Administrator, Exchange Administrator, etc.).

## To set the tenant mode, follow these steps

1. Log in to CIPP with an account with the role `superadmin`. This role will allow you access to the menu to change this setting.
2. Go to the Application Settings menu
3. Go to the Super Admin tab
4. Select one of the three modes. The default mode is "Multi Tenant - GDAP Mode"
5. Clear the tenant cache. Users of CIPP now have access to the CSP Partner tenant, or to the single tenant it's been configured for.

***

{% include "../../.gitbook/includes/feature-request.md" %}
