# Executing Local Development

{% hint style="info" %}
SAM Tokens for Development We **strongly** recommend that you setup an entirely separate SAM app for development purposes. You can use the script and information found here https://www.gavsto.com/secure-application-model-for-the-layman-and-step-by-step/ to set one up, and to get the required tokens
{% endhint %}

So first you need tokens for a Secure Application Model (SAM) application and you should have completed setting up for local development

{% hint style="info" %}
Recommended Extensions If you use the [Visual Studio Code](https://code.visualstudio.com/) editor when you open the folder containing the CIPP frontend you'll be presented with the option to install recommended extensions.
{% endhint %}

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

If you need the APIs to connect to Microsoft 365 and / or to test the Secure Application Model functionality itself you have to make a `local.settings.json` file in the `CIPP-API` folder. This file isn't detected by git (because of the `.gitignore` file) so it's not pushed with any changes/contributions you make. This file stores the Secure Application Model tokens, and a Azure Storage connection string for the durable function queues.

The contents of your `local.settings.json` file differs depending on whether you are using the Azurite storage emulator or Azure Storage itself.

```JSON
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "powershell",
    "FUNCTIONS_WORKER_RUNTIME_VERSION": "7.2",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "ApplicationId": "<APPLICATION ID>",
    "ApplicationSecret": "<APPLICATION SECRET>",
    "RefreshToken": "<REFRESH TOKEN>",
    "tenantid":"<TENANT ID>",
    "DEV_SKIP_BPA_TIMER": true,
    "DEV_SKIP_DOMAIN_TIMER": true,
    "SetFromProfile": true,
    "FUNCTIONS_EXTENSION_VERSION": "4",
    "AzureWebJobs.BestPracticeAnalyser_OrchestrationStarterTimer.Disabled": true,
    "AzureWebJobs.Domain_OrchestrationStarterTimer.Disabled": true
  }
}
```

```JSON
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "powershell",
    "FUNCTIONS_WORKER_RUNTIME_VERSION": "7.2",
    "AzureWebJobsStorage": "DefaultEndpointsProtocol=<AZURESTORAGECONNECTIONSTRING>",
    "ApplicationId": "<APPLICATION ID>",
    "ApplicationSecret": "<APPLICATION SECRET>",
    "RefreshToken": "<REFRESH TOKEN>",
    "tenantid":"<TENANT ID>",
    "DEV_SKIP_BPA_TIMER": true,
    "DEV_SKIP_DOMAIN_TIMER": true,
    "SetFromProfile": true,
    "FUNCTIONS_EXTENSION_VERSION": "4",
    "AzureWebJobs.BestPracticeAnalyser_OrchestrationStarterTimer.Disabled": true,
    "AzureWebJobs.Domain_OrchestrationStarterTimer.Disabled": true
  }
}
```

{% hint style="info" %}
If you open the CIPP project in [Visual Studio Code](https://code.visualstudio.com/) there is a `launch.json` file that you can use to start the API, frontend, Azurite and, the SWA emulator.

You can consult the documentation on [Debugging in Visual Studio Code](https://code.visualstudio.com/docs/editor/debugging) for more information.

The launch task you're looking for is `Launch it all 🚀`. Which launches everything required to run CIPP locally. Once started you can navigate to CIPP by visiting [localhost:4280](https://localhost:4280/).
{% endhint %}
