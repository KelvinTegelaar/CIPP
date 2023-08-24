# MFA Report

### Multi-Factor Authentication Report

This report lists all the users in the tenant and the status of the user in regards to Multi-Factor Authentication (MFA). For instance, it reports on whether they're enabled via Per-User MFA or enabled via Conditional Access or, whether it's enforced via Security Defaults.

Users with no MFA method configured show with a red highlight.

This report uses several Microsoft APIs to report on validity. The Condtional Access policies are checked for a claim of "MFA" inside of the policy. To check Per-User MFA status we use the MSOnline API. This API is deprecated for GDAP and you will not be able to retrieve data for per user MFA with this report. Also note that legacy per-user MFA reporting will be removed entirely in December 2023.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListMFAUsers" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}
