# API Endpoints

CIPP-API is an Azure Function App operating as the logic layer for the CIPP platform. It is composed primarily of standard Azure Functions with a handful of Azure Durable Functions handling more complex actions (mostly applying standards and running tenant analysis).

API documentation is primarily intended to aid in further development of the CIPP platform. This API doc will most likely be outdated and we request users to help us keep this up to date.

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListConditionalAccessPolicies" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListAPDevices?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListApps?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListAppStatus?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListAutopilotConfig?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListBasicAuth?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListContacts?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListDefenderstate?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListDevices?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListDomains?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListDomainTests" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListGroups?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListIntunePolicy?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListLicenses?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListLogs" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListMailboxCas?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListMailboxes?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListMailboxMobileDevices?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListMailboxPermissions?TenantFilter={tenantId}&userId={userId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListMailboxStatistics?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListMessageTrace?TenantFilter={tenantId}&days={days}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListMFAStatus?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListPhishPolicies?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListRoles?TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListSites?type=SharePointSiteUsage&TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListStandards" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListTeams?type=list&TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListTeamsActivity?type=TeamsUserActivityUser&TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListTeamsVoice&TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListTenants" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListUserConditionalAccessPolicies?userId={userId}&TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListUserDevices?userId={userId}&TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListUserGroups?userId={userId}&TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListUserMailboxDetails?userId={userId}&TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListUsers?userId={userId}&TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.yaml" path="/ListUserSigninLogs?userId={userId}&TenantFilter={tenantId}" method="get" %}
[openapicipp.yaml](../.gitbook/assets/openapicipp.yaml)
{% endswagger %}
