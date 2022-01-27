# Developing CIPP locally

So you want to jump in on helping us make this awesome? You'll need a local development environment. I'm assuming you have _some_ programming experience. You'll need a couple of tools to get started

* Install [node.js](https://nodejs.org/en/)
* Install [.NET Core 2 SDK](https://dotnet.microsoft.com/download/dotnet/2.2) and [.NET Core 5 SDK](https://dotnet.microsoft.com/download/dotnet/5.0)
* After installation execute the following commands:

```sh
npm install -g @azure/static-web-apps-cli
npm install -g azure-functions-core-tools@3
```

* After these are installed, you can start a local development instance of the Azure Functions(APIs) the Static web app(Frontend) or both

Starting only the frontend:

```sh
swa start "C:\PathToYourLocallyDownloadedFrontEn" --swa-config-location "C:\AnyInvalidPath"
```

We use an invalid path on purpose, because our config in the CIPP folder only works for cloud engines and not the local emulator.

Starting only the APIs:

```sh
func start --script-root "C:\FolderTo\CIPP-API"
```

For starting both, we recommend two separate instances. You can also have the SWA utility start the API but this brings in some added difficulties because you can't see the API logs directly in the console.

```sh
func start --script-root "C:\FolderTo\CIPP-API"
swa start "C:\PathToYourLocallyDownloadedFrontEn" --swa-config-location "C:\AnyInvalidPath" --api-location http://localhost:7071/
```

If you need the APIs to connect to M365 and use the secure application model you'll also need to make a local.settings.json file inside of the CIPP-API folder. This file is added to .gitignore so it will not be pushed. This file contains the secure application model keys, and a Azure Storage connection string for the durable function queues.

Local.settings.json example:

```JSON
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "powershell",
    "FUNCTIONS_WORKER_RUNTIME_VERSION": "~7",
    "AzureWebJobsStorage": "DefaultEndpointsProtocol=AzureStorageConnectionStringhere",
    "applicationid": "appid",
    "applicationsecret": "applicationsecret",
    "refreshtoken": "refreshtoken",
    "exchangerefreshtoken": "exchangerefresh",
    "tenantid":"tenantid"
  }
}
```
