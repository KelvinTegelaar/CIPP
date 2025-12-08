# Add Permission Set

This page will allow you to create a new application permission set of Microsoft Graph permissions.

Set a name for your new permission set, optionally import from an existing permission set, optionally add a service principal, and select the application and delegated permissions to add to the set.

{% stepper %}
{% step %}
### Name the Permission Set


{% endstep %}

{% step %}
### (Optional) Import from an Existing Permission Set


{% endstep %}

{% step %}
### (Optional) Select a Service Principal

Click the refresh button next to the drop down to pull in updated results from Graph.&#x20;

{% hint style="info" %}
The form will default to Microsoft Graph. To select additional service principals (such as Microsoft SharePoint Online), select your desired service principal and click the `+` button to the right of the dropdown.
{% endhint %}
{% endstep %}

{% step %}
### Select Permissions

Select both Application and Delegated permissions for any of the selected service principals.
{% endstep %}

{% step %}
### Click "Save Changes" Button


{% endstep %}

{% step %}
### Click "Save" Button


{% endstep %}
{% endstepper %}

{% hint style="success" %}
Now you can use [add.md](../templates/add.md "mention")to create a template to deploy this permissions set with the app you want to select.
{% endhint %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
