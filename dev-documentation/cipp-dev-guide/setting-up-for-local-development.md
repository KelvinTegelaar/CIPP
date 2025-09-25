# Setting Up for Local Development

This page provides information on various required and recommended tools, programs and resources for developing the CIPP React frontend.

## Prerequisites

### Required Software

It's recommended that you have the following installed on the computer you're using for development:

#### Core Development Tools

- **[Visual Studio Code](https://code.visualstudio.com)** (VSCode)
  ```bash
  winget install --exact vscode
  ```

- **[PowerShell 7](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell?view=powershell-7.4)**
  ```bash
  winget install --exact Microsoft.PowerShell
  ```

- **[Git](https://git-scm.com/download/win)**
  ```bash
  winget install --exact Git.Git
  ```

#### Runtime and SDKs

- **[Node.js V22.X LTS](https://nodejs.org/en/download/releases)**
  ```bash
  winget install --exact OpenJS.NodeJS.LTS --version 22.13.0
  winget pin add OpenJS.NodeJS.LTS --version 22.13.* --force
  ```

- **[.NET Core 3.1](https://dotnet.microsoft.com/en-us/download/dotnet/3.1)**
  ```bash
  winget install --exact Microsoft.DotNet.SDK.3_1
  ```

- **[.NET SDK 5](https://dotnet.microsoft.com/en-us/download/dotnet/5.0)**
  ```bash
  winget install --exact Microsoft.DotNet.SDK.5
  ```

- **[.NET SDK 6](https://dotnet.microsoft.com/en-us/download/dotnet/6.0)**
  ```bash
  winget install --exact Microsoft.DotNet.SDK.6
  ```

- **[.NET SDK 8](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)**
  ```bash
  winget install --exact Microsoft.DotNet.SDK.8
  ```

### Required VSCode Extensions

Install these extensions to enhance your development experience:

- **[Azure Functions](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)** - Azure Functions development support
- **[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)** - JavaScript/TypeScript linting
- **[npm](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script)** - npm script runner
- **[npm Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense)** - Auto-completion for npm modules
- **[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)** - Code formatting
- **[Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)** - CSS/SCSS linting

> **📝 Note:** This page guides you through getting setup to develop for CIPP using the command line to perform operations with `git` and `npm`. There are graphical user interfaces for these tools but they won't be covered in this documentation. The commands below are broadly OS agnostic.

## Global Package Installation

Using `npm` which is included with `nodejs`, you're going to install the _Azure Static Web Apps CLI_, the _Azure Functions Core Tools_ and the _Azurite_ storage emulator globally.

> **⚠️ Warning:** Depending on your system setup you may have to run the following commands as an administrator in order for npm to write the package files into its global package folder. Globally installed npm packages are available to all users.

### Install Required Global Packages

Run the following commands to install the necessary global packages:

- **[Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/)**
```bash
npm install --global @azure/static-web-apps-cli
```

- **[Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)**
```bash
npm install --global azure-functions-core-tools@4 --unsafe-perms true
```

- **[Azurite storage emulator](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite)**
```bash
npm install --global azurite
```

- **[Yarn package manager](https://yarnpkg.com/)**
```bash
npm install --global yarn
```

- **[Next.js framework](https://nextjs.org/)**
```bash
npm install --global next
```

## Repository Setup

Now we need to get the files downloaded for CIPP. In order to properly test as you develop the CIPP frontend we need a copy of your CIPP and CIPP-API repositories.

### Forking Repositories

> **💡 Info:** You're going to want to work on a [forked copy](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of the [CIPP](https://github.com/KelvinTegelaar/CIPP) and [CIPP-API](https://github.com/KelvinTegelaar/CIPP-API) repositories.
>
> For the rest of this guide we assume that your forks are at:
> - **CIPP** - `https://github.com/goodatforking/CIPP`
> - **CIPP-API** - `https://github.com/goodatforking/CIPP-API`

> **💡 What's a repository?** A Git repository is the `.git/` folder which you'll find inside many projects like CIPP. This repository tracks all changes made to files in the project, changes to these files are _committed_ to the repository (repo) which then builds up a history of the project.

### Directory Structure

The `CIPP` and `CIPP-API` repositories need to be located alongside each other (siblings) - so we're looking for a folder structure that looks like this:

```
CIPP-Project/
├── CIPP/
└── CIPP-API/
```

### Cloning the Repositories

If we assume that we want our `CIPP-Project` directory in `X:\Development`, we're going to do the following:

```bash
cd "X:\Development"
mkdir "CIPP-Project"
cd "CIPP-Project"
```
#### Clone your forked repositories
```bash
git clone https://github.com/goodatforking/CIPP --origin goodatforking
git clone https://github.com/goodatforking/CIPP-API --origin goodatforking
```

> **📝 Info:** When you clone a git repository you automatically get a _remote_ - this is a pointer (usually a URL) to a remote copy of the git repository which you can push changes to. By default your first remote is called **origin**. But that doesn't really mean much to most people. In the commands above we're using `--origin goodatforking` to tell git that we want our first remote (origin) to be called `goodatforking`.

### Adding Upstream Remote

At this point we could start working on the code - we have our pre-requisites and we have the code setup as we need it, but we're going to do one last thing to make life easier down the road.

We're going to add Kelvin's original repository as `upstream`:

#### Add upstream remote for CIPP
```bash
cd "CIPP"
git remote add upstream https://github.com/KelvinTegelaar/CIPP
cd ..
```
#### Add upstream remote for CIPP-API
```bash
cd "CIPP-API"
git remote add upstream https://github.com/KelvinTegelaar/CIPP-API
cd ..
```

## Branch Structure

When working on open source projects it's often helpful to keep your stable/tested code separate from your under-development code. We can achieve this with git by using _branches_. The CIPP project uses the following branches:

| Branch | Purpose |
|--------|---------|
| `main` | Our stable/tested code - this is where releases are created (tagged) |
| `dev` | Our development code - this is the branch where active development takes place |
| `docs` | The CIPP documentation files aka. the content of the website you are reading this from |

### Switching to Development Branch

We're going to want to work from the `dev` branch since that's where the latest development code is. Switching branches in git is achieved by doing a `checkout` on the branch:

#### Switch to dev branch in CIPP
```bash
cd "CIPP"
git checkout dev
cd ..
```
#### Switch to dev branch in CIPP-API
```bash
cd "CIPP-API"
git checkout dev
cd ..
```

## Opening the Project in VSCode

Now that we have our repositories set up, we need to open them correctly in Visual Studio Code

### Multi-Root Workspace Setup

> **⚠️ Important:** Don't open the parent `CIPP-Project` folder in VSCode. Instead, you need to add both repository folders (`CIPP` and `CIPP-API`) as separate workspace folders in the same VSCode window.

#### Method 1: Using VSCode GUI (Recommended)

1. **Open VSCode** (if not already open)

2. **Add the repositories:**
   - Go to `File` → `Open Folder`
   - Navigate to your `CIPP-Project` directory
   - Hold the Control key and select the `CIPP` and `CIPP-API` folders
   - Click "Add"

4. **Save a workspace:**
   - Go to `File` → `Save Workspace As...`
   - Save it as `CIPP-Development.code-workspace` in your `CIPP-Project` directory
   - This allows you to easily reopen both projects together in the future

#### Method 2: Using Command Line

Alternatively, you can open both folders from the command line:

```bash
cd "X:\Development\CIPP-Project"
code CIPP CIPP-API
```

### Verifying Correct Setup

Your VSCode Explorer panel should show both folders at the root level like this:

```
EXPLORER
├── CIPP
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
└── CIPP-API
    ├── Modules/
    ├── host.json
    ├── requirements.psd1
    └── ...
```

> **❌ Wrong Setup:** If you see a single `CIPP-Project` folder with `CIPP` and `CIPP-API` as subfolders, you've opened the wrong directory. Close the workspace and follow the steps above.

> **✅ Correct Setup:** You should see `CIPP` and `CIPP-API` as two separate root-level folders in the Explorer panel.

### Why This Matters

Opening both repositories as separate workspace folders ensures that:
- Git integration works correctly for both repositories
- IntelliSense and auto-completion work properly across both projects
- You can easily manage different branches in each repository independently
- Extensions can properly detect and work with both codebases
  - This is vital for the starting the project emulators using the 'Run and Debug' section of VSCode  

## Next Steps

That's it - we've got our repositories setup locally, on the dev branch, and properly opened in VSCode. Our local environment is setup and ready to develop the CIPP UI. Read on through the next section for further instructions.
