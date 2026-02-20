# Setup Wizard

The setup wizard is the keys to the engine that allows CIPP to manage your client tenants. The Setup Wizard has five options for what you can do:

## First Setup

If this is your first time setting up CIPP, please see [executing-the-setup-wizard.md](../../setup/installation/executing-the-setup-wizard.md "mention").

## Add a Tenant

See [gdap-invite-wizard.md](../../setup/installation/gdap-invite-wizard.md "mention") for more information on how to add a GDAP or direct tenant.

## Create a new application registration for me and connect to my tenants

Select this option when you need to replace the app registration CIPP is using or would like to use your own custom app registration.

## Refresh tokens for existing app registration

This option is used to re-authenticate your existing CIPP-SAM application. This can be necessary if there was some kind of authentication issue that prevented CIPP from managing its own token refresh or if someone accidentally used their personal account instead of the CIPP service account to authenticate CIPP.

## Manually enter credentials

Use this option to manually enter or update credentials for an existing application. This is especially useful if you have had to migrate CIPP to a new Azure Resource Group and would like to carry over your existing setup.

***

{% include "../../.gitbook/includes/feature-request.md" %}
