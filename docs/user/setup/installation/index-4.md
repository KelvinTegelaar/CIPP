---
id: permissions
title: Permissions
slug: /gettingstarted/postinstall/permissions
description: How to ensure your SAM app for CIPP has the correct permissions.
---

# Permissions

### Manual Permissions

At times you will need to change permissions for the CIPP-SAM application that is used by CIPP to access your tenants. Use the following instructions to update these permissions.

* Go to the [Azure Portal](https://portal.azure.com).
* Select [**Azure Active Directory**](https://portal.azure.com/#blade/Microsoft\_AAD\_IAM/ActiveDirectoryMenuBlade/Overview), now select [**App Registrations**](https://portal.azure.com/#blade/Microsoft\_AAD\_IAM/ActiveDirectoryMenuBlade/RegisteredApps).
* Find your Secure App Model application. You can search based on the Application ID.
* Go to **API Permissions** and select **Add a permission**.
* Choose "Microsoft Graph" and "Delegated permission" or "Application Permissions"
* Add the permission you need
* Finally, select "Grant Admin Consent" for Company Name.

### Permissions

For full functionality, CIPP needs the following permissions for the Secure Application Model registration. You can remove any permissions if you don't want the application to be able to use that functionality. This may cause you to see errors in the application.

{% hint style="info" %}
Duplicate Permissions Some permissions may appear duplicated in the Delegated and Application permissions tables below. This is _by design_ and you do need to add both permissions!&#x20;
{% endhint %}

{% hint style="warning" %}
Some permissions may come from other APIs than just Graph. you will see this both in the application, and the permission list below by having a name between brackets, e.g. (WindowsDefenderATP). This means you will need to click on "APIs my Organisation uses" instead of "Microsoft Graph" when adding these permissions.
{% endhint %}

<details>

<summary>Delegated Permissions</summary>

:::note List of **delegated permissions** used by CIPP:

:::

</details>

<details>

<summary>Application Permissions</summary>

:::note List of **application permissions** used by CIPP:

:::

</details>
