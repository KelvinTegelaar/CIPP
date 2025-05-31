# Map GDAP Roles

This page will allow you to map the GDAP roles to a group in your partner tenant. The default is that the group will be created with the format of "M365 GDAP RoleName". You can optionally create your own group suffix if you have a need to map the same role to multiple groups (e.g. you use different group templates to provide different access by department, etc.).

Click "Add CIPP Default Roles" to automatically add the 15 recommended roles from the [Recommended Roles](../../../../setup/installation/recommended-roles.md) page.

{% hint style="danger" %}
Certain roles may not be compatible with GDAP. See the [Microsoft documentation](https://learn.microsoft.com/en-us/partner-center/customers/gdap-least-privileged-roles-by-task) on GDAP role guidance. Unsupported roles are not available in CIPP to prevent random errors due to these roles being added to relationships.
{% endhint %}

{% hint style="danger" %}
The Company Administrator role is a highly privileged role that should be used with caution. GDAP Relationships with this role will not be eligible for auto-extend.
{% endhint %}

***

{% include "../../../../.gitbook/includes/feature-request.md" %}
