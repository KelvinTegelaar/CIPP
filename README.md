# CIPP-ADMIN
A React frontend to the CIPP-API

# Developer Setup
Requirements:
- VSCode
    - Azure Functions Extension
- Git
- Node.js LTS
- MSSQL Express
- .Net Core 2.1 SDK
- .Net Core 3.1 SDK
- .Net 5 SDK
- Azure Storage Emulator

Install Azure Static Web Apps CLI

```
npm install -g @azure/static-web-apps-cli
```

Install Azure Functions Core Tools

```
npm install -g azure-functions-core-tools@3 --unsafe-perm true
```

Start the Azure Storage Emulator

```
git clone https://github.com/redanthrax/CIPP-API.git
```

The cipp-admin repo and the CIPP-API repo are expected to be next to eachother.

- source_dir
    - CIPP-API
    - cipp-admin

```
git clone https://github.com/redanthrax/cipp-admin.git
```
cd into the cipp-admin directory

```
npm install --legacy-peer-deps
```

# Setup variables for the API to connect to Azure
Open the CIPP-API directory with VSCode

Create a file in the root directory with the name local.settings.json. See the Secure App for values.

```
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "powershell",
    "Tenantid": "TENANT.onmicrosoft.com",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "ApplicationId": "APPLICATIONID",
    "ApplicationSecret": "APPLICATION SECRET",
    "RefreshToken": "REFRESH TOKEN",
    "ExchangeRefreshToken": "EXCHANGE REFRESH TOKEN"
  }
}
```

# Run the debug environment
Open the cipp-admin directory with VSCode

Select Debug from the Menu

In the debug dropdown select Launch it all.

Click the play button to start debugging.

Edge will launch and say it can't connect. The frontend is still getting up and running.

To access the frontend with another browser navigate to https://localhost:4280/

After waiting a while refresh and accept the invalid cert.

On the Auth page fill out your Azure username and add 'admin' to the bottom.

First navigation will be slow as the Tenant list is built.