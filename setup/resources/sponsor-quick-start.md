---
description: Welcome to your hosted instance of CIPP!
---

# Sponsor Quick Start

{% hint style="success" %}
If you need assistance with or aren't comfortable navigating these requirements alone, take a look at our [Professional Onboarding Services](professional-onboarding-services.md) page, which offers a paid option for those who need a bit more hands on guidance with GDAP & CIPP deployment.
{% endhint %}

If you've started the sponsorship process and are ready to enhance your management of Microsoft 365 tenants with efficiency, this guide is designed to get you started.

## **Initial Sponsorship Actions**

1. **Subscription Activation**: Start by signing up for the $99 subscription using your GitHub account on the [GitHub Sponsorship](https://github.com/sponsors/KelvinTegelaar/sponsorships?tier_id=101398) page.
2. **Welcome Email**: Upon subscription, you will receive an email with detailed instructions to kickstart your deployment. This email will guide you to the [CIPP management portal ](https://management.cipp.app)for deployment steps.

## Deployment & Service Account Creation

3. **Configure CIPP Deployment:** Login to your [management portal](https://management.cipp.app) using the GitHub credentials you used to initiate the sponsorship. This is where you can kickoff your deployment, add custom domain names, and begin inviting users into CIPP.
4. **Service Account Creation**: Follow the instructions carefully on the [Creating the CIPP Service Account ](../gdap/creating-the-cipp-service-account-gdap-ready.md)page to ensure there are no permission issues when connecting your tenants within CIPP in the subsequent steps.

## Accessing CIPP & Executing SAM Wizard

5. **Add Yourself to CIPP:** On the [User Management](https://management.cipp.app/invite-users) page in your management portal, ensure you've invited your work account as an `admin` into your newly deployed instance to avoid `403 Forbidden` errors during login. Further guidance, can be found on the [Adding Users to CIPP](../installation/addingusers.md#hosted-clients) page.
6. **Execute SAM Wizard:** Follow the instructions on the [Executing the SAM Setup Wizard](../installation/executing-the-sam-setup-wizard.md) page once logged into your CIPP instance using your newly invited account, **NOT** the service account. The service account is only used during specific configuration steps within the SAM Setup Wizard.

## **Managing Client Relationships**

7. **Onboard Existing Relationships:** If your GDAP relationships with clients are already configured and you do not need to create new invites, proceed to [Adding Tenants & **Consenting in the CIPP-SAM Application**](../installation/adding-tenants-and-consenting-the-cipp-sam-application.md) to start managing your clients immediately.
8. **Establish New Relationships:** If you need to establish new GDAP relationships for new clients, use the [GDAP Invite Wizard](../gdap/gdap-invite-wizard.md) to generate invites. Once you have completed the invite process, continue the onboarding process and follow up by [consenting within the CIPP app.](../installation/adding-tenants-and-consenting-the-cipp-sam-application.md#manual-steps)

{% hint style="info" %}
If you are unsure about whether your clients environments are GDAP ready, or need more information about the process, continue to the [Creating GDAP relationships](../gdap/creating-the-cipp-service-account-gdap-migration-required.md) page for more granular details & next steps.
{% endhint %}
