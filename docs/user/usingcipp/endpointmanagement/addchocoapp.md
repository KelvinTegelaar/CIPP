---
id: addchocoapp
title: Add Chocolatey App
description: Deploy applications using the Chocolatey package manager.
slug: /usingcipp/endpointmanagement/addchocoapp
---

## Overview

You can add an application deployment utilising [Chocolatey](https://chocolatey.org/) by executing this wizard. The wizard will guide you through the steps and allow you to deploy an app to multiple tenants at the same time.

If you have a personal repository you can enter the URL for this repo too to deploy packages from your own trusted sources.

## Details

Adding the Chocolatey App is done asynchronously. This means that the wizard will make sure everything is setup, and start the process after you've hit the deploy button. The status of the deployment can be traced through the logs page.

The application we upload is [this prepared intunewin file](https://github.com/KelvinTegelaar/CIPP-API/blob/master/AddChocoApp/IntunePackage.intunewin?raw=true) with two scripts included - `install.ps1` and `uninstall.ps1`. These scripts install Chocolatey, and then run an install or uninstall command.

If you are unsure or don't trust the `intunewin` file, you can always replace this with your own in your fork, you can also download and test, and view the contents of this `intunewin` file.


## Current known issues / Limitations

There are currently no known issues with the Add Choco App page.  If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
