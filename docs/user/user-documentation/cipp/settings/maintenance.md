---
description: Performs administrative tasks to maintain the CIPP function app.
---

# Maintenance

You can use the scripts listed on this tab to streamline administrative tasks using PowerShell. We advise using Azure Cloud Shell to ensure that all the necessary pre-requisites are met. These scripts are tested for PowerShell 7.2.

### Maintenance Scripts

#### Clear-TokenCache.ps1

This script automates the [Clear Token Cache](../../../../general/troubleshooting/#clear-token-cache) troubleshooting task.

#### Grant-CippConditionalAccess.ps1

This script assists with excluding CIPP from customer conditional access policies. A new named location is created in their Azure portal with all of the IP addresses that CIPP uses and is set to trusted. You can optionally add this location to existing policies.

#### Migrate-CippStorage.ps1

This script will automate the process of converting the function app storage from v2 to v1 in accordance with [Microsoft's official recommendation](https://docs.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-storage-providers#azure-storage). This script may need to be run multiple times to fully complete the migration, make sure to save the contents to a file before reloading the web page.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/PublicScripts" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ExecMaintenanceScripts" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
