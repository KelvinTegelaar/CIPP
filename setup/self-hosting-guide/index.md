---
description: >-
  This page covers everything you need before installing CIPP on your own
  infrastructure.
---

# Prerequisites

{% hint style="warning" %}
If you choose to sponsor and use the CyberDrain hosted version, you can skip over these steps, and jump over to [Broken link](broken-reference "mention") guide for further direction.
{% endhint %}

To get started you must follow or have the following ready. Click on the links for instructions on how to perform some of these tasks, or for more information on the functionality in question.

{% stepper %}
{% step %}
### Microsoft Tenant Requirements

* **Multi-Tenant Mode**: A Microsoft Partner account with your clients’ tenants added.\
  If you’re an MSP managing multiple tenants, this is essential for CIPP to function across them.
{% endstep %}

{% step %}
### GitHub Forks

Fork each repository into your own GitHub organization so you can push updates, track changes, and deploy under your namespace.

* **CIPP Frontend Fork**: [GitHub Repo](https://github.com/KelvinTegelaar/CIPP)
* **CIPP API Fork**: [GitHub Repo](https://github.com/KelvinTegelaar/CIPP-API)
{% endstep %}

{% step %}
### Azure Subscription

You’ll need an **active Azure Subscription** where your CIPP resources (Function Apps, Static Web Apps, Key Vault, etc.) will live. If you’re new to Azure, check out [Azure’s free trial](https://azure.microsoft.com/free/) or confirm your existing subscription’s permissions
{% endstep %}

{% step %}
### GitHub Personal Access Token

CIPP uses Azure Static Web Apps (SWA) to deploy from GitHub. You’ll need a **PAT** (Personal Access Token) with relevant repo permissions. For instructions, see Microsoft’s [Create a GitHub Personal Access Token](https://learn.microsoft.com/azure/static-web-apps/publish-azure-resource-manager?tabs=azure-cli#create-a-github-personal-access-token).
{% endstep %}

{% step %}
### (Optional) Microsoft 365 Lighthouse License

* **Recommended for MSP Usage**: A [Microsoft 365 Lighthouse license](https://learn.microsoft.com/en-us/microsoft-365/lighthouse/m365-lighthouse-sign-up?view=o365-worldwide#steps-to-sign-up-for-microsoft-365-lighthouse) is needed to access various API endpoints used in CIPP but CIPP will function without it.&#x20;
* If you buy a Lighthouse license purely for CIPP, **remember to accept the EULA** in the [Lighthouse portal](https://lighthouse.microsoft.com/) to activate it.
{% endstep %}

{% step %}
### Azure Expertise (Assumed)

For the installation and maintenance of CIPP, we assume you’re comfortable with:

* **Azure Functions**: [Learn more](https://learn.microsoft.com/azure/azure-functions/)
* **Azure Static Web Apps**: [Learn more](https://learn.microsoft.com/azure/static-web-apps/)
* **Azure Key Vault**: [Learn more](https://learn.microsoft.com/azure/key-vault/general/)
* **Azure Cost Management**: [Learn more](https://learn.microsoft.com/azure/cost-management-billing/)
* **Azure Storage** (Tables, Blobs, Files): [Learn more](https://learn.microsoft.com/azure/storage/)

{% hint style="warning" %}
The linked resources above will help you understand the Azure services CIPP depends on that you will be required to configure and maintain. If you’re missing any of these skills, we suggest reviewing these before proceeding. Proper knowledge ensures a smooth deployment and ongoing maintenance.
{% endhint %}
{% endstep %}
{% endstepper %}

***

**You’re Ready for Installation**\
Once you’ve checked off these prerequisites, move on to the next page to set up your self-hosted instance. Happy CIPPing!
