# Add Permission Set

This page will allow you to create a new application permission set of Microsoft Graph permissions.

Set a name for your new permission set, optionally import from an existing permission set, optionally add a service principal, and select the application and delegated permissions to add to the set.

#

1. Navigate to "Tenant Administration" > "Applications" > "Permission Sets" > Click on "Add permission set".
2. Name the permission set.

   Now you can start configuring the relevant permissions, this a template not the app itself, you only apply the permissions you want, then once the permissions template is configured you can then use https://docs.cipp.app/user-documentation/tenant/administration/templates/add to deploy the permisisons + the app.

   Use "Add a service principal" for permissions that are outside of Microsoft Graph. (When you open the permissions template, Microsoft Graph is the default) If you wanted to add SharePoint, for example, you would click into the box for "Add a service principal," search the relevant app and add the permissions.

   If you need to add multiple service principals, add them first, then add the permissions.
   After you've added the permissions, ensure you "Save changes".

3. Click Save once you've made all the changes needed. Now you can use https://docs.cipp.app/user-documentation/tenant/administration/templates/add to create a template to deploy permisisons with the app you want to select.

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
