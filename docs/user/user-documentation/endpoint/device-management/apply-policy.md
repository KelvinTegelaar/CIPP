# Apply Policy

### Apply Policy

The Apply Policy wizard provides the ability for you to select one or more tenants and add a MEM policy to their MEM portal.

#### Details <a href="#applypolicy-details" id="applypolicy-details"></a>

The Apply Policy wizard can work in one of two ways:

1. You can select a template from a predefined policy that you have already created.
2. You can enter the raw JSON. Please note that information on how to obtain the raw JSON is available in the [Add Policy Template documentation](https://cipp.app/docs/user/usingcipp/endpointmanagement/mempolicytemplates/#add-policy-template)]

{% hint style="info" %}
Currently you can only apply new policies, applying policies doesn't update existing policies even if originally created from this template. To work around this you can apply the policy to "AllTenants" and have it reapplied on a schedule.
{% endhint %}

You can then decide whether to assign the policy to all users, all devices or both. You can also just create the policy without applying it.

### API Calls

The following APIs are called on this page:

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/ListIntuneTemplates" method="get" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

{% swagger src="../../../.gitbook/assets/openapicipp.json" path="/AddPolicy" method="post" %}
[openapicipp.json](../../../.gitbook/assets/openapicipp.json)
{% endswagger %}

### Feature Requests / Ideas

Please raise any [feature requests](https://github.com/KelvinTegelaar/CIPP/issues/new?assignees=\&labels=\&template=feature\_request.md\&title=FEATURE+REQUEST%3A+) on GitHub.
