---
description: Tips for local development
---

# Development Tips

### Reusing Local Settings

You can reuse your `local.settings.json` file to test direct calls to Microsoft's Graph API, first setup environment variables from the values in your `local.settings.json` file:

```powershell
### Read the local.settings.json file and convert to a PowerShell object.
$CIPPSettings = Get-Content .\local.settings.json | ConvertFrom-Json | Select-Object -ExpandProperty Values
### Loop through the settings and set environment variables for each.
$ValidKeys = @('TenantId', 'ApplicationId', 'ApplicationSecret', 'RefreshToken', 'ExchangeRefreshToken')
ForEach ($Key in $CIPPSettings.PSObject.Properties.Name) {
    if ($ValidKeys -Contains $Key) {
        [Environment]::SetEnvironmentVariable($Key, $CippSettings.$Key)
    }
}
```

This creates environment variables which you can access directly in PowerShell or in other scripts using `$ENV:<key>`. For example to use the refresh token you could use: `$ENV:RefreshToken`.

Here's an example using the environment variables in a PowerShell script to call the Microsoft Graph API:

```powershell
### Setup body for the call to the Microsoft Graph API.
$AuthBody = @{
    client_id = $ENV:ApplicationId
    client_secret = $ENV:ApplicationSecret
    scope = 'https://graph.microsoft.com/.default'
    grant_type = 'refresh_token'
    refresh_token = $ENV:RefreshToken
}
### Splat the parameters for the call to the Microsoft Graph API.
$AuthParams = @{
    URI = "https://login.microsoftonline.com/$($ENV:TenantId)/oauth2/v2.0/token"
    Body = $AuthBody
    Method = 'POST'
    ContentType = 'application/x-www-form-urlencoded'
    ErrorAction = 'Stop'
}
### Make a call to the Microsoft Graph API for an access token.
$AccessToken = (Invoke-RestMethod @AuthParams).access_token

$GraphHeader = @{
    Authorization = "Bearer $AccessToken"
}

### Splat the parameters for the call to the Microsoft Graph API.
$GraphParams = @{
    URI = 'https://graph.microsoft.com/v1.0/contracts?$top=999'
    Headers = $GraphHeader
    Method = 'GET'
    ErrorAction = 'Stop'
}

### Get all tenants your token has access to.
(Invoke-RestMethod @GraphParams).value | ft
```

{% hint style="danger" %}
This adds your Graph Tokens as environment variables to your PowerShell session. This represents a security risk and you should use it only for testing / development purposes.

You can clean up the environment variables set in the earlier script by running:

```powershell
$EnvironmentVariables = @('TenantId', 'ApplicationId', 'ApplicationSecret', 'RefreshToken', 'ExchangeRefreshToken')
ForEach ($Key in $EnvironmentVariables) {
    [Environment]::SetEnvironmentVariable($Key, $null)
}
```

It is also important to note that running locally removes the SWA authentication aspect of the app, meaning that anyone on your LAN could connect to the instance.
{% endhint %}
