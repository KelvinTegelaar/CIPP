<p align="center"><a href="https://cyberdrain.com" target="_blank" rel="noopener noreferrer"><img src="../assets/img/CyberDrain.png" alt="CyberDrain Logo"></a></p>

# Prerequisites

For the installation and maintenance, we assume you have some knowledge of Github, and have setup the Secure Application Model prior to install. Haven't setup the Secure Application model yet? Check out [this](https://www.cyberdrain.com/connect-to-exchange-online-automated-when-mfa-is-enabled-using-the-secureapp-model/) script.

You'll also need the following permissions for your secure application model, to add permissions follow these instructions:

- Go to the Azure Portal.
- Click on Azure Active Directory, now click on “App Registrations”.
- Find your Secure App Model application. You can search based on the ApplicationID.
- Go to “API Permissions” and click Add a permission.
- Choose “Microsoft Graph” and “Delegated permission”.
- Add the permission you need.
- Finally, click on “Grant Admin Consent for Company Name.

## Permissions

For full functionality, you'll need the following permissions for your Secure Application Model:

- TeamMember.Read.All
- Sites.Read.All
- Directory.AccessAsUser.All
- Directory.Read.All
- User.Read
- Applications.readwrite.all
- auditlog.read.all
- Channnel.readbasic.all
- channelmember.readwrite.all
- device.readwrite.all
- DeviceManagemagementConfiguration(all)
- Mail.Send
- Mail.Send.Shared
- Policy.Readwrite.all
- Reports.read.all
- SecurityEvents.Read.all
- Teams.Read.all
- User.ReadWrite.All
- Groups.RaadWrite.All


If you don't want people to be able to write, remove the read/write permission for Read. 


## Getting started

You'll need the following to get started;

- Your Secure Application Model information
- A fork of [this](https://github.com/KelvinTegelaar/CIPP) repo
- A fork of [this](https://github.com/KelvinTegelaar/CIPP-API) repo
- An active Azure Subscription

# Automated setup

Click here to run the automated setup. This does most of the work for you. If you don't want to use the automated installer, use the instructions below, but be warned that this is really not advised, there's a lot of moving parts where one could make a mistake.

[![Deploy To Azure](https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/1-CONTRIBUTION-GUIDE/images/deploytoazure.svg?sanitize=true)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fmaster%2FDocumentation%2FAzureDeploymentTemplate.json)

The first 20 minutes the application can respond pretty slow, this is due to downloading some PowerShell modules from Microsoft. I can't make that any faster but just note before you get started. :)

# Adding a custom domain name

At the moment of deployment, the application will use a randomly generated name. To change this, go to your Resource Group in Azure, click on cipp-swa-xxxx and click on Custom Domains. You'll be able to add your own domain name here.
# Adding users to allow the usage of the CIPP

After deployment, go to your resource group in Azure and click on cipp-swa-xxxx. Click on Role Management and invite the users you want. Currently we only support the "reader" role, so make sure you enter that in the roles field.

# Manual instructions
## Create Azure Function host

Create an Azure Function and upload the data from the CIPP-API to the Azure Function, or attach it to your fork. Each time we update the central repository you must also update your fork to keep current. 

After creating the Azure function, Enable the system managed identity for the Azure Function.

Give the managed identity "Reader" access on the subscription

## Create an Azure Keyvault

Create an Azure Keyvault and give the system managed identity access to update, read, and create Secrets. This keyvault will be used to store credentials and tokens for the application.

## Create an Azure Static Web App

Create a Premium Azure Static WebApp in the Azure portal and use the CIPP Repo fork you've made as the source. Each time an update is executed you must create a pull based on the latest version to upgrade the frontend.

After creation, perform the following changes:
- Attach the Function App to the functions
- Add your own custom domain name

You should now be able to browse to the custom domain or the default domain, and use the CIPP control panel.
