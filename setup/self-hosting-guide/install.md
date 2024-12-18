---
description: How to install CIPP
---

# Installation

{% hint style="info" %}
If you choose to sponsor and use the CyberDrain hosted version, you can skip over these steps, and jump over to our [Sponsor Quick Start](../installation/broken-reference/) guide for further direction.
{% endhint %}

After you have completed the prerequisites in the [Prerequisites](https://docs.cipp.app/setup/installation/index) section, select the button below to run the automated setup.

{% hint style="warning" %}
You **must replace** the preset "Github Repository" and "Github API Repository" fields with the URL's of **your own Github forks** of the CIPP and CIPP-API repositories.

If your installation fails, you must delete the resource group and try again.
{% endhint %}

[![](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fdev%2Fdeployment%2FAzureDeploymentTemplate.json)

### Deploy to an another region

Azure Static Web Apps (SWA) is global by default (it picks the data center closest to you) however some regions don't support deployment. Regions that support SWA deployment at the moment are:

* Central US
* East US 2
* East Asia
* West Europe
* West US 2

To work around this use the alternative installation button below. This deploys the Static Web App in the _Central US_ region however the SWA gets served from your nearest data center anyway. The other parts of CIPP get installed in the region you choose so you shouldn't experience any latency.

[![](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FKelvinTegelaar%2FCIPP%2Fdev%2Fdeployment%2FAzureDeploymentTemplate_regionoptions.json)
