---
description: API Authentication
---

# Setup & Authentication

## Setup

Before being able to utilize the CIPP API, you need to first configure an API client via [cipp-api.md](../user-documentation/cipp/integrations/cipp-api.md "mention"). Once that is completed, come back to this page. You'll need the integration page still open to reference the necessary fields below for authentication.

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

{% content-ref url="endpoints/" %}
[endpoints](endpoints/)
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

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
