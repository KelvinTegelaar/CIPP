# Tenant Mode

Super admins should use this page to determine which mode CIPP operates in.

{% hint style="danger" %}
For further information on the limitations of each mode, please review "[I want to manage my own tenant](../../../../setup/installation/owntenant.md)"
{% endhint %}



| Mode                              | Description                                                                                                                                                                                                                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multi Tenant - GDAP Mode          | This is the default CIPP mode. This presents you with your client tenants only.                                                                                                                                                                                                                |
| Multi Tenant - Add Partner Tenant | Optionally enabled, this mode will allow you to manage your partner tenant through CIPP also. It is recommended that if you are going to enable this mode that you review the information on limitations and securing your partner tenant [here](../../../../setup/installation/owntenant.md). |
| Single Tenant - Own Tenant Mode   | Optionally enabled, this mode will allow CIPP to be deployed to a single tenant only. It is recommended that if you are going to enable this mode that you review the information on limitations and securing your partner tenant [here](../../../../setup/installation/owntenant.md).         |

{% hint style="warning" %}
After changing the tenant mode, clear your tenant cache by clicking Force Refresh on the [Tenants](../../settings/tenants.md) settings page.
{% endhint %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
