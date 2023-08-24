---
description: API Authentication
---

# Setup & Authentication

### Enable the API

{% hint style="info" %}
Hosted clients can request enablement of the API via the helpdesk.
{% endhint %}

To enable the CIPP-API you'll need to activate the CIPP API Extension via the Settings -> Extensions menu.

Enabling the CIPP API requires the following:

* Your CIPP-SAM user must be a global administrator in your tenant when activating the API
* Your CIPP-SAM Application requires an extra permission
  * Go to your CIPP-SAM application via Settings -> Execute a permissions check -> Click Details -> Click on the CIPP SAM Link
  * Click on Add permission and add Azure Service Management - User Impersonation as a Delegate permission.
* Your CIPP-SAM user must have access to the Azure Subscription with the minimum level of "contributor" during activation of the API:
  1. Sign in to the Azure portal: [https://portal.azure.com/](https://portal.azure.com/)
  2. In the left-hand menu, navigate to "Subscriptions".
  3. Click on the subscription where you want to add a user.
  4. In the left-hand menu of the subscription, select "Access control (IAM)".
  5. At the top of the Access control (IAM) pane, click "+ Add".
  6. In the drop-down menu, select "Add role assignment".
  7. In the "Role" drop-down list, type "Contributor" and select it. The Contributor role should allow the user to create and manage all types of Azure resources but does not allow them to grant access to others.
  8. In the "Assign access to" drop-down menu, select "User, group, or service principal".
  9. In the "Select" field, type "CIPP-SAM". As you begin typing, the list of options will narrow. If the user CIPP-SAM exists in your Azure AD, you should be able to select it.
  10. After you've selected the user, click "Save" to assign the role.
* After enablement of the API a new application will be created in your tenant.

### Authentication

CIPP uses OAuth authentication to be able to connect to the API using your Application ID and secret. You can use the PowerShell example below to connect to the API

```powershell
$CIPPAPIUrl = "https://yourcippurl.com"
$ApplicationId = "your application ID"
$ApplicationSecret = "your application secret"
$TenantId = "your tenant id"

$AuthBody = @{
    client_id     = $ApplicationId
    client_secret = $ApplicationSecret
    scope         = "api://$($ApplicationId)/.default"
    grant_type    = 'client_credentials'
}
$token = Invoke-RestMethod -Uri "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token" -Method POST -Body $AuthBody



$AuthHeader = @{ Authorization = "Bearer $($token.access_token)" }
Invoke-RestMethod -Uri "$CIPPAPIUrl/api/ListLogs" -Method GET -Headers $AuthHeader -ContentType "application/json"

```

### Time and rate limits

The API actions have a maximum timeout of 10 minutes. There are no active ratelimits, but heavy usage of the API can cause frontend operations to slow down.

## Endpoint documentation

Each page in the user documentation has a list of the endpoints used to load or create data on that specific page
