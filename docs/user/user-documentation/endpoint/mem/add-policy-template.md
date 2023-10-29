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

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListGraphRequest" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/AddPolicy" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
