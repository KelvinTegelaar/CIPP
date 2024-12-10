---
description: Apply pre-defined standards to your Microsoft 365 CSP tenants.
---

# Edit Standards

## Video Walkthrough of Standards Setup

This guide walks you through the process of setting up and running standards in CIPP. From accessing the standards editing feature to initiating standards runs, you'll learned how to ensure compliance and maintain security in your organization.

{% embed url="https://app.guidde.com/share/playbooks/evB2vKUYjj1CAPCm6dQQAY" %}

{% hint style="info" %}
**Note that by default, Standards aren't applied to any tenants upon setup of CIPP.** Applying any standard should only be undertaken with full understanding of the effects of the standard, detailed in the video and walkthrough on this page, and with the following details in mind:

* Template standards work by reapplying the template from your database every 3 hours.&#x20;
* Each standard has three options. **`Report`, `Alert`, and `Remediate`.**&#x20;
* A standard with Remediate applies actual configuration to the selected tenant.
* Disabling the Remediate option does not undo a standard if it has already applied. Only prevents it from applying again.&#x20;
{% endhint %}

## Walkthrough Steps  of Standards Setup

1. To get started with Standards in CIPP, first navigate to `Tenant Administration` -> `Standards`, and then `Edit Standards`. In our example, we'll add a standard for `All Tenants` which will apply to every tenant in our CIPP environment.

![Click 'Edit Standards'](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2F9PtA6nkRnRJKCAyvwoUvwq_doc.png?alt=media\&token=ce2be33a-dfe8-4208-b3ca-d55cbb5cb66a)

2.  Each standard has three options. `Report`, `Alert`, and `Remediate`.&#x20;

    1. **Report** stores the current value of the standard in a Best Practices Report.&#x20;
    2. **Alert** generates a ticket, email, or webhook depending on your notification configuration.&#x20;
    3. **Remediate** applies the fix for the specific standard and makes the necessary change on your clients tenant.

    _Disabling the remediate option does not undo a standard if it has already applied. Only prevents it from applying again._&#x20;

![Reporting](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2Fro5DLkaAP3uvXCiV9VqS6w_doc.png?alt=media\&token=01535725-2019-4e77-8707-83f6c4844715)

3. Each standard has a description explaining what the setting does, and a label on how much end-user impact the standard will have.

![Standards impact](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2FumFDArrjyZLHEdfwTPyWgN_doc.png?alt=media\&token=9485eb28-0148-4d40-94bf-84951dcdba38)

4. Some of the standards have settings, such as input fields to enter custom text, or selections

![Standards input](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2F4sfQ1tpUosgrhMZ8fLXeQx_doc.png?alt=media\&token=918741b5-07b6-4677-9060-c52afe137791)

5. Standards can be found for each aspect of M365. Inside of CIPP we've made sure to split these out by category so you can easily find the standard you need. There are over 100 standards which each release adding new ones.

![Catagories](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2Fp8vzXiAHDU9mroKFtMhJPr_doc.png?alt=media\&token=39f2ccea-d611-43d4-9e23-59ac7821273c)

6. Lets check out the Templates Standard Deployment section next, which allows us to deploy our own custom templates to Intune, Exchange, Conditional Access and more.

![Templates Standard Deployment](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2Fwp8XgyP3RwzKJXEym97Tb9_doc.png?alt=media\&token=25aaa44a-cb51-42a3-b6dd-c71d739a611f)

7. Template standards work by reapplying the template from your database every 3 hours. That means when we deploy an Intune Template it'll always be exactly in the state we need it to be. If an admin changes a setting it will revert to our template. That also makes it easy to deploy updates to templates, as you only have a single location to change the template before it's applied to all clients.

![Deployment of a Template Standard](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2Fd2vyBpSr5h75z5E4k4NikT_doc.png?alt=media\&token=033b29e7-9bb3-4b41-a30e-bd5d5facb7e0)

8. At the top of the page you'll find the option to run the standards immediately. You can do this for a single tenant, or all tenants in one go.

![Run now](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2FeMGbXx2ph7iQ3U25hyfv2y_doc.png?alt=media\&token=f547ab85-d62f-46ac-9de3-d55e94358d26)

9. Click "Enabling this feature excludes this tenant from any top-level "All Tenants" standard. This means that only the standards you explicitly set for this tenant will be applied. Standards previously..."

![Click 'Enabling this feature excludes this tenant from any top-level 'All Tenants' standard. This means that only the standards you explicitly set for this tenant will be applied. Standards previously...'](https://static.guidde.com/v0/qg%2FIEPB08VSavefFaCa9OSp3Y87aGu1%2FevB2vKUYjj1CAPCm6dQQAY%2FpQex4jGu9BfWANuECiTbjW_doc.png?alt=media\&token=d5fd4762-604a-420f-ae9b-3a08eeffd48c)

When selecting a specific tenant you can choose to exclude this tenant from "All Tenant" standards. This means that none of the standards applied to All Tenants will apply to this tenant, allowing you to create a completely custom standard for this client.
