---
id: mempolicytemplates
title: MEM (Intune) Policy Templates
description: Deploy JSON formatted Intune policy templates to your Microsoft 365 tenants.
slug: /usingcipp/endpointmanagement/mempolicytemplates
---

## Overview

There are four main pages to the MEM page within the CIPP App

### List Policies - Overview

This page lists all the MEM policies on the selected account and allows you to view the RAW Json of said policy

### List Policies - Detail

This table uses expanded rows - so when you click on a policy, you are able to see the raw JSON of the selected policy.

#### Actions

* Edit Policy

### List Policies - Current known issues / Limitations

* Edit Policy currently throws a 500 error

 If you have any further issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

---

### Apply Policy - Overview

The Apply Policy wizard allows you to select one or multiple tenants and add an MEM policy to their MEM portal.

### Apply Policy - Detail

The wizard can work in one of two ways, either by selecting a template from a predefined policy that you have already created, or by entering the raw JSON.  Please note that both adding of the template and how to obtain the raw JSON can be see by viewing the [Add Policy Template docuemtnation](/docs/user/gettingstarted/endpointmanagement/mempolicytemplates/#)]

You can then decide whether to assign the policy to all users, all devices or both - or alternatively none at all.

### Apply Policy - Current known issues / Limitations

There are currently no known issues with the Apply MEM Policy page.  If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

---

### Add Policy Template - Overview

This page allows you to create a template policy that can be pushed out to multiple tenants at the same time, if so required

### Add Policy Template - Detail

To create a policy and get it's raw JSON information you'll have to go to the [endpoint.microsoft.com](https://endpoint.microsoft.com) portal.

* Go to Devices -> Configuration Profiles
* Create a new configuration profile
* Choose "Windows 10 and later" as a platform
* Choose "Templates" and then select any option.
* Select all the settings you want, remember that there are both computer policies and user policies.
* at Review and Create, do not click on the "Create" button but press F12 on your keyboard to open the developer tools.
* Now click on "Create" and look for the "UpdateDefiniationValues" post request for administrative templates, or any other POST request for other templates.
* Click on "Headers" and scroll down to "request payload". this is the raw JSON paylow. To easily copy it, click on "view source" and copy the entire text string.
* You can now use CIPP to deploy this policy to all tenants.


### Add Policy Template - Current known issues / Limitations

* All templates are currently supported, if you do not see your template type in the list, you must select Custom Configuration
* When using Settings Catalog or Custom Configuration, the Display Name and Description are using from the raw JSON file.

If you have any further issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

---

### List Policy Templates - Overview

This page allows you to view all the templates that you have configured, as well as viewing the raw JSON and what type of policy it is.

### List Policy Templates - Detail

* Delete Policy Template

### List Policy Templates - Current known issues / Limitations

There are currently no known issues with the Policy Templates page.  If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
