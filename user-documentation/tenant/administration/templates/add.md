# Add App Approval Template

This page will allow you to create an approval template for a multi-tenant application. Set the template name, application to deploy, and the permission set.

{% stepper %}
{% step %}
### Name the Template


{% endstep %}

{% step %}
### Select Application Type

You can select between "Enterprise Application", "Gallery Template", or "Application Manifest".&#x20;

* **Enterprise Application:** Deploy existing multi-tenant apps from your tenant. Requires "Multiple organizations" or "Personal Microsoft accounts" in App Registration settings.
* **Gallery Template:** Deploy pre-configured applications from Microsoft's Enterprise Application Gallery with standard permissions.
* **Application Manifest:** Deploy custom applications using JSON manifests. For security, only single-tenant apps (AzureADMyOrg) are supported.
{% endstep %}

{% step %}
### Select Options

### Enterprise Application

* Select the Enteprise Application from the dropdown

{% hint style="warning" %}
This dropdown will only display applications with a sign in audience set to multi-tenancy.
{% endhint %}

* Select the previously created permission set

{% hint style="warning" %}
As a prerequisite, you must first create a permissions template. See the documentation on [add.md](../permission-sets/add.md "mention").
{% endhint %}

### Gallery Template

* Select the Gallery Template application from the dropdown

### Application Manifest

* Paste your application manifest JSON here. Use the "[Microsoft Graph App Manifest](https://learn.microsoft.com/en-us/entra/identity-platform/reference-microsoft-graph-app-manifest)" format.

{% hint style="warning" %}
For security reasons, signInAudience must be 'AzureADMyOrg' or not specified.
{% endhint %}
{% endstep %}

{% step %}
### Click "Create Template"
{% endstep %}
{% endstepper %}

{% hint style="success" %}
You can now deploy the application with the permissions template in [standards](../../standards/ "mention") or [appapproval.md](../../../tools/tenant-tools/appapproval.md "mention").
{% endhint %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
