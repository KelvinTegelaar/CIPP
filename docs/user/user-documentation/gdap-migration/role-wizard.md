# Role Wizard

### Recommended Roles:

As CIPP is an application that touches many parts of M365 selecting the roles might be difficult. The following roles are recommended for CIPP, but you may experiment with less permissive groups at your own risk.

* Application Administrator
* User Administrator
* Intune Administrator
* Exchange Administrator
* Security Administrator
* Cloud App Security Administrator
* Cloud Device Administrator
* Teams Administrator
* Sharepoint Administrator
* Authentication Policy Administrator
* Privileged Role Administrator
* Privileged Authentication Administrator (Only required if you want to be able to delete global admins within tenants from CIPP)

### API Calls

The following APIs are called on this page:

{% swagger src="../../.gitbook/assets/openapicipp.json" path="/ExecAddGDAPRole" method="post" %}
[openapicipp.json](../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=&labels=enhancement%2Cno-priority&projects=&template=feature.yml&title=%5BFeature+Request%5D%3A+) on GitHub.
