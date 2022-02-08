---
id: structure
title: CIPP API project structure.
description: An overview of the various files / folders of note in the CIPP API project.
slug: /cipp-api/structure
---

So you've got two repositories now (assuming you followed the [setting up](../../settingup/) guide.) let's take a look at what's in the `CIPP-API` folder so we know where to look once we start coding.

## The Root

In the `CIPP-API` directory itself we have a number of files and folders, we're going to highlight the unusual ones here but first the general structure of most of the folders is:

| Item               | Description                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| function.json      | A JSON file containing the function type and binding information.                                                   |
| run.ps1            | A PowerShell script file containing the function code itself.                                                       |

So what have we got besides functions in terms of important files?

| Item                | Description                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ConversionTable.csv | Holds information on Microsoft 365 licensing and product names used in other functions.                             |
| DNSHelper.psm1      | A custom PowerShell module providing DNS functions used by the Domain Analysers.                                    |
| GraphHelper.psm1    | A custom PowerShell module providing Microsoft Graph helper functions used by most functions.                       |
| host.json           | Contains host configuration for the PowerShell function app host.                                                   |
| profile.ps1         | PowerShell profile to import modules and setup the environment for the PowerShell function.                         |
| requirements.psd1   | Lists required PowerShell modules and their versions used in the functions app.                                     |
| version_latest.txt  | Our version file. This gets incremented just before `dev` is merged into `main` for a new release.                  |
