---
description: Installing Your Self-Hosted CIPP
---

# Installation

{% hint style="info" %}
If you choose to sponsor and use the CyberDrain hosted version, you can skip over these steps, and jump over to our [Sponsor Quick Start](https://docs.cipp.app/setup/resources/sponsor-quick-start) guide for further direction.
{% endhint %}

## Before You Begin

1. **Complete the Prerequisites**\
   Make sure you’ve followed all items in  the [Prerequisites](https://docs.cipp.app/setup/installation/index) section, including setting up your Azure resources and forking the CIPP and CIPP-API repositories.
2. **Prep Your GitHub Token**\
   You can find instructions on what you need and the minimum permissions to do this [in Microsoft's Azure Static Web Apps documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/publish-azure-resource-manager?tabs=azure-cli#create-a-github-personal-access-token). You only need the "Create a GitHub Personal Access Token" section.

After you have completed the prerequisites in, select the button below to run the automated setup.

{% hint style="warning" %}
You **must replace** the preset "Github Repository" and "Github API Repository" fields with the URL's of **your own Github forks** of the CIPP and CIPP-API repositories.

If your installation fails, you must delete the resource group and try again.
{% endhint %}

[![](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fdev%2Fdeployment%2FAzureDeploymentTemplate.json)

### Deploy to another region

Azure Static Web Apps (SWA) is global by default (it picks the data center closest to you) however some regions don't support deployment. Regions that support SWA deployment at the moment are:

* Central US
* East US 2
* East Asia
* West Europe
* West US 2

To work around this use the alternative installation button below. This deploys the Static Web App in the _Central US_ region however the SWA gets served from your nearest data center anyway. The other parts of CIPP get installed in the region you choose so you shouldn't experience any latency.

[![](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fdev%2Fdeployment%2FAzureDeploymentTemplate_regionoptions.json)



#### 1. Deploy with Automated Setup

Click the **Deploy** button (provided below in your actual docs) to spin up all required Azure resources, including:

* Azure Functions (for the API)
* Azure Storage Account
* Key Vault (for secure secrets)
* Azure Static Web App (for the front end)

In the **Custom Deployment** form:

* **Replace** the default _“Github Repository”_ (and if asked, _“Github API Repository”_) with **your own** CIPP forks.
* **Paste** your GitHub PAT in the _“GithubToken”_ field when prompted.

> **What if the deployment fails?**\
> It’s simplest to **delete the resource group** in the Azure portal and try again. This ensures a clean slate.

#### 2. Deploying to Another Region

By default, **Azure Static Web Apps** chooses the nearest supported region automatically. At the moment, SWA supports:

* Central US
* East US 2
* East Asia
* West Europe
* West US 2

If your preferred region isn’t on that list, or if you encounter deployment issues, use the **Alternative Deploy** button. This fallback sets the Static Web App to deploy in **Central US**, but it’ll still serve content from the data center closest to your users.

> **Latency Concerns?**\
> Don’t worry—only the Static Web App is pinned to Central US in the second template. The rest of CIPP’s resources (Function App, Storage, Key Vault) deploy in the region you select, so performance remains snappy.

***

#### Next Steps

After deployment succeeds, you can:

* **Confirm** your resources in the Azure Portal (Key Vault, Function App, SWA, Storage Account).
* **Navigate** to your new Static Web App URL and log in with your Microsoft 365 credentials.
* **Configure** any additional environment variables or secrets if needed.

**That’s it!** You’re now ready to test-drive your self-hosted instance. For deeper dives into troubleshooting or advanced configurations, check out the [Microsoft Learn docs on Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/) and [Azure Functions](https://learn.microsoft.com/azure/azure-functions/).

Happy deploying!
