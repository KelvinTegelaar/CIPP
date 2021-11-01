<p align="center"><a href="https://cyberdrain.com" target="_blank" rel="noopener noreferrer"><img src="../assets/img/CyberDrain.png" alt="CyberDrain Logo"></a></p>

# Contributing

Contributions to CIPP are welcome by everyone. There's a couple of things to keep in mind;

- These repositories are going through rapid changes. Every pull request should update version_latest.txt with versioning that follows https://semver.org
- Speed and Security are two of our pillars, if it isn't fast, it isn't good, and if it isn't secure, it can't be accepted :) 
- We try to use native APIs over Powershell Modules. Powershell modules tend to slow the entire processing. We currently only have Az.Keyvault and Az.Accounts loaded and prefer to keep it that way.
- The interface is made entirely in Bootstrap and Jquery. For Datatables we use the JQuery Datatables plugin.
- Avoid adding a deploy YML to your development repo. We'll remove those, but it's just an annoyance. If you want to both deploy and develop it's better to create two instances of the repo. 

When contributing, or planning to contribute, please create an issue in the tracker [here](issues). If you are fixing a bug, file a complete bug report and assign it to yourself, if you are adding a feature, please add "Feature Request" to the title and assign it to yourself.

# Feature requests

Feature requests that request integration with anything but M365 will be closed. We're not integrating directly with third party products until version 2.0. Pull requests that have integration components will be discussed and evaluated on a case-by-case basis.
# Pull Requests

We do not accept PRs or commits against Master. Master is always the final version. For both CIPP and CIPP-API we have two branches. Dev and Master. Please make any PR against Dev, when Dev is promoted to final we'll PR that against master.
## Creating two instances

- Make a clone of your forked repo
- Optional: mark this repo as private
- Add the following github action, this will sync the repos every hour:

```YML
# This is a basic workflow that is manually triggered

name: Pull from master schedule

# Controls when the action will run. Workflow runs when manually triggered using the UI
# or API.
on:
  schedule:
    # * is a special character in YAML so you have to quote this string
    - cron:  '0 * * * *'
    # Inputs the workflow accepts.
# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  repo-sync:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      with:
        persist-credentials: false
    - name: repo-sync
      uses: repo-sync/github-sync@v2
      with:
        source_repo: "KelvinTegelaar/CIPP"
        source_branch: "master"
        destination_branch: "master"
        github_token: ${{ secrets.PAT }}
```

- Go to settings of the repo
- click on add secret
- secret name "PAT"
- Secret value: a self created personal access token(https://github.com/settings/tokens)


# Local development guide

So you want to jump in on helping us make this awesome? You'll need a local development environment. I'm assuming you have *some* programming experience. You'll need a couple of tools to get started

- Install [node.js](https://nodejs.org/en/)
- Install .NET Core 2 and .NET Core 5
- After installation execute the following commands:
```
npm install -g @azure/static-web-apps-cli
npm install -g azure-functions-core-tools@3
```
- After these are installed, you can start a local development instance of the Azure Functions(APIs) the Static web app(Frontend) or both

Starting only the frontend:
```
swa start "C:\PathToYourLocallyDownloadedFrontEn" --swa-config-location "C:\AnyInvalidPath"
```
We use an invalid path on purpose, because our config in the CIPP folder only works for cloud engines and not the local emulator.

Starting only the APIs:
```
func start --script-root "C:\FolderTo\CIPP-API"
 ```

 For starting both, we recommend two separate instances. You can also have the SWA utility start the API but this brings in some added difficulties because you can't see the API logs directly in the console.
```
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
    "AzureWebJobsStorage": "DefaultEndpointsProtocol=AzureStorageConnectionStringhere",
    "applicationid": "appid",
    "applicationsecret": "applicationsecret",
    "refreshtoken": "refreshtoken",
    "exchangerefreshtoken": "exchangerefresh",
    "tenantid":"tenantid"
  }
}
```
