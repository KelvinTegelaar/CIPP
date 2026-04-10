# View App Registration

This page will display detail about an individual app registration. Basic information about the app registration is listed at the top along with a quick link to view the app registration in Entra.

## Page Actions

This drop down will display the actions from [.](./ "mention") with the exception of the one that launches this page.

## View App Registration Tab

### Application Details

This section will display basic information about the app registration, such as name, IDs, etc.

### Credentials

Displays two cards that contain the password and certificate credentials, respectively. Credentials can be removed by using the table action.

### Owners

Displays app registration owners. The table includes an action that allows you to view the user in CIPP.

### Enterprise App

Displays related service principal(s) for the app registration.

### Application Manifest

Displays a rendered view of the application manifest JSON.

## Permissions Tab

This tab renders `requiredResourceAccess` from the Graph [`applications`](https://learn.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0#properties) object. These are broken out into Application and Delegated. Each of these is further broken out into the resource.

Permissions will be flagged with Critical, High, Medium, or Low to identify risk. Expanding the resource will also show the risk identifier next to the risky permissions.

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
