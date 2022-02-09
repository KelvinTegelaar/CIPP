---
id: mempolicytemplates
title: MEM (Intune) Policy Templates
description: Deploy JSON formatted Intune policy templates to your Microsoft 365 tenants.
slug: /usingcipp/endpointmanagement/mempolicytemplates
---

## Overview

The Microsoft Endpoint Manager (MEM) functionality in CIPP is split into the following four pages:

### List Policies - Overview

This page lists all the MEM policies on the selected account and provides the ability for you to view the raw JSON of the policy.

### List Policies - Detail

|  Field                 | Description                                          |
| -----------------------| ---------------------------------------------------  |
| Name                   | The name of the policy.                              |
| Profile Type           | The type of policy.                                  |
| Created On             | The creation date of the policy.                     |
| Last Modified          | The date the policy was last modified.               |

#### Actions

* Edit Policy
* View Policy
* Delete Policy

### List Policies - Known Issues / Limitations

* Edit Policy currently throws a 500 error

 If you have any other issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

---

### Apply Policy - Overview

The Apply Policy wizard provides the ability for you to select one or more tenants and add a MEM policy to their MEM portal.

### Apply Policy - Detail

The Apply Policy wizard can work in one of two ways:

1. You can select a template from a predefined policy that you have already created.
1. You can enter the raw JSON. Please note that information on how to obtain the raw JSON is available in the [Add Policy Template documentation](/docs/user/usingcipp/endpointmanagement/mempolicytemplates/#add-policy-template---detail)]

You can then decide whether to assign the policy to all users, all devices or both. You can also just create the policy without applying it.

### Apply Policy - Known Issues / Limitations

No known issues exist for the Apply MEM Policy page. If you have any issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

---

### Add Policy Template - Overview

This page provides the ability for you to create a template policy you can deploy to many tenants at the same time, if so required.

### Add Policy Template - Detail

To create a policy and get it's raw JSON information you must visit the [Microsoft Endpoint Manager admin center](https://endpoint.microsoft.com).

* Go to **Devices -> Configuration Profiles**
* Create a new configuration profile
* Choose "Windows 10 and later" as a platform
* Choose "Templates" and then select any option.
* Select all the settings you want, remember that there are both computer policies and user policies.
* When you reach the Review and Create stage, don't select the "Create" button but press F12 on your keyboard to open the developer tools.
* Now select "Create" and look for the "UpdateDefiniationValues" post request for administrative templates, or any other POST request for other templates.
* Select "Headers" and scroll down to "request payload" this is the raw JSON payload. To copy it, select on "view source" and copy the entire text string.
* You can now use CIPP to deploy this policy to all tenants.

### Add Policy Template - Known Issues / Limitations

* All templates are currently supported, if you don't see your template type in the list, you must select Custom Configuration
* When using Settings Catalog or Custom Configuration, the Display Name and Description are taken from the raw JSON file.

If you have any other issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).

---

### List Policy Templates - Overview

This page allows you to view all the templates that you have configured, as well as viewing the raw JSON and the type of policy.

### List Policy Templates - Detail

* Delete Policy Template

He sells sea shells by her shore

### List Policy Templates - Known Issues / Limitations

No known issues exist for the Policy Templates page. If you have any issues, [please report this as a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=&template=bug_report.md&title=BUG%3A+).
