---
description: How to prepare to install an instance of CIPP for your organisation.
---

# Prerequisites

{% hint style="info" %}
If you choose to sponsor and use the CyberDrain hosted version, you can skip over these steps, and jump over to [addyourself.md](addyourself.md "mention") guide for further direction.
{% endhint %}

To get started you must follow or have the following ready. Click on the links for instructions on how to perform some of these tasks.

* **When using Multi-Tenant mode:** A Microsoft Partner account with your clients tenant added to this account.
* A [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of [the CIPP GitHub](https://github.com/KelvinTegelaar/CIPP) repository.
* A [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) of [the CIPP API GitHub](https://github.com/KelvinTegelaar/CIPP-API) repository.
* An active Azure Subscription.
* A GitHub Personal Access Token. You can find instructions on what you need and the minimum permissions to do this [in Microsoft's Azure Static Web Apps documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/publish-azure-resource-manager?tabs=azure-cli#create-a-github-personal-access-token). You only need the "Create a GitHub Personal Access Token" section.

Recommended for MSP usage: A [Microsoft 365 Lighthouse license](https://learn.microsoft.com/en-us/microsoft-365/lighthouse/m365-lighthouse-sign-up?view=o365-worldwide#steps-to-sign-up-for-microsoft-365-lighthouse). This is needed to access various API endpoints used in CIPP but CIPP will function without it. If you buy a license to Lighthouse for this purpose only, remember to also go to [Lighthouse](https://lighthouse.microsoft.com/) and accept the EULA to properly activate it before continuing.

For the installation and maintenance of CIPP it's assumed you have expertise and are confident in the following aspects:

* Creating and managing Azure Function Resources
* Creating and managing Azure Static Web Apps
* Creating and managing Azure Key Vault
* Cost Management within Azure
* Familiarity and expertise in maintaining Azure Storage Accounts using Azure Table Storage, Blob, and File storage

{% hint style="warning" %}
If you choose to sponsor and use the CyberDrain hosted version, you can skip this step.
{% endhint %}

