---
description: View and amend the settings for your CIPP instance.
---

# Application Settings

From the Settings section of the menu, you can find the Settings page where you can:

* Access diagnostic info
* Find helpful links to administrative tools
* Run access or permission checks
* Change configurable settings and more

<details>

<summary>Version</summary>

This will display the currently running Frontend and Backend versions of CIPP for your instance.

Click `Check For Updates` to check and see if there is a newer version of CIPP available with more features, standards, etc. for you to implement.

</details>

<details>

<summary>Cache</summary>

You can clear the cached information used by the tenant selector, best practices analyzer, and domain analyzer features.

{% hint style="warning" %}
Clearing this cache can severely impact performance of your CIPP instance and will also remove any personal settings such as the selected theme.
{% endhint %}

</details>

<details>

<summary>Password Style</summary>

Choose the default password style you would like to use for new user creation and password resets.

* **Classic:** This is the usual combination of letters and symbols to meet outdated complexity requirements
* **Correct-Battery-Horse:** This sets a passphrase of three random words connected by hyphens. These can often be easier to remember and type for users.

</details>

<details>

<summary>Backup</summary>

Click `Manage Backups` to launch the [backup.md](backup.md "mention") settings page.

</details>

<details>

<summary>DNS Resolver</summary>

You can switch providers to either Google, Cloudflare or Quad9 for your domain analyzer results.

</details>

<details>

<summary>Branding Settings</summary>

Customize your organization's branding for reports and documents. Changes will be applied to all generated reports.

Set your preferred:

* **Logo:** Recommended format is PNG. Max file size is 2MB. Optimal size is 200x100px.
* **Brand Color:** This color will be used for accents and highlights in reports

</details>

***

{% include "../../../.gitbook/includes/feature-request.md" %}
