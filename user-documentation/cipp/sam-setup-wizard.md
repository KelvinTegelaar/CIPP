# Setup Wizard

The Setup Wizard is the keys to the engine that allows CIPP to manage your client tenants. It handles creating and managing the **Secure Application Model (SAM)** app registration that CIPP uses to authenticate to your tenants via Microsoft Graph, Exchange Online, and Partner Center APIs.

You can access it from the sidebar under **CIPP > Setup Wizard**, or via the "Start Wizard" banner that appears when setup has not been completed.

The Setup Wizard has five options:

---

## First Setup

Choose this option if this is your first time setting up CIPP, or if you'd like to redo the previous setup. This walks you through the entire initial configuration in one flow.

For a complete step-by-step walkthrough, see [Executing the Setup Wizard](https://docs.cipp.app/setup/installation/executing-the-setup-wizard).

---

## Add a Tenant

Choose this option to add a new tenant to your existing CIPP deployment. You will be asked to select a tenant type:

- **GDAP Tenant** — For Microsoft CSP partners. Walks you through creating a GDAP relationship, selecting admin roles, generating the invite link, and completing onboarding once the customer accepts.
- **Direct Tenant** — For non-partner scenarios, or tenants outside the scope of your Partner Center. You authenticate directly to the target tenant to grant CIPP access.
- **Indirect Reseller Link** — Generates a reseller relationship invite link to send to a customer. If your service account is an indirect reseller, you can optionally include your indirect provider in the link. This does **not** add the tenant to CIPP — it only provides the Microsoft Admin Portal invitation link.

For detailed steps, see [Tenant Onboarding](https://docs.cipp.app/setup/installation/gdap-invite-wizard).

---

## Create a New Application Registration

Select this option when you need to replace the app registration CIPP is using or would like to use your own custom app registration. This runs the Application and Tenants steps from the First Setup flow without the baselines, notifications, or next-steps screens.

---

## Refresh Tokens for Existing Application

This option is used to re-authenticate your existing CIPP-SAM application. It refreshes the Graph API token and updates the stored refresh token without changing the app registration itself.

This can be necessary if there was an authentication issue that prevented CIPP from managing its own token refresh, or if someone accidentally used their personal account instead of the CIPP service account to authenticate CIPP.

---

## Manually Enter Credentials

Use this option to manually enter or update credentials for an existing application. You can provide values for:

- **Tenant ID** — Your partner/primary tenant GUID
- **Application ID** — The app registration's client ID
- **Application Secret** — The client secret value (not the secret ID)
- **Refresh Token** — A valid refresh token for the service account

Leave any field blank to retain its current stored value.

This is especially useful if you have migrated CIPP to a new Azure Resource Group and would like to carry over your existing setup. This option is recommended for advanced users only.

---

## Related Documentation

- [Creating the CIPP Service Account](https://docs.cipp.app/setup/installation/creating-the-cipp-service-account-gdap-ready)
- [Executing the Setup Wizard (First-Time Setup)](https://docs.cipp.app/setup/installation/executing-the-setup-wizard)
- [Tenant Onboarding (GDAP & Direct)](https://docs.cipp.app/setup/installation/gdap-invite-wizard)

---

## Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?template=feature.yml) on GitHub.
