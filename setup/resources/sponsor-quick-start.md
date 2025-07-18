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

3. **Configure CIPP Deployment:** Login to your [management portal](https://management.cipp.app) using the GitHub credentials you used to initiate the sponsorship. This is where you can kick off your deployment, add custom domain names, and begin inviting users into CIPP. <mark style="color:yellow;">NOTE: If you sponsor with an organization GitHub account, please send in a message to helpdesk@cyberdrain.com with your personal GitHub username so that we can manually add that user to the portal. You cannot log in to the management portal with organization accounts.</mark>
4. **Service Account Creation**: Follow the instructions carefully on the [creating-the-cipp-service-account-gdap-ready.md](../installation/creating-the-cipp-service-account-gdap-ready.md "mention")page to ensure there are no permission issues when connecting your tenants within CIPP in the subsequent steps.

## Accessing CIPP & Executing SAM Wizard

5. **Add Yourself to CIPP:** On the [User Management](https://management.cipp.app/invite-users) page in your management portal, ensure you've invited your work account as an `admin` into your newly deployed instance to avoid `403 Forbidden` errors during login. Further guidance can be found on the [roles.md](../installation/roles.md "mention") page.
6. **Execute Setup Wizard:** Follow the instructions on the [Executing the Setup Wizard](../installation/executing-the-setup-wizard.md) page once logged into your CIPP instance using your newly invited account, **NOT** the service account. The service account is only used during specific configuration steps within the Setup Wizard.

## **Managing Client Relationships**

7. **Onboard Existing Relationships:** If your GDAP relationships with clients are already configured and you do not need to create new invites, proceed to [adding-tenants-and-consenting-the-cipp-sam-application.md](../installation/adding-tenants-and-consenting-the-cipp-sam-application.md "mention") to start managing your clients immediately.
8. **Establish New Relationships:** If you need to establish new GDAP relationships for new clients, use the [gdap-invite-wizard.md](../installation/gdap-invite-wizard.md "mention") wizard to generate invites and complete the necessary actions to onboard the client to CIPP.

{% hint style="info" %}
If you are unsure about whether your clients' environments are GDAP ready, or need more information about the process, continue to the [gdap-invite-wizard.md](../installation/gdap-invite-wizard.md "mention") page for more granular details & next steps.
{% endhint %}
