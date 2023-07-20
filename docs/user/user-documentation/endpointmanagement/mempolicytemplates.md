---
id: mempolicytemplates
title: MEM (Intune) Policy Templates
slug: /usingcipp/endpointmanagement/mempolicytemplates
description: Deploy JSON formatted Intune policy templates to your Microsoft 365 tenants.
---

# MEM (Intune) Policy Templates

The following four pages in CIPP give you the ability to manage Microsoft Endpoint Manager (MEM):

### List Policies

This page lists all the MEM policies on the selected account and provides the ability for you to view the raw JSON of the policy.

#### Details <a href="#listmempolicies-details" id="listmempolicies-details"></a>

| Field         | Description                            |
| ------------- | -------------------------------------- |
| Name          | The name of the policy.                |
| Profile Type  | The type of policy.                    |
| Created On    | The creation date of the policy.       |
| Last Modified | The date the policy was last modified. |

#### Actions <a href="#listmempolicies-actions" id="listmempolicies-actions"></a>

* Edit Policy
* View Policy
* Delete Policy

#### Known Issues / Limitations <a href="#listmempolicies-knownissues" id="listmempolicies-knownissues"></a>

If you have any other issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=bug\_report.md\&title=BUG%3A+).



### Apply Policy

The Apply Policy wizard provides the ability for you to select one or more tenants and add a MEM policy to their MEM portal.

#### Details <a href="#applypolicy-details" id="applypolicy-details"></a>

The Apply Policy wizard can work in one of two ways:

1. You can select a template from a predefined policy that you have already created.
2. You can enter the raw JSON. Please note that information on how to obtain the raw JSON is available in the [Add Policy Template documentation](https://cipp.app/docs/user/usingcipp/endpointmanagement/mempolicytemplates/#add-policy-template)]

{% hint style="info" %}
Currently you can only apply new policies, applying policies doesn't update existing policies even if originally created from this template. To work around this you can apply the policy to "AllTenants" and have it reapplied on a schedule.
{% endhint %}

You can then decide whether to assign the policy to all users, all devices or both. You can also just create the policy without applying it.



### Add Policy Template

This page provides the ability for you to create a template policy you can deploy to many tenants at the same time, if so required.

#### Details <a href="#addmempolicytemplate-details" id="addmempolicytemplate-details"></a>

To create a policy and get it's raw JSON information you must visit [Microsoft Endpoint Manager](https://endpoint.microsoft.com).

* Go to **Devices -> Configuration Profiles**
* Create a new configuration profile
* Choose "Windows 10 and later" as a platform
* Choose "Templates" and then select any option.
* Select all the settings you want, remember that there are both computer policies and user policies.
* When you reach the Review and Create stage, don't select the "Create" button but press F12 on your keyboard to open the developer tools.
* Now select "Create" and look for the "UpdateDefiniationValues" post request for administrative templates, or any other POST request for other templates.
* Select "Payload" tab and scroll down to "request payload" this is the raw JSON payload. To copy it, select on "view source" and copy the entire text string.
* You can now use CIPP to deploy this policy to all tenants.

#### Known Issues / Limitations <a href="#addmempolicytemplate-knownissues" id="addmempolicytemplate-knownissues"></a>

* All templates are currently supported, if you don't see your template type in the list, you must select Custom Configuration
* When using Settings Catalog or Custom Configuration, the Display Name and Description come from the raw JSON file.

If you have any other issues, [please report a bug](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=bug\_report.md\&title=BUG%3A+).



### List Policy Templates

This page gives you the ability to view all configured templates, in addition to viewing the raw JSON and the type of policy.

#### Details <a href="#listmempolicytemplates-details" id="listmempolicytemplates-details"></a>

| Field        | Description                                       |
| ------------ | ------------------------------------------------- |
| Display Name | The name of the template.                         |
| Description  | The description for the template.                 |
| Type         | The template type, for example Catalog or Device. |

#### Actions <a href="#listmempolicytemplates-actions" id="listmempolicytemplates-actions"></a>

* View Template
* Delete Template

####
