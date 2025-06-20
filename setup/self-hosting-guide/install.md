---
description: Installing Your Self-Hosted CIPP
---

# Installation

{% hint style="info" %}
If you choose to sponsor and use the CyberDrain hosted version, you can skip over these steps and jump over to our [sponsor-quick-start.md](../resources/sponsor-quick-start.md "mention") guide for further direction.
{% endhint %}

This guide walks you through deploying your **self-hosted** instance of CIPP using our Azure Resource Manager (ARM) templates. Once completed, you’ll have a fully functioning CIPP installation, ready to configure.

## Confirm You’ve Met All Prerequisites

Before deploying, ensure you’ve completed everything in the [index.md](index.md "mention") section (forks, Azure subscription, GitHub PAT, etc.).

***

## Choose Your Deployment Template

{% stepper %}
{% step %}
#### Default (Regional) Deployment

**When to use**:

* Your Azure region supports [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/) (SWA).
* You want SWA to deploy automatically to the closest supported data center.

This template creates all necessary resources in your local region, including:

* **Azure Function App** (API) with a **Storage Account**
* **Azure Key Vault** for CIPP secrets
* **Azure Static Web App** (SWA) that auto-selects a supported region near you

After you have completed the prerequisites in, select the button below to run the automated setup.

[![](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fdev%2Fdeployment%2FAzureDeploymentTemplate.json)

{% hint style="warning" %}
You **must replace** the preset "Github Repository" and "Github API Repository" fields with the URL's of **your own Github fork** of the CIPP repository.
{% endhint %}

{% hint style="danger" %}
**What if the deployment fails?** It’s simplest to **delete the resource group** in the Azure portal and try again. This ensures a clean slate.
{% endhint %}
{% endstep %}

{% step %}
#### Alternative (Central US) Deployment

Azure Static Web Apps (SWA) is global by default (it picks the data center closest to you) however some regions don't support deployment. To work around this, use the alternative installation button below.

**When to use**:

* You need to enforce the SWA resource to deploy in Central US due to deployment issues
* Your region **doesn’t** support SWA. Regions that support SWA deployment at the moment are:
  * Central US
  * East US 2
  * East Asia
  * West Europe
  * West US 2

[![](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fdev%2Fdeployment%2FAzureDeploymentTemplate_regionoptions.json)

{% hint style="info" %}
The key difference:

* **SWA is pinned to** `centralus` in the ARM template.
* The other resources (Key Vault, Function App, Storage) still deploy to **the region you choose** in the Azure Portal.
* The SWA remains globally served, so end-user latency is typically minimal.
{% endhint %}
{% endstep %}
{% endstepper %}

<details>

<summary>Steps for deploying via the Azure Portal</summary>

1. **Open the Template**
   * Click the **Deploy to Azure** button above based on your deployment needs.
   * The Azure Portal will load a “Custom deployment” form.
2. **Fill in Deployment Parameters**
   * **GitHub Repository**: Replace the default with **your fork** of the CIPP frontend repo.
   * **GitHub Token**: Paste your **Personal Access Token**. (Make sure it has permissions to access and deploy from your forked repo.)
3. **Select a Region**
   * Choose the region for your Key Vault, Function App, and Storage.
   * **Note**: If you’re using the Alternative (Central US) template, SWA will still deploy in `centralus` automatically, but the rest of your resources honor this selected region.
4. **Review + Create**
   * Check your settings, especially the repository URLs.
   * Click **Review + create**, wait for validation, then **Create**.
5. **Wait for Completion**
   * You can monitor progress in the Azure Portal’s **Notifications**.
   * If it fails, **delete the resource group** and try again for a clean slate.
6. **Verify Your Deployment**
   * **Navigate to the Resource Group** to check that the resources (Key Vault, Function App, Storage, SWA) exist.
   * **Open the Static Web App** and locate the “Primary endpoint” or “URL” field in the SWA resource. Browse to it. If everything’s working, you’ll see the CIPP login screen

</details>

<details>

<summary>What the ARM Template Deploys</summary>

Both templates create these resources (unless otherwise noted):

* **Key Vault**
  * Stores sensitive data like `applicationid`, `applicationsecret`, `refreshtoken`, and `tenantid`.
* **Azure Function App**
  * Hosts the CIPP-API, deployed via a zip package in Azure Storage (`latest.zip` from cipp-api releases).
  * Uses a System-Assigned Managed Identity for secure operations.
* **Storage Account**
  * Required for the Function App’s logs and file storage.
* **App Service Plan**
  * A **Y1 (Consumption)** plan to keep Function App costs low.
* **Static Web App (SWA)**
  * Hosts the frontend (CIPP React app).
  * Defaults to a global distribution, unless you use the Alternative template pinned to `centralus`.

</details>
