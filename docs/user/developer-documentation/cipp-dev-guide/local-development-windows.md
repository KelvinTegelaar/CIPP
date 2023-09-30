# Setting up CIPP Development for Windows

## Software

[Powershell 7.2](https://github.com/PowerShell/PowerShell/releases/download/v7.2.13/PowerShell-7.2.13-win-x64.msi) - Required latest version of Powershell supported by Azure Function Apps

[Node 18](https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi) - Required LTS version of Node

[.NET 6 Runtime](https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/runtime-6.0.20-windows-x64-installer) - Required latest version of .NET supported by Azure Function Apps

[VSCode](https://code.visualstudio.com/download) - Recommended code editor on Windows

[Git](https://git-scm.com/download/win) - Required latest version of Git
- Recommend choosing VSCode for Git's default editor.

[Chrome](https://www.google.com/chrome/) - Recommended for Frontend debugging
- This doesn't have to be your default browser. Launched from VSCode.

[Windows Terminal](https://apps.microsoft.com/store/detail/windows-terminal/9N0DX20HK701) -
Optional but better, comes with Windows 11

## Setup

### Additional Software

- Open the Windows Terminal and install the following software. Do NOT run as admin.

[Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local)
```powershell
npm i -g azure-functions-core-tools@4 --unsafe-perm true
```
[Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=npm)
```powershell
npm install -g azurite
```
[Azure Static Web App Emulator](https://learn.microsoft.com/en-us/azure/static-web-apps/local-development)
```powershell
npm install -g @azure/static-web-apps-cli
```

### Repo Configuration

- Open Windows Terminal, this will place you in your home directory.
- If it doesn't exist create a source folder in your profile. This can house any
projects you're working on.
```powershell
mkdir source && cd source
```
- Create a workspace directory for CIPP
```powershell
mkdir cipp-workspace && cd cipp-workspace
```
- You must havea github account to contribute.
- Navigate to the [CIPP Repo](https://github.com/KelvinTegelaar/CIPP) in github.
- Click the Fork button at the top of the repo.
- In your newly forked repo click the Code button and get the Clone url.
- Clone your repo inside the cipp-workspace folder.
```powershell
git clone <my-cipp-repo>
```
- Follow the same process for the [CIPP API Repo](https://github.com/KelvinTegelaar/CIPP-API).
- If you plan on contributing to the docs move CIPP to DOCS then clone the CIPP repo again.
```powershell
mv CIPP DOCS && git clone <my-cipp-repo>
```
You should now have three folders in your cipp-workspace folder.
```powershell
CIPP
CIPP-API
DOCS
```
- Add the upstream repo to CIPP
```powershell
cd CIPP && git remote add upstream https://github.com/KelvinTegelaar/CIPP.git
```
- Repeat for the DOCS repo.
- Repeat for the CIPP-API repo except make sure to use the API url for upstream.

### Project Setup
- Navigate to cipp-workspace/CIPP-API via Windows Terminal.
- In the root CIPP-API folder create a local.settings.json file.
- Add the following content to the file.
```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "powershell",
    "FUNCTIONS_WORKER_RUNTIME_VERSION": "7.2",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "ApplicationId": "",
    "ApplicationSecret": "",
    "RefreshToken": "",
    "tenantid":"",
    "FUNCTIONS_EXTENSION_VERSION": "4",
    "DebugMode": true,
    "AzureWebJobs.BestPracticeAnalyser_OrchestrationStarterTimer.Disabled": true,
    "AzureWebJobs.Domain_OrchestrationStarterTimer.Disabled": true
  }
}
```
- If you are contributing to the best practice analyser or domain remove the two
bottom lines to enable them to run. Otherwise leave those disabled for performance.
- Fill out the ApplicationId, ApplicationSecret, RefreshToken, and tenantid with
your information created when you setup CIPP.
- Test functionality - Go to Terminal > New Terminal in VSCode.
```powershell
azurite --location ../
```
- Open another terminal in VSCode.
```powershell
func start --verbose
```
The function app should be up and running. Use Ctrl-C to stop the function app
and azurite.

- Close VSCode.

- Navigate to cipp-workspace/CIPP via Windows Terminal.
Start vscode in the current directory.
```powershell
code .
```
- Trust the authors of all files in the parent folder.

- Extensions will be recommended in vscode. Install them.

- Using Windows Terminal navigate to the CIPP directory.

- Install the dependencies.
```powershell
npm install
```

- Click the Run & Debug button in vscode > Select Launch it all from the dropdown.

- Click the Play button next to the dropdown.

- Navigate to http://localhost:4280 in your browser.

- Choose a username and add the admin user's role on the emulator login page.

## Contributing

- Follow the [Git Guide](https://git-scm.com/book/en/v2/GitHub-Contributing-to-a-Project)
for contributing to a project.