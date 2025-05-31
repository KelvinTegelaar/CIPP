# Add JIT Admin

This page allows you to create a new JIT admin

| Option              | Description                                                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant selection    | Use the dropdown to select the tenant for JIT Admin access                                                                                                                                               |
| User selection      | Select if you would like to create a new user or use an existing user                                                                                                                                    |
| Start Date          | Sets the start date for JIT Admin access                                                                                                                                                                 |
| End Date            | Sets the end date and time for JIT Admin access                                                                                                                                                          |
| Roles               | Select the Entra ID admin roles you want assigned to the user. Remember: Use the principle of least privilege to only assign the role with the minimum set of permissions needed to complete your tasks. |
| Generate TAP        | Set this option to generate a Temporary Access Pass (TAP) to to satisfy the need for strong authentication/MFA                                                                                           |
| Expiration Action   | Select what you want to happen to the user at expiration of the JIT admin access requested.                                                                                                              |
| Notification Action | Select the option or options for how you would like to be notified of JIT admin creation. Note that only options that are configured in CIPP settings will work.                                         |

{% hint style="warning" %}
To use Temporary Access Passes (TAP), you must enable the authentication method in the customer tenant. \
This can be done easily via the CIPP Entra Standard: ["Enable Temporary Access Passwords"](broken-reference)
{% endhint %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
