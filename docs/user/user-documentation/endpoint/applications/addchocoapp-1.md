---
description: Deploy applications using the Chocolatey package manager.
---

# Add Store App

You can add an application deployment utilising [Chocolatey](https://chocolatey.org/) by executing this wizard. The wizard guides you through the steps and provides the ability for you to deploy an app to many tenants at the same time.

If you have a personal repository you can enter the address for this repository too to deploy packages from your own trusted sources.

### Details

The status of the deployment can is traceable through the logs page, or the "Applications queue" page.

The application uploaded is [this prepared IntuneWin file](https://github.com/KelvinTegelaar/CIPP-API/blob/master/AddChocoApp/IntunePackage.intunewin?raw=true) with two scripts included - `install.ps1` and `uninstall.ps1`. These scripts install Chocolatey, and then run an install or uninstall command.

If you are unsure or don't trust the `IntuneWin` file, you have the option to replace this with your own in your fork.

It's strongly recommended that you download, test, and view the contents of the intunewin file.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/AddWinGetApp" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
