# App Consent Requests

This page shows all the app consent requests that have been made in the tenant.

{% hint style="warning" %}
**Please note:** App consent requests are only available for tenants that have disabled user consent for applications or have the `Require admin consent for applications` standard enabled.\
To not miss any requests, it is recommended to set up the Scripted CIPP Alert `Alert on new apps in the application approval list`.
{% endhint %}

### App Consent Request Table Filters

This will allow you to modify the Request Status types displayed in the table below. Options are `All`, `Pending`, `Expired`, and `Completed`.

### Table Details

The properties returned are for the Graph resource type `appConsentRequest`. For more information on the properties please see the [Graph documentation](https://learn.microsoft.com/en-us/graph/api/resources/appconsentrequest?view=graph-rest-1.0#properties).

### Table Actions

<table><thead><tr><th>Action</th><th>Description</th><th data-type="checkbox">Bulk Action Available</th></tr></thead><tbody><tr><td>Review in Entra</td><td>Opens Entra ID to the request for you to review further</td><td>false</td></tr><tr><td>Approve in Entra</td><td>Opens Entra ID to approve the request</td><td>false</td></tr><tr><td>More Info</td><td>Opens the Extended Info flyout</td><td>false</td></tr></tbody></table>

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
