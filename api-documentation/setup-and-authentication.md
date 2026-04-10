---
description: API Authentication
---

# Setup & Authentication

## Setup

Before being able to utilize the CIPP API, you need to first configure an API client via [cipp-api.md](../user-documentation/cipp/integrations/cipp-api.md "mention"). Once that is completed, come back to this page. You'll need the integration page still open to reference the necessary fields below for authentication.

{% hint style="warning" %}
#### Self-Hosted Clients

If you originally deployed CIPP prior to v7.1 you will need to follow the instructions on [self-hosted-api-setup.md](../setup/self-hosting-guide/self-hosted-api-setup.md "mention")
{% endhint %}

## Authentication

CIPP uses OAuth authentication to be able to connect to the API using your Application ID and Secret. You can use the PowerShell example below to connect to the API:

```powershell
$CIPPAPIUrl = "https://yourcippurl.com"
$ApplicationId = "your application ID"
$ApplicationSecret = "your application secret"
$TenantId = "your tenant id"

$AuthBody = @{
    client_id     = $ApplicationId
    client_secret = $ApplicationSecret
    scope         = "api://$($ApplicationId)/.default"
    grant_type    = 'client_credentials'
}
$token = Invoke-RestMethod -Uri "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token" -Method POST -Body $AuthBody

$AuthHeader = @{ Authorization = "Bearer $($token.access_token)" }
Invoke-RestMethod -Uri "$CIPPAPIUrl/api/ListLogs" -Method GET -Headers $AuthHeader -ContentType "application/json"

```

{% hint style="info" %}
If you are making an OAuth connection with any 3rd party service, make use of the copyable fields on the [cipp-api.md](../user-documentation/cipp/integrations/cipp-api.md "mention") integration page indicated by a blue outline. You will also need the API Scope, get this from the CIPP-API Clients table by clicking the Actions three dots for the row you are configuring and selecting `Copy API Scope`.
{% endhint %}

### Time and Rate Limits

The API actions have a maximum timeout of 10 minutes. There are no active rate limits, but heavy usage of the API can cause frontend operations to slow down.

## Endpoint documentation

{% content-ref url="endpoints.md" %}
[endpoints.md](endpoints.md)
{% endcontent-ref %}

## CIPP API Powershell Module

You can install the CIPP API Powershell module using PowerShell 7.x. The module takes care of all the authentication for you.

```powershell
Install-Module -Name CIPPAPIModule
```

You will first need to set your CIPP API Details using the following command:

```powershell
Set-CIPPAPIDetails -CIPPClientID "YourClientIDGoesHere" -CIPPClientSecret "YourClientSecretGoesHere" -CIPPAPIUrl "https://your.cipp.apiurl" -TenantID "YourTenantID"
```

You can then test its working

```powershell
Get-CIPPLogs
```

Further documentation for the module and each of its available functions can be found [here](https://github.com/BNWEIN/CIPPAPIModule/).

{% hint style="info" %}
This module is created and maintained by a community member. With CIPP's rapid development cycle, the module can be expected to lag behind in adding new endpoints. For those, it is recommended to use the command `Invoke-CIPPRestMethod`.
{% endhint %}

## Common Issues

1. If you are calling CIPP from an external automation platform (e.g., n8n, Rewst, Power Automate), make sure your base URL includes the `/api` path (e.g., `https://your-cipp-domain.com/api`). Direct API calls need to target the Azure Functions backend, not the static frontend — without `/api`, your requests will hit the web interface and return HTML instead of the expected JSON responses
2.  If you receive 400 (Bad Request) errors when first authenticating or testing your CIPP API connection (e.g. `Invoke-CIPPRestMethod: Response status code does not indicate success: 400 (Bad Request)`) your CIPP API app registration may be missing an Application ID URI.

    To fix this, go to **Microsoft Entra ID → App registrations** in your tenant and open the app registration for your CIPP API (not a separate client registration, unless your setup uses one). Navigate to **Expose an API**. If the **Application ID URI** field at the top is empty, click **Add**. Azure will auto-suggest a URI in the format `api://{application-id}`. The default is fine, no need to customize it. Click **Save**.

    If your setup requires a custom scope (e.g., `access_as_user`), you may also need to add one under **Expose an API → Add a scope** and then grant that scope as an API permission on the client side.

    After making changes, wait a minute or two before retrying authentication since propagation isn't always instant. If the error persists, try re-consenting to the app permissions.

{% include "../.gitbook/includes/feature-request.md" %}
