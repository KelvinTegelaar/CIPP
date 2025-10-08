# Executing Local Development

{% hint style="info" %}
SAM Tokens for Development We **strongly** recommend that you setup an entirely separate SAM app for development purposes. You can use the script below to get the required RefreshToken.

<details>

<summary>Click to view script</summary>

```powershell
function New-PartnerRefreshToken {
    <#
    .SYNOPSIS

    .DESCRIPTION

    .EXAMPLE
 
    #>
    [CmdletBinding()]
    param (
        [Parameter(Mandatory=$true)]
        [string]$clientId,

        [Parameter(Mandatory=$true)]
        [string]$clientSecret,

        [Parameter(Mandatory=$true)]
        [string]$tenantId,

        [Parameter(Mandatory=$true)]
        [string[]]$scopes
    )

    $redirectUri = "http://localhost:8400"
    $codeVerifier = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString("N") + [System.Guid]::NewGuid().ToString("N")))
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($codeVerifier)
    $codeChallenge = [Convert]::ToBase64String([System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    $joinedScopes = $scopes -Join " "
    $authUrl = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/authorize?client_id=$clientId&response_type=code&redirect_uri=$redirectUri&response_mode=query&scope=$joinedScopes&state=12345&code_challenge=$codeChallenge&code_challenge_method=S256&prompt=select_account"

    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($redirectUri + '/')
    $listener.Start()
    Start-Process "$authUrl"
    $context = $listener.GetContext()
    $response = $context.Response
    $requestUrl = $context.Request.Url.ToString()
    $code = [System.Web.HttpUtility]::ParseQueryString($context.Request.Url.Query).Get("code")
    
    $messageBody = "<h1>Authentication Successful</h1><p>You have successfully authenticated.</p><p>Return to the PowerShell terminal to see the token</p>"
    $htmlContent = ('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Authentication Success</title><style>body{font-family:''Helvetica Neue'',Helvetica,Arial,sans-serif;margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;background-color:#f8f9fa;color:#212529}.message{text-align:center;padding:20px;background-color:#fff;border:1px solid #dee2e6;border-radius:0.25rem;box-shadow:0 0.5rem 1rem rgba(0,0,0,.15)}h1{color:#007bff}</style></head><body><div class="message">' +$messageBody + '</div></body></html>')
    $buffer = [System.Text.Encoding]::UTF8.GetBytes($htmlContent)
    $response.ContentLength64 = $buffer.Length
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.OutputStream.Close()
    $listener.Stop()

    $tokenUrl = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
    $body = @{
        client_id = $clientId
        client_secret = $clientSecret
        scope = $encodedScopes
        code = $code
        redirect_uri = $redirectUri
        grant_type = "authorization_code"
        code_verifier = $codeVerifier
    }
    $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"

    return [pscustomobject]@{
        clientId = $clientId
        clientSecret = $clientSecret
        refreshToken = $response.refresh_token
    }
}
```

Download the script and save it as `New-PartnerRefreshToken.ps1` in your `Downloads` folder. You can then run the script to get the RefreshToken you need.

```powershell
Import-Module "$HOME\Downloads\New-PartnerRefreshToken.ps1"
$HOME\Downloads\New-PartnerRefreshToken.ps1
```

Input `https://graph.microsoft.com/.default offline_access` as the scope.

</details>
{% endhint %}

So first you need tokens for a Secure Application Model (SAM) application and you should have completed setting up for local development

{% hint style="info" %}
Recommended Extensions If you use the [Visual Studio Code](https://code.visualstudio.com/) editor when you open the folder containing the CIPP frontend you'll be presented with the option to install recommended extensions.
{% endhint %}

First install the needed packages for the frontend:

```sh
cd "X:\Development\CIPP-Project\CIPP"
yarn install --network-timeout 500000
```

You should now have everything you require to start a local development instance of the Azure Function App (API), the Static Web App (frontend) or both.

Starting only the frontend:

```sh
swa start 'X:\Development\CIPP-Project\CIPP' --swa-config-location "C:\DoesntExist"
```

We use an invalid path for `--swa-config-location` on purpose. We do this because the config provided in the CIPP folder only works for the actual Static Web Application (SWA) engine and not the local emulator.

To start only the API function app:

```sh
func start --script-root "X:\Development\CIPP-Project\CIPP-API"
```

To start both, it's recommended to use `func start` and `swa start` independently. You can also have the SWA utility start the API but this brings in some added difficulties because you can't see the API logs directly in the console.

```sh
func start --script-root "X:\Development\CIPP-Project\CIPP-API"
swa start "X:\Development\CIPP-Project\CIPP" --swa-config-location "C:\DoesntExist" --api-location http://localhost:7071/
```

Or start everything

```sh
cd X:\Development\CIPP-Project
azurite
cd X:\Development\CIPP-Project\CIPP-API
func start
cd X:\Development\CIPP-Project\CIPP
yarn run start swa
cd X:\Development\CIPP-Project\CIPP
yarn run dev
```

If you need the APIs to connect to Microsoft 365 and / or to test the Secure Application Model functionality itself you have to make a `local.settings.json` file in the `CIPP-API` folder. This file isn't detected by git (because of the `.gitignore` file) so it's not pushed with any changes/contributions you make. This file stores the Secure Application Model tokens, and a Azure Storage connection string for the durable function queues.

The contents of your `local.settings.json` file differs depending on whether you are using the Azurite storage emulator or Azure Storage itself.

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "powershell",
    "FUNCTIONS_WORKER_RUNTIME_VERSION": "7.4",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "DEV_SKIP_BPA_TIMER": true,
    "DEV_SKIP_DOMAIN_TIMER": true,
    "FUNCTIONS_EXTENSION_VERSION": "4",
    "AzureWebJobs.BestPracticeAnalyser_OrchestrationStarterTimer.Disabled": true,
    "AzureWebJobs.Domain_OrchestrationStarterTimer.Disabled": true,
    "WEBSITE_SITE_NAME": "<mylocalcippinstance>",
  }
}
```

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "powershell",
    "FUNCTIONS_WORKER_RUNTIME_VERSION": "7.4",
    "AzureWebJobsStorage": "DefaultEndpointsProtocol=<AZURESTORAGECONNECTIONSTRING>",
    "ApplicationID": "<APPLICATION ID>",
    "ApplicationSecret": "<APPLICATION SECRET>",
    "RefreshToken": "<REFRESH TOKEN>",
    "TenantID":"<TENANT ID>",
    "DEV_SKIP_BPA_TIMER": true,
    "DEV_SKIP_DOMAIN_TIMER": true,
    "SetFromProfile": true,
    "FUNCTIONS_EXTENSION_VERSION": "4",
    "AzureWebJobs.BestPracticeAnalyser_OrchestrationStarterTimer.Disabled": true,
    "AzureWebJobs.Domain_OrchestrationStarterTimer.Disabled": true,
    "WEBSITE_SITE_NAME": "mylocalcippinstance"
  }
}
```

Optional Values:

```json
    "ExternalDurablePowerShellSDK": true
```

{% hint style="info" %}
If you open the CIPP project in [Visual Studio Code](https://code.visualstudio.com/) there is a `launch.json` file that you can use to start the API, frontend, Azurite and, the SWA emulator.

You can consult the documentation on [Debugging in Visual Studio Code](https://code.visualstudio.com/docs/editor/debugging) for more information.

The launch task you're looking for is `Launch in Windows Terminal` or `Launch it all 🚀`. Which launches everything required to run CIPP locally. Once started you can navigate to CIPP by visiting [localhost:4280](https://localhost:4280/).
{% endhint %}
