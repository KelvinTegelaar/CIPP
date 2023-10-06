---
description: About the Dashboard which includes versions and quick links
---

# CIPP Dashboard

The Home page provides a comprehensive overview of the current tenant's details and allows you to perform various actions related to the tenant and its resources.

The Home page includes the following sections:

* Lighthouse Search: This is a universal search bar that allows you to quickly find the information you need.
* Total Users: Displays the total number of users in the current tenant.
* Total Licensed Users: Displays the total number of licensed users in the current tenant.
* Global Admin Users: Shows the number of users with Global Admin rights.
* Total Guests: Shows the total number of guest users in the current tenant.
* Current Tenant: Displays various details about the current tenant, including name, ID, default domain name, status, creation date, AD Connect status, domains, capabilities, Sharepoint quota, applied standards, and partner relationships.
* Portals: Contains links to various Microsoft 365 administration centers.
* CIPP Actions: Contains links to various CIPP actions like editing the tenant, listing users, groups, and devices, and creating users and groups.

### API Calls

The following APIs are called on this page:



{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListUserCounts" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListOrg" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListSharepointQuota" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../.gitbook/assets/openapicipp.json" path="/ListStandards" method="get" %}
[openapicipp.json](../.gitbook/assets/openapicipp.json)
{% endswagger %}
