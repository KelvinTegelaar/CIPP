# Add Role

This page will allow you to create a new role from scratch.

{% stepper %}
{% step %}
### Name

Enter a unique name for the role
{% endstep %}

{% step %}
### (Optional) Group Assignment

Select an Entra ID group to assign to this role. This will automatically assign the CIPP role permissions to anyone added to this group.
{% endstep %}

{% step %}
### (Optional) Allowed Tenants

Select the tenants that you want this role to have access to. If you select `AllTenants` you will be given the option to select any blocked tenants if a restrictive list is easier to manage.
{% endstep %}

{% step %}
### (Optional) Blocked Endpoints

You can get more granular with your permissions to block specific CIPP API endpoints, such as `ExecJITAdmin` if you don't want this custom role to have access to creating JIT admin accounts in your clients' tenants
{% endstep %}

{% step %}
### Set API Permissions

Using the categories listed, select whether the custom role will have `None`, `Read`, or `Read/Write` access to each category of permissions. Use the Information icon next to each category to display the CIPP API endpoints included in each category.

{% hint style="warning" %}
Note that when creating a custom role to layer with the base role, any permission that you do not define will be evaluated as if you had selected `None`. If you want to preserve the functionality of the base role, be sure to select and option for every category.
{% endhint %}
{% endstep %}
{% endstepper %}

### Additional Information Regarding API Permissions

The `i` icon next to each API permissions category will open a flyout listing the CIPP API endpoints included in each category. This flyout will now also contain the `i` icon next to API endpoints where developers can add details regarding the function of the API. This will help clarify the endpoint's purpose if the name of the API endpoint is not clear.

***

{% include "../../../../../.gitbook/includes/feature-request.md" %}
