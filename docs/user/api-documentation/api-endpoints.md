# API Endpoints

CIPP-API is an Azure Function App operating as the logic layer for the CIPP platform. It is composed primarily of standard Azure Functions with a handful of Azure Durable Functions handling more complex actions (mostly applying standards and running tenant analysis).

API documentation is primarily intended to aid in further development of the CIPP platform. This API doc will most likely be outdated and we request users to help us keep this up to date.

## GET Requests

CIPP primarily facilitates interaction with its pages via HTTP GET requests. Although it is customary to manipulate data with POST commands, in some cases, GET requests can also modify data. This is particularly useful when incorporating a query parameter is more straightforward than creating a complex POST request body.

Each parameter specified in this section is consistently defined as a part of the URL's query string. For instance, it would be presented in the following format: `?ParameterName="Hello"`. This design choice enhances convenience and flexibility in our interface interactions.

### List commands



{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListExtensionsConfig" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListGenericTestFunction" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListTeams" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListDomains" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListUserMailboxRules" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListCalendarPermissions" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListLicenses" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListScheduledItems" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListApplicationQueue" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListApps" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListSharepointSettings" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListAlertsQueue" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListGroupTemplates" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListAutopilotconfig" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListServiceHealth" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListNotificationConfig" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListUserPhoto" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListConditionalAccessPolicies" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListBasicAuth" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListUserSigninLogs" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListDomainHealth" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListGDAPInvite" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListMailboxCAS" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListUserCounts" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListOrg" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListUsers" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListTeamsVoice" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListTeamsActivity" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListSpamFilterTemplates" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListBasicAuthAllTenants" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListAzureADConnectStatus" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListSharepointQuota" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListDefenderTVM" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListHaloClients" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListMFAUsers" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListSharedMailboxStatistics" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListLogs" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListIntuneTemplates" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListUserGroups" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListUserConditionalAccessPolicies" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListCAtemplates" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListContacts" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListMailboxRules" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListSites" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListSignIns" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListTenantDetails" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListPartnerRelationships" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListMailQuarantine" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListIntunePolicy" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListmailboxPermissions" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListDevices" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListTransportRulesTemplates" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListTenants" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListGenericAllTenants" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListStandards" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListDeletedItems" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListAppStatus" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListOAuthApps" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListDeviceDetails" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListGroups" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListMessageTrace" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListPhishPolicies" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListUserMailboxDetails" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListExConnectorTemplates" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListMailboxMobileDevices" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListUserDevices" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListMailboxes" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListTransportRules" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListExternalTenantInfo" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListAPDevices" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListGDAPRoles" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListMailboxStatistics" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListDefenderState" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListMailboxRulesAllTenants" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListNamedLocations" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListMFAUsersAllTenants" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListSharedMailboxAccountEnabled" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListSpamfilter" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Exec Commands

