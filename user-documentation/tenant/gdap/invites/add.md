# New Invite

### Generating Invites

{% hint style="info" %}
This will ensure that the correct roles are mapped to the GDAP relationship, and test that the CIPP-SAM application is correctly pushed to the tenant.\
The invite wizard is part of the Tenant Onboarding flow, unless an already existing pending invite is selected.
{% endhint %}

{% hint style="warning" %}
**Please note:** Any other user that needs to gain access to your Microsoft CSP Tenants will need to be manually added to these groups.\
To easily add users to these groups, you can do the following

* Create a new security group in your partner tenant with the `Microsoft Entra roles can be assigned to the group` option set to yes. Ex. GDAP\_CIPP\_Recommended\_Roles
* Add the users to the created group
* Add the created group to the individual GDAP security groups that CIPP created for you. Ex. M365 GDAP Exchange Administrator
{% endhint %}

If multiple invites are generated, but not used, the unused ones can either be found on the [GDAP Relationships](../relationships.md) page or on the [Invite list](./) page. Here onboarding of the tenant can be started again. The invite needs to be accepted by a Global Administrator in the customer tenant.

All mapped [GDAP roles](../roles/) can be selected from the list, or you can the "Use CIPP recommended roles and settings" option to go with the recommended roles.

***

### Feature Requests / Ideas

We value your feedback and ideas. Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=enhancement%2Cno-priority\&projects=\&template=feature.yml\&title=%5BFeature+Request%5D%3A+) on GitHub.
