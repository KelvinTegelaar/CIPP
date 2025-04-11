---
description: API Authentication
---

# Setup & Authentication

## Authentication

CIPP uses OAuth authentication to be able to connect to the API using your Application ID and secret. You can use the PowerShell example below to connect to the API

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
If you are making an OAuth connection with any 3rd party service, make use of the copyable fields on the CIPP-API integration page indicated by a blue outline. You will also need the API Scope, get this from the API Client > Actions > Copy API Scope.
{% endhint %}

### Time and rate limits

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

Further documentation for the module and each of its available functions can be found [here](https://github.com/BNWEIN/CIPPAPIModule/)

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
