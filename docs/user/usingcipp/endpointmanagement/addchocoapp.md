---
id: addchocoapp
title: Add Chocolatey App
description: Deploy applications using the Chocolatey package manager.
slug: /usingcipp/endpointmanagement/addchocoapp
---

You can add an application deployment utilising [Chocolatey](https://chocolatey.org/) by executing this wizard. The wizard will guide you through the steps. If you have a personal repository you can enter the URL for this repo too to deploy packages from your own trusted sources.

Adding the Chocolatey App is done asynchronously. This means that the wizard will make sure everything is setup, and start the process after you've hit the deploy button. The status of the deployment can be traced through the logs page.

The application we upload is [this prepared intunewin file](https://github.com/KelvinTegelaar/CIPP-API/blob/master/AddChocoApp/IntunePackage.intunewin?raw=true) with two scripts included - `install.ps1` and `uninstall.ps1`. These scripts install Chocolatey, and then run an install or uninstall command.

If you are unsure or don't trust the `intunewin` file, you can always replace this with your own in your fork, you can also download and test, and view the contents of this `intunewin` file.

## Current known issues / Limitations

None. This should work as expected. If you have any issues. Please report this as a bug.
