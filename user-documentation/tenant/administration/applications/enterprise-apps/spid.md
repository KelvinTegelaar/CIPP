# View Enterprise Application

This page will display detail about an individual enterprise application. Basic information about the enterprise application is listed at the top along with a quick link to view the enterprise application in Entra.

## Page Actions

This drop down will display the actions from [..](../ "mention") with the exception of the one that launches this page.&#x20;

## View Enterprise App Tab

### Enterprise Application

This card will display basic information about the enterprise application including display name, IDs, etc.

### Credentials

Displays two cards that contain the password and certificate credentials, respectively. Credentials can be removed by using the table action.

### Owners

Displays app registration owners. The table includes an action that allows you to view the user in CIPP.

## Permissions Tab

This tab renders `requiredResourceAccess` from the Graph [`applications`](https://learn.microsoft.com/en-us/graph/api/resources/application?view=graph-rest-1.0#properties) object. These are broken out into Application and Delegated. Each of these is further broken out into the resource.

Permissions will be flagged with Critical, High, Medium, or Low to identify risk. Expanding the resource will also show the risk identifier next to the risky permissions.

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
