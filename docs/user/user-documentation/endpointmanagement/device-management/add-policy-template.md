# Add Policy Template

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
